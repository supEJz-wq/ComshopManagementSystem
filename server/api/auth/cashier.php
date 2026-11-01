<?php
// server/api/auth/cashier.php
// GET -> the Cashier account. Admin only.
//
// The Accounts screen needs to show who the cashier is and whether the account
// is active. The cashier is not the signed-in user, so /auth/me cannot answer
// it. This returns the account WITHOUT the password hash — the screen never
// needs it and it must never travel to a browser.

declare(strict_types=1);

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../middleware/session.php';

requireAdmin();

$stmt = $pdo->query("
    SELECT id, username, role, is_active, created_at, updated_at
    FROM dbo.users
    WHERE role = 'Cashier'
    ORDER BY id
");
$rows = $stmt->fetchAll();

$cashier = null;

foreach ($rows as $row) {
    $cashier = [
        'id' => (int) $row['id'],
        'username' => $row['username'],
        'role' => $row['role'],
        'active' => dbBool($row['is_active']),
        'createdAt' => dbIso($row['created_at']),
        'updatedAt' => dbIso($row['updated_at']),
    ];
}

echo json_encode(['ok' => true, 'cashier' => $cashier]);