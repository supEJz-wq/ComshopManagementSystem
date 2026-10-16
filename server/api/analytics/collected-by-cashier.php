<?php
// server/api/analytics/collected-by-cashier.php
// GET ?period=... -> collected / refunded / net per cashier
// Admin only (the gate is enforced by the front controller).

declare(strict_types=1);

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../middleware/session.php';

$period = (string) ($_GET['period'] ?? 'today');
$window = periodWindow($period);

if ($window === null) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Invalid period.']);
    exit;
}

[$sqlStart, $sqlEnd] = periodSql($window['start'], $window['end']);

$params = [];
$where = '';

if ($sqlStart !== null) {
    $where = ' AND settled_at >= ? AND settled_at < ?';
    $params = [$sqlStart, $sqlEnd];
}

// Cash basis, same rule as the Revenue screen (Decision 105).
$stmt = $pdo->prepare("
    SELECT cashier_name AS cashier, SUM(amount_charged) AS collected
    FROM dbo.payments
    WHERE is_settled = 1{$where}
    GROUP BY cashier_name
");
$stmt->execute($params);

$rows = [];

foreach ($stmt->fetchAll() as $row) {
    $name = $row['cashier'] ?? 'Unknown';
    $rows[$name] = ['cashier' => $name, 'collected' => dbNum($row['collected']), 'refunded' => 0.0];
}

// Refunds are attributed to the cashier who recorded them, and reduce the period
// they happened in (Decision 107).
$refundWhere = '';
$refundParams = $params;

if ($sqlStart !== null) {
    $refundWhere = ' AND created_at >= ? AND created_at < ?';
}

$stmt2 = $pdo->prepare("
    SELECT cashier_name AS cashier, SUM(amount) AS refunded
    FROM dbo.refunds
    WHERE amount > 0{$refundWhere}
    GROUP BY cashier_name
");
$stmt2->execute($refundParams);

foreach ($stmt2->fetchAll() as $row) {
    $name = $row['cashier'] ?? 'Unknown';

    if (!isset($rows[$name])) {
        $rows[$name] = ['cashier' => $name, 'collected' => 0.0, 'refunded' => 0.0];
    }

    $rows[$name]['refunded'] += dbNum($row['refunded']);
}

$data = [];

foreach ($rows as $row) {
    $row['net'] = $row['collected'] - $row['refunded'];
    $data[] = $row;
}

// Busiest first.
usort($data, static fn(array $a, array $b): int => $b['net'] <=> $a['net']);

echo json_encode(['ok' => true, 'period' => $period, 'data' => $data]);
