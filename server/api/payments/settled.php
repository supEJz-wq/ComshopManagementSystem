<?php
// server/api/payments/settled.php
// GET -> Settled bills

declare(strict_types=1);

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../middleware/session.php';

requireAuth();

$stmt = $pdo->prepare("
    SELECT p.id, p.reference_number, p.pc_name, p.amount_due, p.amount_charged,
           p.cash_received, p.change_given, p.settled_at, p.cashier_name
    FROM dbo.payments p
    WHERE p.is_settled = 1
    ORDER BY p.settled_at DESC
");
$stmt->execute();
$bills = $stmt->fetchAll();

foreach ($bills as &$b) {
    $b['id'] = (int) $b['id'];
    $b['amount_due'] = (float) $b['amount_due'];
    $b['amount_charged'] = (float) $b['amount_charged'];
    $b['cash_received'] = (float) $b['cash_received'];
    $b['change_given'] = (float) $b['change_given'];
    $b['settled_at'] = dbIso($b['settled_at']);
}
unset($b);

echo json_encode(['ok' => true, 'settled' => $bills]);
