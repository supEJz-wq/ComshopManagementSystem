<?php
// server/api/revenue/index.php
// GET ?period=today|month|year|all|<year> -> cash-basis revenue figures
//                                        AND the rows the Revenue screen shows
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
//
// WHY THE ROWS COME FROM HERE TOO. The screen used to receive every bill and
// every refund and pick the ones inside the period itself. That put the period
// rule — which bills belong to this period, and what a bill is worth after its
// refunds — in the browser, twice over. Now the server decides all of it and
// the screen only displays what it is told. The per-bill net is joined here
// rather than computed by the client for the same reason.

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

// The rows the screen lists: the bills settled in this period, and the refunds
// taken in this period.
//
// The window parameters are the same ones the aggregates above used, so the
// figures and the rows always describe the SAME period. A summary that says
// "₱120 collected" above a list of bills that adds up to ₱90 would be the
// worst kind of bug — two truths on one screen.
$periodWhere = '';
$periodParams = [];

if ($start !== null) {
    $periodWhere = ' AND p.settled_at >= ? AND p.settled_at < ?';
    $periodParams = [$start->format('Y-m-d H:i:s.v'), $end->format('Y-m-d H:i:s.v')];
}

/*
  A bill, with what its refunds left behind.

  The refund total is summed in a subquery and joined, so one bill is one row
  — not one row per refund. A bill with three adjustments must still appear
  once, carrying the total.
*/
$billStmt = $pdo->prepare("
    SELECT p.id, p.reference_number, p.pc_name, p.amount_charged,
           p.cash_received, p.change_given, p.settled_at,
           p.settled_by_name, p.cashier_name,
           ISNULL(r.total_refunded, 0) AS total_refunded
    FROM dbo.payments p
    LEFT JOIN (
        SELECT payment_id, SUM(amount) AS total_refunded
        FROM dbo.refunds
        GROUP BY payment_id
    ) r ON r.payment_id = p.id
    WHERE p.is_settled = 1{$periodWhere}
    ORDER BY p.settled_at DESC, p.id DESC
");
$billStmt->execute($periodParams);

$bills = array_map(static function (array $row): array {
    $charged = $row['amount_charged'] === null ? 0.0 : (float) $row['amount_charged'];
    $refunded = (float) $row['total_refunded'];

    return [
        'id' => (int) $row['id'],
        'reference_number' => $row['reference_number'],
        'pc_name' => $row['pc_name'],
        'amount_charged' => $charged,
        'cash_received' => $row['cash_received'] === null ? null : (float) $row['cash_received'],
        'change_given' => $row['change_given'] === null ? null : (float) $row['change_given'],
        'settled_at' => dbIso($row['settled_at']),
        'settled_by_name' => $row['settled_by_name'],
        'cashier_name' => $row['cashier_name'],
        'refunded' => $refunded,
        'net' => $charged - $refunded,
    ];
}, $billStmt->fetchAll());

/*
  Refunds taken inside the period, with the bill they belong to.

  A refund reduces the period it HAPPENED in (Decision 107), so this filter is
  on the refund's own timestamp, not on the original payment's.

  The bill's reference and PC name are joined in, because the screen shows
  them on the refund row and looking them up in a second list would mean the
  browser holding a copy of the bills again.
*/
$refundWhere = '';
$refundParams = [];

if ($start !== null) {
    $refundWhere = ' WHERE r.created_at >= ? AND r.created_at < ?';
    $refundParams = [$start->format('Y-m-d H:i:s.v'), $end->format('Y-m-d H:i:s.v')];
}

$refundStmt = $pdo->prepare("
    SELECT r.id, r.payment_id, r.amount, r.reason, r.refund_type, r.created_at,
           r.cashier_name, p.reference_number, p.pc_name
    FROM dbo.refunds r
    INNER JOIN dbo.payments p ON p.id = r.payment_id
    {$refundWhere}
    ORDER BY r.created_at DESC, r.id DESC
");
$refundStmt->execute($refundParams);

$refundRows = array_map(static function (array $row): array {
    return [
        'id' => (int) $row['id'],
        'payment_id' => (int) $row['payment_id'],
        'amount' => dbNum($row['amount']),
        'reason' => $row['reason'],
        'refund_type' => $row['refund_type'],
        'created_at' => dbIso($row['created_at']),
        'cashier_name' => $row['cashier_name'],
        'reference_number' => $row['reference_number'],
        'pc_name' => $row['pc_name'],
    ];
}, $refundStmt->fetchAll());

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
    'bills' => $bills,
    'refunds' => $refundRows,
]);
