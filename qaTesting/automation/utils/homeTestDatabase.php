<?php
/*
 * CLI-only disposable database support for the Admin test runner.
 * Creates a NEW database from the existing schema and seeds only test records.
 * Cleanup requires the generated name and this run's ownership marker to match.
 */
declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

require_once dirname(__DIR__, 3) . '/server/tools/db-admin.php';

$input = json_decode(stream_get_contents(STDIN), true, flags: JSON_THROW_ON_ERROR);
$name = $input['database'] ?? '';
$root = realpath($input['directory'] ?? '');
$allowedRoot = realpath(dirname(__DIR__) . '/.temp');

if (!preg_match('/^comshop_automation_[a-f0-9]{16}$/D', $name)
    || $name === dbName() || $root === false || $allowedRoot === false
    || !str_starts_with(strtolower($root), strtolower($allowedRoot . DIRECTORY_SEPARATOR))) {
    throw new RuntimeException('Invalid disposable database name or temporary directory.');
}

$marker = $root . '/.automation-database.json';
$admin = adminPdo();
$action = $argv[1] ?? '';

if ($action === 'create' || $action === 'reset') {
    if ($action === 'create') {
        // CREATE fails if the name already exists; an existing database is never reused.
        $admin->exec("CREATE DATABASE [$name]");
        file_put_contents($marker, json_encode(['database' => $name], JSON_THROW_ON_ERROR));

        // Only the copied server reads this .env. The working project's .env stays intact.
        $settings = file_get_contents(projectRoot() . '/.env');
        if ($settings === false) throw new RuntimeException('The local .env file is required.');
        if (preg_match('/^DB_DATABASE\s*=/m', $settings)) {
            $settings = preg_replace_callback('/^DB_DATABASE\s*=.*$/m', fn() => "DB_DATABASE=$name", $settings);
        } else {
            $settings .= "\nDB_DATABASE=$name\n";
        }
        file_put_contents($root . '/.env', $settings);

        // Existing schema application helper now connects only to the new database.
        $dbConfig['database'] = $name;
        applySqlFile(projectRoot() . '/database/schema.sql');
    } else {
        // Reset is permitted only inside the database created by this exact runner.
        if (($input['suite'] ?? '') !== 'pcs' || !is_file($marker)
            || (json_decode(file_get_contents($marker), true)['database'] ?? '') !== $name) {
            throw new RuntimeException('The PCs reset needs its matching disposable database marker.');
        }
        $dbConfig['database'] = $name;
        $reset = appPdo();
        $reset->beginTransaction();
        try {
            foreach (['transfers', 'refunds', 'payments', 'rental_segments', 'rentals', 'pcs', 'users'] as $table) {
                $reset->exec("DELETE FROM dbo.$table");
            }
            $reset->commit();
        } catch (Throwable $error) {
            $reset->rollBack();
            throw $error;
        }
    }
    $pdo = appPdo();
    $account = $pdo->prepare("INSERT INTO dbo.users (username, password_hash, role) VALUES (?, ?, 'Admin')");
    $account->execute([$input['username'], password_hash($input['password'], PASSWORD_DEFAULT)]);

    if (($input['suite'] ?? 'home') === 'pcs') {
        // Ten PCs cover idle/rented faults, repair flags, exact names, and the 24h cap.
        $pdo->exec("INSERT INTO dbo.pcs (name, status, needs_repair) VALUES
            ('PCS-FREE-01', 'free', 0), ('PCS-FREE-010', 'free', 0),
            ('PCS-RENTED-01', 'rented', 0), ('PCS-ISSUE-IDLE', 'issue', 1),
            ('PCS-ISSUE-RENTED', 'issue', 1), ('PCS-UNRESPONSIVE-IDLE', 'unresponsive', 1),
            ('PCS-UNRESPONSIVE-RENTED', 'unresponsive', 1), ('PCS-CAP-RENTED', 'rented', 0),
            ('PCS-FREE-REPAIR', 'free', 1), ('PCS-RENTED-REPAIR', 'rented', 1)");
        $adminId = (int) $pdo->query('SELECT id FROM dbo.users')->fetchColumn();
        $lookup = $pdo->prepare('SELECT id FROM dbo.pcs WHERE name = ?');
        $rental = $pdo->prepare("INSERT INTO dbo.rentals
            (pc_id, started_at, block_seconds, block_started_at, status, cashier_id)
            OUTPUT INSERTED.id VALUES (?, SYSDATETIME(), ?, SYSDATETIME(), 'active', ?)");
        $segment = $pdo->prepare('INSERT INTO dbo.rental_segments (rental_id, seconds, amount_charged) VALUES (?, ?, ?)');
        foreach (['PCS-RENTED-01', 'PCS-ISSUE-RENTED', 'PCS-UNRESPONSIVE-RENTED', 'PCS-CAP-RENTED', 'PCS-RENTED-REPAIR'] as $pcName) {
            $lookup->execute([$pcName]);
            $pcId = (int) $lookup->fetchColumn();
            $seconds = $pcName === 'PCS-CAP-RENTED' ? 86340 : 1800;
            $rental->execute([$pcId, $seconds, $adminId]);
            $segment->execute([(int) $rental->fetchColumn(), $seconds, ceil($seconds / 1800) * 10]);
        }
    } else {
        // Similar names prove the POM selects an exact PC, not the first partial match.
        $pdo->exec("INSERT INTO dbo.pcs (name, status, needs_repair) VALUES
            ('HOME-STATUS-PC', 'free', 0),
            ('HOME-STATUS-PC-10', 'free', 0),
            ('HOME-RENTAL-PC', 'free', 0),
            ('HOME-COMPARE-PC', 'issue', 1)");
        $pcId = (int) $pdo->query("SELECT id FROM dbo.pcs WHERE name = 'HOME-COMPARE-PC'")->fetchColumn();
        $adminId = (int) $pdo->query('SELECT id FROM dbo.users')->fetchColumn();
        $rental = $pdo->prepare("INSERT INTO dbo.rentals
            (pc_id, started_at, block_seconds, block_started_at, status, cashier_id)
            OUTPUT INSERTED.id VALUES (?, DATEADD(MINUTE, -5, SYSDATETIME()), 1800,
            DATEADD(MINUTE, -5, SYSDATETIME()), 'active', ?)");
        $rental->execute([$pcId, $adminId]);
        $rentalId = (int) $rental->fetchColumn();
        $segment = $pdo->prepare('INSERT INTO dbo.rental_segments (rental_id, seconds, amount_charged) VALUES (?, 1800, 10)');
        $segment->execute([$rentalId]);
    }
    echo $action === 'create' ? "Created isolated automation test database.\n" : "Reset isolated PCs test records.\n";
} elseif ($action === 'drop') {
    if (!is_file($marker)
        || (json_decode(file_get_contents($marker), true)['database'] ?? '') !== $name) {
        throw new RuntimeException('Cannot clean up a database without its matching ownership marker.');
    }
    // This validated name was created by this run. The working DB cannot match it.
    $admin->exec("ALTER DATABASE [$name] SET SINGLE_USER WITH ROLLBACK IMMEDIATE");
    $admin->exec("DROP DATABASE [$name]");
    unlink($marker);
    echo "Removed isolated automation test database.\n";
} else {
    throw new RuntimeException('Expected create, reset, or drop.');
}
