<?php
// server/tools/db-admin.php
//
// Shared helpers for the maintenance scripts: backup, restore, and applying a
// .sql file safely. Used by backup.php, restore.php and update.php.
//
// These are CLI-only scripts. They are never reachable over HTTP, and the web
// entry point (router.php) does not serve them.

declare(strict_types=1);

require_once __DIR__ . '/../config/env.php';

// The database name and server come from .env, never from a literal in this
// file. They are functions rather than constants because a PHP const cannot be
// initialised from a function call, and dbConfig() is a function call.
function dbName(): string
{
    return dbConfig()['database'];
}

function dbServer(): string
{
    return dbConfig()['server'];
}

// Where the finished .bak files are kept, inside the project.
const PROJECT_BACKUP_DIR = __DIR__ . '/../../backups';

// Cached connection settings, read once.
$dbConfig = dbConfig();

/**
 * A connection to master, for administrative work.
 *
 * master, NOT comshop, and that matters. RESTORE has to put comshop into single
 * user mode, which disconnects every other session. A connection sitting in
 * comshop would be killed by its own statement; one sitting in master survives
 * and can finish the job.
 */
function adminPdo(): PDO
{
    static $pdo = null;

    if ($pdo === null) {
        global $dbConfig;

        $pdo = new PDO(
            'sqlsrv:Server=' . $dbConfig['server'] . ';Database=master;',
            $dbConfig['username'],
            $dbConfig['password'],
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            ]
        );
    }

    return $pdo;
}

/** A connection to the application database itself. */
function appPdo(): PDO
{
    global $dbConfig;

    return new PDO(
        'sqlsrv:Server=' . $dbConfig['server'] . ';Database=' . $dbConfig['database'] . ';',
        $dbConfig['username'],
        $dbConfig['password'],
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]
    );
}

/**
 * Where SQL Server itself is allowed to write backups.
 *
 * This is deliberately NOT the project folder. The SQL Server service account
 * generally cannot write into a user's Desktop or profile directory, so
 * BACKUP DATABASE straight to C:\Users\...\backups would fail with an
 * operating-system permission error. We write where the service is allowed to,
 * then copy the finished file across with PHP, which runs as the user and can
 * write there.
 */
function serverBackupDir(PDO $pdo): string
{
    $path = $pdo->query("SELECT CAST(SERVERPROPERTY('InstanceDefaultBackupPath') AS NVARCHAR(4000))")
        ->fetchColumn();

    return rtrim((string) $path, "\\/");
}

/** A timestamped backup filename. */
function backupFileName(): string
{
    return dbName() . '-' . date('Y-m-d_His') . '.bak';
}

function ensureProjectBackupDir(): string
{
    if (!is_dir(PROJECT_BACKUP_DIR) && !mkdir(PROJECT_BACKUP_DIR, 0777, true) && !is_dir(PROJECT_BACKUP_DIR)) {
        throw new RuntimeException('Could not create ' . PROJECT_BACKUP_DIR);
    }

    return realpath(PROJECT_BACKUP_DIR);
}

/**
 * Copy a file, retrying briefly.
 *
 * WHY THIS EXISTS. SQL Server keeps its .bak file open for a short moment after
 * BACKUP DATABASE returns. A copy attempted in that window fails, and the
 * failure looks like a permissions problem when it is really a race. The first
 * run of backup.php succeeded and the second failed on the identical path,
 * which is what gave it away. A few short retries turn a flaky failure into a
 * non-event.
 *
 * @param int $attempts total tries, not retries
 */
function copyWithRetry(string $source, string $destination, int $attempts = 6, int $delayMs = 400): bool
{
    for ($i = 1; $i <= $attempts; $i++) {
        if (@copy($source, $destination)) {
            return true;
        }

        if ($i < $attempts) {
            usleep($delayMs * 1000);
        }
    }

    return false;
}

/**
 * Take a full backup of comshop and copy it into the project's backups folder.
 *
 * @return string the path of the .bak that was written
 */
function backupDatabase(): string
{
    $pdo = adminPdo();
    $fileName = backupFileName();

    $serverDir = serverBackupDir($pdo);

    if ($serverDir === '') {
        throw new RuntimeException('Could not determine the SQL Server backup directory.');
    }

    $serverPath = $serverDir . '\\' . $fileName;

    // WITH INIT overwrites, so a same-named file cannot block the backup.
    $stmt = $pdo->prepare('BACKUP DATABASE [' . dbName() . '] TO DISK = ? WITH FORMAT, INIT, NAME = ?');
    $stmt->execute([$serverPath, 'CyberShopOS full backup ' . date('Y-m-d H:i:s')]);

    $projectDir = ensureProjectBackupDir();
    $projectPath = $projectDir . '\\' . $fileName;

    // The SQL Server service wrote the file; PHP owns the copy into the project.
    if (!copyWithRetry($serverPath, $projectPath)) {
        throw new RuntimeException(
            "Backup was written by SQL Server to:\n  $serverPath\nbut could not be copied to:\n  $projectPath\n" .
            'The backup itself SUCCEEDED - copy that file by hand.'
        );
    }

    @unlink($serverPath);

    return $projectPath;
}

/** Every .bak in the project backups folder, newest first. */
function listBackups(): array
{
    if (!is_dir(PROJECT_BACKUP_DIR)) {
        return [];
    }

    $files = glob(PROJECT_BACKUP_DIR . '\\*.bak') ?: [];
    rsort($files);

    return array_map(static fn(string $path): array => [
        'file' => basename($path),
        'size' => round(filesize($path) / 1048576, 2) . ' MB',
        'date' => date('Y-m-d H:i:s', filemtime($path)),
    ], $files);
}

/**
 * Restore comshop from a .bak in the project backups folder.
 *
 * The file is copied into the SQL Server backup directory first, because the
 * service account cannot read the project folder.
 */
function restoreDatabase(string $fileName): void
{
    // Reject anything that is not a plain filename in the backups folder.
    if (!preg_match('/^[A-Za-z0-9._-]+\.bak$/', $fileName)) {
        throw new RuntimeException('Not a valid backup filename: ' . $fileName);
    }

    $source = PROJECT_BACKUP_DIR . '\\' . $fileName;

    if (!is_file($source)) {
        throw new RuntimeException('No such backup: ' . $fileName);
    }

    $pdo = adminPdo();
    $serverPath = serverBackupDir($pdo) . '\\' . $fileName;

    if (!copyWithRetry($source, $serverPath)) {
        throw new RuntimeException('Could not stage the backup where SQL Server can read it.');
    }

    try {
        // Kicks any other session off comshop  including a running php -S that
        // still holds a connection. Without this the restore fails.
        $pdo->exec('ALTER DATABASE [' . dbName() . '] SET SINGLE_USER WITH ROLLBACK IMMEDIATE');

        $stmt = $pdo->prepare('RESTORE DATABASE [' . dbName() . '] FROM DISK = ? WITH REPLACE, RECOVERY');
        $stmt->execute([$serverPath]);
    } finally {
        try {
            $pdo->exec('ALTER DATABASE [' . dbName() . '] SET MULTI_USER');
        } catch (PDOException $e) {
            // Nothing useful to do if even this fails; the restore outcome
            // matters more and will be reported by the caller.
        }

        @unlink($serverPath);
    }
}

/**
 * Split a .sql file into batches and run each one.
 *
 * GO is an SSMS/sqlcmd batch separator, not T-SQL, so it has to be handled here.
 * Comment-only lines are dropped; inline comments are left alone, because
 * stripping them correctly requires real parsing.
 *
 * @return int number of statements executed
 */
function applySqlFile(string $path): int
{
    if (!is_file($path)) {
        throw new RuntimeException('No such file: ' . $path);
    }

    $sql = file_get_contents($path);

    if ($sql === false) {
        throw new RuntimeException('Could not read: ' . $path);
    }

    $batches = [];
    $current = [];

    foreach (preg_split('/\R/', $sql) as $line) {
        $trimmed = trim($line);

        if ($trimmed === '' || str_starts_with($trimmed, '--')) {
            continue;
        }

        if (preg_match('/^GO$/i', $trimmed) === 1) {
            if ($current !== []) {
                $batches[] = implode("\n", $current);
                $current = [];
            }
            continue;
        }

        $current[] = $line;
    }

    if ($current !== []) {
        $batches[] = implode("\n", $current);
    }

    $pdo = appPdo();
    $ran = 0;

    foreach ($batches as $batch) {
        // A statement that only reports (SELECT / PRINT) is run and shown rather
        // than treated as DDL.
        if (preg_match('/^(SELECT|PRINT)\b/i', ltrim($batch)) === 1) {
            $trimmed = rtrim($batch, "; \t\n\r");

            if (preg_match('/^SELECT\b/i', $trimmed) === 1) {
                foreach ($pdo->query($trimmed)->fetchAll() as $row) {
                    echo '    ' . json_encode($row) . "\n";
                }
            } else {
                $pdo->exec($trimmed);
            }

            $ran++;
            continue;
        }

        $pdo->exec($batch);
        $ran++;
    }

    return $ran;
}

/**
 * What the database looks like right now, for before/after comparison.
 *
 * Shape (tables, columns, indexes) AND content (row counts, money totals). A
 * verification that only counted rows would miss a dropped column; one that only
 * checked shape would miss deleted data.
 */
function inspectDatabase(): array
{
    $pdo = appPdo();

    $tables = [];

    foreach ($pdo->query(
        "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES
         WHERE TABLE_TYPE = 'BASE TABLE' AND TABLE_SCHEMA = 'dbo' ORDER BY TABLE_NAME"
    )->fetchAll() as $row) {
        $tables[] = $row['TABLE_NAME'];
    }

    $columns = [];

    foreach ($pdo->query(
        "SELECT TABLE_NAME, COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
         WHERE TABLE_SCHEMA = 'dbo' ORDER BY TABLE_NAME, ORDINAL_POSITION"
    )->fetchAll() as $row) {
        $columns[] = $row['TABLE_NAME'] . '.' . $row['COLUMN_NAME'];
    }

    $indexes = [];

    foreach ($pdo->query(
        "SELECT name FROM sys.indexes WHERE name IS NOT NULL
         AND object_id IN (SELECT object_id FROM sys.tables WHERE schema_id = SCHEMA_ID('dbo'))
         ORDER BY name"
    )->fetchAll() as $row) {
        $indexes[] = $row['name'];
    }

    $views = [];

    foreach ($pdo->query(
        "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.VIEWS WHERE TABLE_SCHEMA = 'dbo' ORDER BY TABLE_NAME"
    )->fetchAll() as $row) {
        $views[] = $row['TABLE_NAME'];
    }

    $counts = [];

    foreach ($tables as $table) {
        $counts[$table] = (int) $pdo->query("SELECT COUNT(*) FROM dbo.[$table]")->fetchColumn();
    }

    return [
        'tables' => $tables,
        'columns' => $columns,
        'indexes' => $indexes,
        'views' => $views,
        'counts' => $counts,
    ];
}

/** Money totals, so a change that quietly alters a figure is visible. */
function moneyTotals(): array
{
    $pdo = appPdo();

    return [
        'amount_due' => (float) $pdo->query('SELECT ISNULL(SUM(amount_due), 0) FROM dbo.payments')->fetchColumn(),
        'amount_charged' => (float) $pdo->query('SELECT ISNULL(SUM(ISNULL(amount_charged, 0)), 0) FROM dbo.payments')->fetchColumn(),
        'refunds' => (float) $pdo->query('SELECT ISNULL(SUM(amount), 0) FROM dbo.refunds')->fetchColumn(),
    ];
}

/** The structure this project expects to exist. */
function expectedShape(): array
{
    return [
        'tables' => [
            'users', 'pcs', 'rentals', 'rental_segments',
            'payments', 'transfers', 'refunds',
        ],
        'views' => ['v_revenue_summary'],
        // Columns added in later phases, so their absence is a real finding
        // rather than noise.
        'columns' => [
            'pcs.needs_repair',
            'payments.reference_number',
            'payments.pc_name',
            'payments.used_seconds',
            'payments.overstay_seconds',
            'payments.settled_by_id',
            'transfers.from_pc_name',
            'transfers.to_pc_name',
            'transfers.remaining_time_seconds',
            'refunds.cashier_name',
            'refunds.refund_type',
        ],
    ];
}

/**
 * Compare the live database against what the project expects.
 *
 * @return array{missing: array, ok: bool}
 */
function verifyShape(): array
{
    $actual = inspectDatabase();
    $expected = expectedShape();
    $missing = [];

    foreach ($expected['tables'] as $table) {
        if (!in_array($table, $actual['tables'], true)) {
            $missing[] = 'table ' . $table;
        }
    }

    foreach ($expected['views'] as $view) {
        if (!in_array($view, $actual['views'], true)) {
            $missing[] = 'view ' . $view;
        }
    }

    foreach ($expected['columns'] as $column) {
        if (!in_array($column, $actual['columns'], true)) {
            $missing[] = 'column ' . $column;
        }
    }

    return ['missing' => $missing, 'ok' => $missing === []];
}

/** Print a labelled line. */
function out(string $label, string $value = ''): void
{
    echo str_pad($label, 34) . ($value === '' ? '' : $value) . "\n";
}

/** Print a step heading. */
function step(string $text): void
{
    echo "\n" . $text . "\n" . str_repeat('-', mb_strlen($text)) . "\n";
}
