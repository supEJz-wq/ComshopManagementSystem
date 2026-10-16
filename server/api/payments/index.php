<?php
// server/api/payments/index.php
// GET -> All bills (denormalized)

declare(strict_types=1);

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../middleware/session.php';

requireAuth();

$stmt = $pdo->prepare("
    SELECT p.id, p.reference_number, p.pc_id, p.pc_name,
           p.started_at, p.ended_at, p.used_seconds, p.booked_seconds,
           p.overstay_seconds, p.amount_due, p.amount_charged,
           p.cash_received, p.change_given, p.is_settled, p.settled_at,
           p.settled_by_id, p.settled_by_name, p.cashier_id, p.cashier_name,
           p.created_at
    FROM dbo.payments p
    ORDER BY p.created_at DESC
");
$stmt->execute();
$bills = $stmt->fetchAll();

foreach ($bills as &$bill) {
    // DATETIME2 arrives as a string — see dbIso() in config/app.php
    $bill['id'] = (int) $bill['id'];
    $bill['rental_id'] = (int) $bill['rental_id'];
    $bill['pc_id'] = (int) $bill['pc_id'];
    $bill['used_seconds'] = (int) $bill['used_seconds'];
    $bill['booked_seconds'] = (int) $bill['booked_seconds'];
    $bill['overstay_seconds'] = (int) $bill['overstay_seconds'];
    $bill['amount_due'] = (float) $bill['amount_due'];
    $bill['amount_charged'] = $bill['amount_charged'] === null ? null : (float) $bill['amount_charged'];
    $bill['cash_received'] = $bill['cash_received'] === null ? null : (float) $bill['cash_received'];
    $bill['change_given'] = $bill['change_given'] === null ? null : (float) $bill['change_given'];
    $bill['is_settled'] = dbBool($bill['is_settled']);
    $bill['cashier_id'] = (int) $bill['cashier_id'];
    $bill['settled_by_id'] = $bill['settled_by_id'] === null ? null : (int) $bill['settled_by_id'];

    $bill['started_at'] = dbIso($bill['started_at']);
    $bill['ended_at'] = dbIso($bill['ended_at']);
    $bill['settled_at'] = dbIso($bill['settled_at']);
    $bill['created_at'] = dbIso($bill['created_at']);
}
unset($bill);

echo json_encode(['ok' => true, 'payments' => $bills]);
