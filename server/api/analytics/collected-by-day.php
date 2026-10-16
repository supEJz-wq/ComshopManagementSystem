<?php
// server/api/analytics/collected-by-day.php
// GET ?period=today|month|year|all|<year> -> one bucket per day in the range
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

$start = $window['start'];
$end = $window['end'];

$buckets = [];

if ($start !== null) {
    // Every day in the range gets a bucket, including days with nothing in
    // them: a gap is part of the shape, and an axis that skips days misleads.
    $cursor = clone $start;

    while ($cursor < $end) {
        $key = $cursor->format('Y-m-d');
        $buckets[$key] = [
            'at' => $key,
            'label' => $cursor->format('j M'),
            'collected' => 0.0,
            'refunded' => 0.0,
        ];
        $cursor->modify('+1 day');
    }
}

/**
 * Add one series into the day buckets.
 *
 * @param string $field 'collected' or 'refunded'
 */
$addSeries = static function (string $sql, string $column, string $field) use ($pdo, $start, $end, &$buckets): void {
    [$sqlStart, $sqlEnd] = periodSql($start, $end);
    $params = [];
    $where = '';

    if ($sqlStart !== null) {
        $where = " AND {$column} >= ? AND {$column} < ?";
        $params = [$sqlStart, $sqlEnd];
    }

    $stmt = $pdo->prepare($sql . $where);
    $stmt->execute($params);

    foreach ($stmt->fetchAll() as $row) {
        $day = dbDateTime($row['at']);

        if ($day === null) {
            continue;
        }

        $key = $day->format('Y-m-d');

        if ($buckets === []) {
            // Unbounded period: create buckets as records arrive.
            $buckets[$key] = [
                'at' => $key,
                'label' => $day->format('j M'),
                'collected' => 0.0,
                'refunded' => 0.0,
            ];
        }

        if (isset($buckets[$key])) {
            $buckets[$key][$field] += dbNum($row['amount']);
        }
    }
};

// Cash basis: settled bills count on settled_at (Decision 105).
$addSeries(
    'SELECT settled_at AS at, amount_charged AS amount
     FROM dbo.payments WHERE is_settled = 1',
    'settled_at',
    'collected',
);

// A refund reduces the period it happened in, and a PHP0 entry moves no money
// (Decisions 107 and 78).
$addSeries(
    'SELECT created_at AS at, amount
     FROM dbo.refunds WHERE amount > 0',
    'created_at',
    'refunded',
);

ksort($buckets);

echo json_encode(['ok' => true, 'period' => $period, 'buckets' => array_values($buckets)]);
