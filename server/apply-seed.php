<?php
// server/apply-seed.php
//
// One-off helper that applies database/seed.sql. The normal way to seed is
//     php server/update.php --seed
// which backs up first and verifies afterwards. This script skips both, so it is
// for quick local iteration only.
//
// Credentials come from .env, never from a literal in this file.

declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    http_response_code(403);
    exit("This script is command-line only.\n");
}

require_once __DIR__ . '/db-admin.php';

try {
    $statements = applySqlFile(__DIR__ . '/../database/seed.sql');

    echo "seed.sql applied ($statements statements)\n";

    $inspect = inspectDatabase();
    echo 'users   : ' . ($inspect['counts']['users'] ?? 0) . "\n";
    echo 'pcs     : ' . ($inspect['counts']['pcs'] ?? 0) . "\n";
    echo 'rentals : ' . ($inspect['counts']['rentals'] ?? 0) . "\n";
} catch (Throwable $e) {
    echo 'FAILED: ' . $e->getMessage() . "\n";
    exit(1);
}
