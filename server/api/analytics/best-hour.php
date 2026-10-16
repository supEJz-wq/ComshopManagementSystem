<?php
// server/api/analytics/best-hour.php
// GET ?period=... -> {hour, collected} for the busiest hour, or null
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
$where = '';
$params = [];

if ($sqlStart !== null) {
    $where = ' AND settled_at >= ? AND settled_at < ?';
    $params = [$sqlStart, $sqlEnd];
}

$stmt = $pdo->prepare("
    SELECT TOP 1 DATEPART(HOUR, settled_at) AS hr, SUM(amount_charged) AS collected
    FROM dbo.payments
    WHERE is_settled = 1{$where}
    GROUP BY DATEPART(HOUR, settled_at)
    ORDER BY SUM(amount_charged) DESC
");
$stmt->execute($params);
$row = $stmt->fetch();

// null, not a zero row: "no best hour" and "the best hour earned nothing" are
// different answers and the caller should be able to tell them apart.
if ($row === false || dbNum($row['collected']) <= 0) {
    echo json_encode(['ok' => true, 'period' => $period, 'bestHour' => null]);
    exit;
}

echo json_encode([
    'ok' => true,
    'period' => $period,
    'bestHour' => [
        'hour' => dbInt($row['hr']),
        'collected' => dbNum($row['collected']),
    ],
]);
