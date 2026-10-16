<?php
// server/backup.php
//
// Takes a full backup of the comshop database.
//
//   php server/backup.php
//
// The file lands in backups/ inside the project and is a real SQL Server .bak,
// so it can be restored with restore.php. It is NOT a CSV export.

declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    http_response_code(403);
    exit("This script is command-line only.\n");
}

require_once __DIR__ . '/db-admin.php';

step('BACKUP');

try {
    out('Server', DB_SERVER);
    out('Database', DB_NAME);

    // Prove the database is reachable before spending time on a backup.
    $rows = (int) appPdo()->query('SELECT COUNT(*) FROM dbo.payments')->fetchColumn();
    out('Payments reachable', $rows . ' rows');

    out('SQL Server backup dir', serverBackupDir(adminPdo()));

    $started = microtime(true);
    $path = backupDatabase();
    $seconds = round(microtime(true) - $started, 2);

    out('Backup written', basename($path));
    out('Size', round(filesize($path) / 1048576, 2) . ' MB');
    out('Took', $seconds . 's');
    out('Location', $path);

    echo "\nOK. Restore it with:\n";
    echo '  php server/restore.php ' . basename($path) . "\n";
} catch (Throwable $e) {
    echo "\nFAILED: " . $e->getMessage() . "\n";
    exit(1);
}
