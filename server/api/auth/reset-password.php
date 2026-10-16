<?php
// server/api/auth/reset-password.php
// POST {newPassword} -> Admin only. Resets Cashier password, signs Admin out.

declare(strict_types=1);

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../middleware/session.php';

requireAdmin(); // must be Admin

$input = json_decode(file_get_contents('php://input'), true) ?? [];

if (!is_array($input)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Invalid request body.']);
    exit;
}

// is_string() before strlen(): an array or object here would raise a TypeError
// and return a 500 instead of a usable message.
$newPassword = $input['newPassword'] ?? null;

if (!is_string($newPassword) || trim($newPassword) === '') {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Enter a new password.']);
    exit;
}

$newPassword = trim($newPassword);

// Only the Cashier account can be reset (exactly two accounts: Admin + Cashier)
$stmt = $pdo->prepare("SELECT id FROM dbo.users WHERE role = 'Cashier'");
$stmt->execute();
$cashier = $stmt->fetch();

if (!$cashier) {
    http_response_code(404);
    echo json_encode(['ok' => false, 'error' => 'No Cashier account found.']);
    exit;
}

$hash = password_hash($newPassword, PASSWORD_DEFAULT);
$update = $pdo->prepare("UPDATE dbo.users SET password_hash = ?, updated_at = SYSDATETIME() WHERE id = ?");
$update->execute([$hash, $cashier['id']]);

// Sign the Admin out so the Cashier must log in personally with the new password
// (Business Rule 12 — cashier attribution must be theirs, not the Admin's).
destroySession();

echo json_encode(['ok' => true]);
