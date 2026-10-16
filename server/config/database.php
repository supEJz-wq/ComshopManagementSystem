<?php
// server/config/database.php
// MSSQL connection for CyberShopOS.
//
// CREDENTIALS ARE NOT IN THIS FILE.
//
// They live in .env at the project root, which is gitignored, so a real
// password can never reach the remote by accident. This file is committed and
// is safe to publish. See .env.example for the template.
//
// Windows Authentication (the current setup) needs no credentials at all:
// leave DB_USERNAME and DB_PASSWORD blank and the driver uses the logged-in
// Windows account.

declare(strict_types=1);

require_once __DIR__ . '/env.php';
require_once __DIR__ . '/app.php';

header('Content-Type: application/json; charset=utf-8');

$config = dbConfig();
$dsn = "sqlsrv:Server={$config['server']};Database={$config['database']};";

try {
    $pdo = new PDO(
        $dsn,
        $config['username'],
        $config['password'],
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]
    );
} catch (PDOException $e) {
    http_response_code(500);

    // The message names the server but never the password, which is not part of
    // the DSN when SQL Authentication is in use.
    echo json_encode([
        'ok' => false,
        'error' => 'Database connection failed: ' . $e->getMessage(),
    ]);
    exit;
}
