<?php
// server/api/analytics/best-month.php
// GET -> {year, month, collected} or null
// Admin only

declare(strict_types=1);

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../middleware/session.php';

requireAdmin();

$stmt = $pdo->query("
    SELECT TOP 1 YEAR(settled_at) AS yr, MONTH(settled_at) AS mn, ISNULL(SUM(amount_charged), 0) AS collected
    FROM dbo.payments
    WHERE is_settled = 1
    GROUP BY YEAR(settled_at), MONTH(settled_at)
    ORDER BY collected DESC
");
$row = $stmt->fetch();

if (!$row || (float) $row['collected'] <= 0) {
    echo json_encode(['ok' => true, 'bestMonth' => null]);
    exit;
}

echo json_encode(['ok' => true, 'bestMonth' => [
    'year'      => (int) $row['yr'],
    'month'     => (int) $row['mn'],
    'collected' => (float) $row['collected'],
]]);
