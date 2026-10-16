<?php
// server/api/analytics/collected-by-year.php
// GET -> Collected per calendar year (year-over-year)
// Admin only

declare(strict_types=1);

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../middleware/session.php';

requireAdmin();

$stmt = $pdo->query("
    SELECT YEAR(settled_at) AS yr, ISNULL(SUM(amount_charged), 0) AS collected
    FROM dbo.payments
    WHERE is_settled = 1
    GROUP BY YEAR(settled_at)
    ORDER BY yr
");
$rows = $stmt->fetchAll();

$data = [];
foreach ($rows as $r) {
    $data[] = ['year' => (int) $r['yr'], 'collected' => (float) $r['collected']];
}

echo json_encode(['ok' => true, 'data' => $data]);
