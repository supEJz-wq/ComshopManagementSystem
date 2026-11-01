<?php
// server/tools/apply-migration.php
//
// One-off helper that applies a single .sql file. The normal way is
//     php server/tools/update.php --file=database/migrations/00X_name.sql
// which backs up first and verifies afterwards. This script skips both, so it is
// for quick local iteration only.
//
// Usage:
//     php server/tools/apply-migration.php database/migrations/001_add_column.sql
//
// Credentials come from .env, never from a literal in this file.

declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    http_response_code(403);
    exit("This script is command-line only.\n");
}

require_once __DIR__ . '/db-admin.php';

$target = $argv[1] ?? '';

if ($target === '') {
    echo "Usage: php server/tools/apply-migration.php <path-to.sql>\n";
    exit(1);
}

if (!is_file($target)) {
    echo 'No such file: ' . $target . "\n";
    exit(1);
}

try {
    $statements = applySqlFile($target);

    echo basename($target) . " applied ($statements statements)\n";
    echo 'payments : ' . (inspectDatabase()['counts']['payments'] ?? 0) . "\n";
} catch (Throwable $e) {
    echo 'FAILED: ' . $e->getMessage() . "\n";
    exit(1);
}
