<?php
// server/api/revenue/index.php
// GET ?period=today|month|year|all|<year> -> cash-basis revenue figures
//
// THE ONE PLACE A REVENUE FIGURE IS COMPUTED. Phase 7 and Phase 8 both consume
// this shape, so the Revenue screen and the Analytics screen cannot disagree.
//
//   collected  settled bills whose settled_at falls inside the period
//   refunded   refunds taken inside the period, ₱0 entries excluded
//   net        collected - refunded
//   stillOwed  every unsettled bill. Period-INDEPENDENT.
//
// `net` and `stillOwed` are returned separately and must never be summed
// (Decision 64). A refund reduces the period it HAPPENED in, never the period of
// the original payment (Decision 107), so a day may legitimately go negative.

declare(strict_types=1);

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../middleware/session.php';

$user = requireAuth();

$period = (string) ($_GET['period'] ?? 'today');
$window = periodWindow($period);

if ($window === null) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Invalid period.']);
    exit;
}

// Role scoping: the Cashier is offered Today and nothing else. This is the
// enforcement point, not a UI convention (Decision 110).
if (($user['role'] ?? '') !== 'Admin') {
    $period = 'today';
    $window = periodWindow('today');
}

$start = $window['start'];
$end = $window['end'];
$label = $window['label'];

/**
 * Run one aggregate query over an optional [start, end) window on one column.
 * Returns the first column of the first row as a float.
 *
 * One helper rather than five near-identical prepare/execute/fetch blocks: a rule
 * repeated in five places is a rule that will drift (this project has paid for
 * that five times already).
 */
function aggregateWithColumn(PDO $pdo, string $sql, string $column, ?DateTime $start, ?DateTime $end): float
{
    $params = [];
    $sql = rtrim($sql);

    if ($start !== null) {
        $sql .= " AND {$column} >= ? AND {$column} < ?";
        $params = [$start->format('Y-m-d H:i:s.v'), $end->format('Y-m-d H:i:s.v')];
    }

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $value = $stmt->fetchColumn();

    return $value === null ? 0.0 : (float) $value;
}

$collected = aggregateWithColumn(
    $pdo,
    'SELECT ISNULL(SUM(amount_charged), 0) FROM dbo.payments WHERE is_settled = 1',
    'settled_at',
    $start,
    $end,
);

$refunded = aggregateWithColumn(
    $pdo,
    'SELECT ISNULL(SUM(r.amount), 0) FROM dbo.refunds r
     INNER JOIN dbo.payments p ON p.id = r.payment_id
     WHERE r.amount > 0',
    'r.created_at',
    $start,
    $end,
);

$net = $collected - $refunded;

// Still owed — every unsettled bill, period-independent by design (Decision 64).
$owedStmt = $pdo->query('SELECT ISNULL(SUM(amount_due), 0) FROM dbo.payments WHERE is_settled = 0');
$stillOwed = (float) $owedStmt->fetchColumn();

$settledCount = (int) aggregateWithColumn(
    $pdo,
    'SELECT COUNT(*) FROM dbo.payments WHERE is_settled = 1',
    'settled_at',
    $start,
    $end,
);

$refundCount = (int) aggregateWithColumn(
    $pdo,
    'SELECT COUNT(*) FROM dbo.refunds WHERE amount > 0',
    'created_at',
    $start,
    $end,
);

// ₱0 adjustments are real records and are counted, but they moved no money
// (Decision 78).
$adjustmentCount = (int) aggregateWithColumn(
    $pdo,
    'SELECT COUNT(*) FROM dbo.refunds WHERE amount = 0',
    'created_at',
    $start,
    $end,
);

echo json_encode([
    'ok' => true,
    'revenue' => [
        'period' => $period,
        'label' => $label,
        'range' => [
            'start' => $start ? $start->format('Y-m-d\TH:i:s') : null,
            'end' => $end ? $end->format('Y-m-d\TH:i:s') : null,
        ],
        'collected' => $collected,
        'refunded' => $refunded,
        'net' => $net,
        'stillOwed' => $stillOwed,
        'settledCount' => $settledCount,
        'refundCount' => $refundCount,
        'adjustmentCount' => $adjustmentCount,
        'role' => $user['role'],
    ],
]);
