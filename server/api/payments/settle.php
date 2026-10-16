<?php
// server/api/payments/settle.php
// POST {id, cashReceived} -> Reject non-integer, < 1, < amountDue, already settled

declare(strict_types=1);

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../middleware/session.php';

$user = requireAuth();

$input = json_decode(file_get_contents('php://input'), true) ?? [];
$id     = (int) ($input['id'] ?? 0);
$cash   = $input['cashReceived'] ?? null;

if ($id <= 0) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Invalid bill id.']);
    exit;
}

if (!is_int($cash) || $cash < 1) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Enter the cash received — at least ₱1.']);
    exit;
}

// Load the bill
$stmt = $pdo->prepare("
    SELECT id, amount_due, is_settled, cashier_name
    FROM dbo.payments WHERE id = ?
");
$stmt->execute([$id]);
$bill = $stmt->fetch();
if (!$bill) {
    http_response_code(404);
    echo json_encode(['ok' => false, 'error' => 'That bill no longer exists.']);
    exit;
}

if ((int) $bill['is_settled'] === 1) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'This bill is already settled.']);
    exit;
}

if ($cash < (float) $bill['amount_due']) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Underpayment refused. Settle in full or not at all.']);
    exit;
}

$amountCharged = (float) $bill['amount_due'];
$change = max(0, $cash - $amountCharged);
$now = new DateTime();
$settledAt = $now->format('Y-m-d H:i:s.u');

$upd = $pdo->prepare("
    UPDATE dbo.payments
    SET cash_received = ?, amount_charged = ?, change_given = ?,
        is_settled = 1, settled_at = ?, settled_by_id = ?, settled_by_name = ?
    WHERE id = ?
");
$upd->execute([
    $cash, $amountCharged, $change, $settledAt,
    $user['id'], $user['username'], $id
]);

echo json_encode(['ok' => true, 'payment' => [
    'id'             => $id,
    'cashReceived'   => $cash,
    'amountCharged'  => $amountCharged,
    'change'         => $change,
    'isSettled'      => true,
    'settledAt'      => $settledAt,
    'settledByName'  => $user['username'],
]]);
