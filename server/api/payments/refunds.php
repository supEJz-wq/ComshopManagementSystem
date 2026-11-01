<?php
// server/api/payments/refunds.php
// GET -> every refund / adjustment record.
//
// Refunds are their OWN records, never fields on a bill (Business Rule 10,
// Decision 80). The Revenue screen needs the whole list to show refund history
// for a period; the Payments screen needs the ones belonging to one bill.

declare(strict_types=1);

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/helpers.php';
require_once __DIR__ . '/../../middleware/session.php';

requireAuth();

$stmt = $pdo->query("
    SELECT id, payment_id, amount, reason, refund_type, created_at,
           cashier_id, cashier_name
    FROM dbo.refunds
    ORDER BY created_at, id
");
// Oldest first: the sequence of adjustments reads in the order they happened,
// which is the point of showing them. The Revenue screen's own list is newest
// first, because there it is a history being scanned, not a sequence being read.

$refunds = array_map(static function (array $row): array {
    return [
        'id' => (int) $row['id'],
        'payment_id' => (int) $row['payment_id'],
        'amount' => dbNum($row['amount']),
        'reason' => $row['reason'],
        'refund_type' => $row['refund_type'],
        // snake_case like every other field the API returns. This endpoint
        // used to answer `at`, the one camelCase holdout, which meant the
        // same value had two names depending on which endpoint you asked.
        'created_at' => dbIso($row['created_at']),
        'cashier_id' => (int) $row['cashier_id'],
        'cashier_name' => $row['cashier_name'],
    ];
}, $stmt->fetchAll());

echo json_encode(['ok' => true, 'refunds' => $refunds]);