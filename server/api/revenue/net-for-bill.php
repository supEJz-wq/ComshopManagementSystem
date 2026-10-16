<?php
// server/api/revenue/net-for-bill.php
// GET ?paymentId= -> {refunded, net} for a specific bill

declare(strict_types=1);

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../middleware/session.php';

requireAuth();

$paymentId = (int) ($_GET['paymentId'] ?? 0);
if ($paymentId <= 0) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Invalid payment id.']);
    exit;
}

$stmt = $pdo->prepare("
    SELECT p.amount_charged,
           ISNULL(SUM(r.amount), 0) AS total_refunded
    FROM dbo.payments p
    LEFT JOIN dbo.refunds r ON r.payment_id = p.id
    WHERE p.id = ?
    GROUP BY p.amount_charged
");
$stmt->execute([$paymentId]);
$row = $stmt->fetch();
if (!$row) {
    http_response_code(404);
    echo json_encode(['ok' => false, 'error' => 'Bill not found.']);
    exit;
}

$amountCharged = (float) $row['amount_charged'];
$totalRefunded = (float) $row['total_refunded'];

echo json_encode(['ok' => true, 'paymentId' => $paymentId, 'refunded' => $totalRefunded, 'net' => $amountCharged - $totalRefunded]);
