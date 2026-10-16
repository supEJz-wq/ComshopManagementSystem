<?php
// server/api/analytics/collected-by-month.php
// GET -> Collected per calendar month across all time (12 months per year)
// Admin only

declare(strict_types=1);

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../middleware/session.php';

requireAdmin();

$stmt = $pdo->query("
    SELECT YEAR(settled_at) AS yr, MONTH(settled_at) AS mn, ISNULL(SUM(amount_charged), 0) AS collected
    FROM dbo.payments
    WHERE is_settled = 1
    GROUP BY YEAR(settled_at), MONTH(settled_at)
    ORDER BY yr, mn
");
$rows = $stmt->fetchAll();

$years = [];
foreach ($rows as $r) {
    $y = (int) $r['yr'];
    $m = (int) $r['mn'];
    if (!isset($years[$y])) {
        $years[$y] = array_fill(1, 12, 0.0);
    }
    $years[$y][$m] = (float) $r['collected'];
}

ksort($years);
$out = [];
foreach ($years as $y => $months) {
    $monthOut = [];
    for ($m = 1; $m <= 12; $m++) {
        $monthOut[] = [
            'month'     => $m,
            'collected' => $months[$m] ?? 0.0,
        ];
    }
    $out[] = ['year' => $y, 'months' => $monthOut];
}

echo json_encode(['ok' => true, 'data' => $out]);
