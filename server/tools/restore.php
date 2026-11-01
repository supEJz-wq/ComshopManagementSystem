<?php
// server/tools/restore.php
//
//   php server/tools/restore.php                     list available backups
//   php server/tools/restore.php <file>.bak          restore one of them
//
// âš ï¸  A restore REPLACES the database completely with the contents of the
//     backup. Anything written since that backup was taken is lost.
//
//     It is a full restore, not a merge. There is no undo.

declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    http_response_code(403);
    exit("This script is command-line only.\n");
}

require_once __DIR__ . '/db-admin.php';

$target = $argv[1] ?? null;

// ---------------------------------------------------------------- list mode
if ($target === null) {
    step('AVAILABLE BACKUPS');

    $backups = listBackups();

    if ($backups === []) {
        echo "\nNone yet. Create one with:\n  php server/tools/backup.php\n";
        exit(0);
    }

    printf("  %-34s %-12s %s\n", 'FILE', 'SIZE', 'TAKEN');
    echo '  ' . str_repeat('-', 66) . "\n";

    foreach ($backups as $backup) {
        printf("  %-34s %-12s %s\n", $backup['file'], $backup['size'], $backup['date']);
    }

    echo "\nRestore one with:\n  php server/tools/restore.php <filename>\n";
    exit(0);
}

// -------------------------------------------------------------- restore mode
step('RESTORE');

try {
    out('Backup file', $target);

    // Show what is about to be overwritten, so the loss is never a surprise.
    $before = inspectDatabase();
    out('Current payments rows', (string) ($before['counts']['payments'] ?? 0));
    out('Current refunds rows', (string) ($before['counts']['refunds'] ?? 0));

    echo "\nThis REPLACES the database with the backup's contents.\n";
    echo "Anything written since that backup was taken will be lost.\n";

    if (!in_array('--yes', $argv, true)) {
        echo "\nRe-run with --yes to confirm:\n";
        echo '  php server/tools/restore.php ' . $target . " --yes\n";
        exit(2);
    }

    restoreDatabase($target);

    out('Restored', $target);

    // The restored database may differ in shape, so verify rather than assume.
    $shape = verifyShape();

    if (!$shape['ok']) {
        out('WARNING missing', implode(', ', $shape['missing']));
    } else {
        out('Shape', 'complete');
    }

    $after = inspectDatabase();
    out('Payments rows now', (string) ($after['counts']['payments'] ?? 0));
    out('Refunds rows now', (string) ($after['counts']['refunds'] ?? 0));

    $money = moneyTotals();
    out('Amount due', (string) $money['amount_due']);
    out('Amount collected', (string) $money['amount_charged']);
    out('Refunded', (string) $money['refunds']);

    echo "\nOK.\n";
    echo "If php -S is running it lost its connection during the restore \n";
    echo "restart it so it reconnects.\n";
} catch (Throwable $e) {
    echo "\nFAILED: " . $e->getMessage() . "\n";
    exit(1);
}
