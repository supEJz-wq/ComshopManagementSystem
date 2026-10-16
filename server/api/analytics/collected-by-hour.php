<?php
// server/api/analytics/collected-by-hour.php
// GET ?period=... -> exactly 24 buckets, one per hour of the day
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

// All 24 hours are always returned. An empty hour is real information — 3am is
// closed for business, and hiding it would make the chart lie about the shape.
$buckets = [];

for ($hour = 0; $hour < 24; $hour++) {
    $buckets[$hour] = ['hour' => $hour, 'collected' => 0.0];
}

[$sqlStart, $sqlEnd] = periodSql($window['start'], $window['end']);
$where = '';
$params = [];

if ($sqlStart !== null) {
    $where = ' AND settled_at >= ? AND settled_at < ?';
    $params = [$sqlStart, $sqlEnd];
}

// DATEPART(HOUR) is computed by SQL Server, so the hour matches the same clock
// the settled_at values were written with.
$stmt = $pdo->prepare("
    SELECT DATEPART(HOUR, settled_at) AS hr, SUM(amount_charged) AS collected
    FROM dbo.payments
    WHERE is_settled = 1{$where}
    GROUP BY DATEPART(HOUR, settled_at)
");
$stmt->execute($params);

foreach ($stmt->fetchAll() as $row) {
    $hour = dbInt($row['hr']);

    if (isset($buckets[$hour])) {
        $buckets[$hour]['collected'] = dbNum($row['collected']);
    }
}

echo json_encode(['ok' => true, 'period' => $period, 'buckets' => array_values($buckets)]);
