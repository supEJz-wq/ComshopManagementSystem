<?php
// server/api/payments/index.php
// GET -> all bills, with their transfer chain.
//
// `transfers` is included per bill because the Payments screen shows
// "moved PC-02 -> PC-05" on the row. It is a per-rental fact, so it is joined
// from dbo.transfers through rental_id rather than being stored on the payment.

declare(strict_types=1);

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/helpers.php';
require_once __DIR__ . '/../../middleware/session.php';

requireAuth();

$stmt = $pdo->query("
    SELECT p.id, p.rental_id, p.reference_number, p.pc_id, p.pc_name,
           p.started_at, p.ended_at, p.used_seconds, p.booked_seconds,
           p.overstay_seconds, p.amount_due, p.amount_charged,
           p.cash_received, p.change_given, p.is_settled, p.settled_at,
           p.settled_by_id, p.settled_by_name, p.cashier_id, p.cashier_name,
           p.created_at
    FROM dbo.payments p
    ORDER BY p.created_at DESC
");

$payments = $stmt->fetchAll();

// The transfer chain, grouped by rental, fetched once rather than per bill.
$transferStmt = $pdo->query("
    SELECT rental_id, id, from_pc_id, from_pc_name, to_pc_id, to_pc_name,
           remaining_time_seconds, transferred_at
    FROM dbo.transfers
    ORDER BY transferred_at, id
");

$transfersByRental = [];

foreach ($transferStmt->fetchAll() as $row) {
    $rentalId = (int) $row['rental_id'];

    $transfersByRental[$rentalId][] = [
        'id' => (int) $row['id'],
        'fromPcId' => (int) $row['from_pc_id'],
        'fromPcName' => $row['from_pc_name'],
        'toPcId' => (int) $row['to_pc_id'],
        'toPcName' => $row['to_pc_name'],
        'remainingTimeSeconds' => (int) $row['remaining_time_seconds'],
        // The frontend renders this as `at`; sending both names would be two
        // shapes for one value, so the client normaliser maps it once.
        'transferredAt' => dbIso($row['transferred_at']),
    ];
}

// Pieces, grouped by rental, so a bill can show its own line items.
$segmentStmt = $pdo->query("
    SELECT rental_id, id, seconds, amount_charged, is_promo, is_overstay
    FROM dbo.rental_segments
    ORDER BY rental_id, id
");

$piecesByRental = [];

foreach ($segmentStmt->fetchAll() as $row) {
    $rentalId = (int) $row['rental_id'];

    $piecesByRental[$rentalId][] = [
        'seconds' => (int) $row['seconds'],
        'amount' => dbNum($row['amount_charged']),
        'isPromo' => dbBool($row['is_promo']),
        'isOverstay' => dbBool($row['is_overstay']),
    ];
}

foreach ($payments as &$bill) {
    $rentalId = (int) $bill['rental_id'];

    $bill['id'] = (int) $bill['id'];
    $bill['rental_id'] = $rentalId;
    $bill['pc_id'] = (int) $bill['pc_id'];
    $bill['used_seconds'] = (int) $bill['used_seconds'];
    $bill['booked_seconds'] = (int) $bill['booked_seconds'];
    $bill['overstay_seconds'] = (int) $bill['overstay_seconds'];
    $bill['amount_due'] = dbNum($bill['amount_due']);
    $bill['amount_charged'] = $bill['amount_charged'] === null ? null : dbNum($bill['amount_charged']);
    $bill['cash_received'] = $bill['cash_received'] === null ? null : dbNum($bill['cash_received']);
    $bill['change_given'] = $bill['change_given'] === null ? null : dbNum($bill['change_given']);
    $bill['is_settled'] = dbBool($bill['is_settled']);
    $bill['cashier_id'] = (int) $bill['cashier_id'];
    $bill['settled_by_id'] = $bill['settled_by_id'] === null ? null : (int) $bill['settled_by_id'];

    $bill['started_at'] = dbIso($bill['started_at']);
    $bill['ended_at'] = dbIso($bill['ended_at']);
    $bill['settled_at'] = dbIso($bill['settled_at']);
    $bill['created_at'] = dbIso($bill['created_at']);

    $bill['transfers'] = $transfersByRental[$rentalId] ?? [];
    $bill['pieces'] = $piecesByRental[$rentalId] ?? [];
}
unset($bill);

echo json_encode(['ok' => true, 'payments' => $payments]);