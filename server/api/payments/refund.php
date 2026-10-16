<?php
// server/api/payments/refund.php
// POST {paymentId, kind, amount, reason} -> Settled only, hard cap, mandatory reason

declare(strict_types=1);

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/helpers.php';
require_once __DIR__ . '/../../middleware/session.php';

$user = requireAuth();

$input = json_decode(file_get_contents('php://input'), true) ?? [];

if (!is_array($input)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Invalid request body.']);
    exit;
}

$paymentId = wholeNumber($input['paymentId'] ?? null);
$kind      = $input['kind'] ?? 'partial'; // partial, full, adjustment
$amount    = wholeNumber($input['amount'] ?? null);
$reason    = is_string($input['reason'] ?? null) ? trim($input['reason']) : '';

if ($paymentId === null || $paymentId <= 0) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Invalid bill id.']);
    exit;
}

if (!is_string($kind) || !in_array($kind, ['partial', 'full', 'adjustment'], true)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Invalid refund type.']);
    exit;
}

// Whole pesos, and PHP0 IS allowed — it records a non-monetary adjustment
// (Decision 78). The raw value is checked BEFORE any cast: casting first would
// turn "abc" into 0.0 and silently file garbage as a real PHP0 adjustment, which
// is the same bug class as Phase 4 defect 1.
// See wholeNumber() in config/helpers.php.
if ($amount === null || $amount < 0) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Enter a whole peso amount, 0 or more.']);
    exit;
}

if ($reason === '') {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'A reason is required.']);
    exit;
}

// Bill must exist and be settled
$stmt = $pdo->prepare("
    SELECT id, amount_charged, is_settled
    FROM dbo.payments WHERE id = ?
");
$stmt->execute([$paymentId]);
$bill = $stmt->fetch();
if (!$bill) {
    http_response_code(404);
    echo json_encode(['ok' => false, 'error' => 'That bill no longer exists.']);
    exit;
}

if ((int) $bill['is_settled'] !== 1) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Settle the bill before refunding it.']);
    exit;
}

// Hard cap: total refunds cannot exceed amount paid
$already = $pdo->prepare("SELECT ISNULL(SUM(amount), 0) AS total FROM dbo.refunds WHERE payment_id = ?");
$already->execute([$paymentId]);
$alreadyRefunded = (float) $already->fetch()['total'];

$amountCharged = (float) $bill['amount_charged'];
$maxRefundable = max(0, $amountCharged - $alreadyRefunded);

if ($amount > $maxRefundable) {
    http_response_code(400);
    echo json_encode([
        'ok' => false,
        'error' => $maxRefundable === 0
            ? 'Nothing left to refund on this bill.'
            : "That is more than the remaining ₱$maxRefundable.",
    ]);
    exit;
}

// Append-only refund record — original payment never touched
$insert = $pdo->prepare("
    INSERT INTO dbo.refunds (payment_id, amount, reason, refund_type, created_at, cashier_id, cashier_name)
    OUTPUT INSERTED.id
    VALUES (?, ?, ?, ?, SYSDATETIME(), ?, ?)
");
$insert->execute([$paymentId, $amount, $reason, $kind, $user['id'], $user['username']]);
$refundId = (int) $insert->fetch(PDO::FETCH_COLUMN);

echo json_encode(['ok' => true, 'refund' => [
    'id'          => $refundId,
    'paymentId'   => $paymentId,
    'amount'      => $amount,
    'kind'        => $kind,
    'reason'      => $reason,
    'cashierName' => $user['username'],
]]);
