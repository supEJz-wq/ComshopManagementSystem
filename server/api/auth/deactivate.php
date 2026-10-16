<?php
// server/api/auth/deactivate.php
// POST {active: true|false} -> Admin only. Deactivate/reactivate Cashier.

declare(strict_types=1);

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../middleware/session.php';

$admin = requireAdmin();

$input = json_decode(file_get_contents('php://input'), true) ?? [];
$active = filter_var($input['active'] ?? true, FILTER_VALIDATE_BOOL);

// Find the Cashier account
$stmt = $pdo->prepare("SELECT id, username FROM dbo.users WHERE role = 'Cashier'");
$stmt->execute();
$cashier = $stmt->fetch();

if (!$cashier) {
    http_response_code(404);
    echo json_encode(['ok' => false, 'error' => 'No Cashier account found.']);
    exit;
}

$update = $pdo->prepare("UPDATE dbo.users SET is_active = ?, updated_at = SYSDATETIME() WHERE id = ?");
$update->execute([$active ? 1 : 0, $cashier['id']]);

// If the Cashier is the one being deactivated, end their session now. Leaving it
// alive would mean reactivating silently restored a session that should have
// ended at the moment of deactivation.
if (!$active && (int) $cashier['id'] === (int) ($_SESSION['user_id'] ?? 0)) {
    destroySession();
}

echo json_encode([
    'ok' => true,
    'active' => $active,
    'username' => $cashier['username'],
]);
