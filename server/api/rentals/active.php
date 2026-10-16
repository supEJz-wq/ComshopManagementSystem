<?php
// server/api/rentals/active.php
// GET -> {ok: true, rentals: [{id, pcId, blockSeconds, startedAt, blockStartedAt, segments[], transfers[]}]}

declare(strict_types=1);

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../middleware/session.php';

requireAuth();

$stmt = $pdo->prepare("
    SELECT r.id, r.pc_id AS pcId, r.block_seconds AS blockSeconds,
           r.started_at AS startedAt, r.block_started_at AS blockStartedAt,
           r.status, r.cashier_id AS cashierId
    FROM dbo.rentals r
    WHERE r.status = 'active'
    ORDER BY r.started_at
");
$stmt->execute();
$rentals = $stmt->fetchAll();

foreach ($rentals as &$rental) {
    // DATETIME2 arrives as a string from pdo_sqlsrv — see dbIso() in config/app.php
    $rental['startedAt'] = dbIso($rental['startedAt']);
    $rental['blockStartedAt'] = dbIso($rental['blockStartedAt']);
    $rental['id'] = (int) $rental['id'];
    $rental['pcId'] = (int) $rental['pcId'];
    $rental['blockSeconds'] = (int) $rental['blockSeconds'];
    $rental['cashierId'] = (int) $rental['cashierId'];

    $seg = $pdo->prepare("SELECT id, seconds, amount_charged AS amountCharged, is_promo AS isPromo, is_overstay AS isOverstay FROM dbo.rental_segments WHERE rental_id = ? ORDER BY id");
    $seg->execute([$rental['id']]);
    $rental['segments'] = array_map(static function (array $row): array {
        $row['id'] = (int) $row['id'];
        $row['seconds'] = (int) $row['seconds'];
        $row['amountCharged'] = (float) $row['amountCharged'];
        $row['isPromo'] = dbBool($row['isPromo']);
        $row['isOverstay'] = dbBool($row['isOverstay']);
        return $row;
    }, $seg->fetchAll());

    $tr = $pdo->prepare("SELECT id, from_pc_id AS fromPcId, from_pc_name AS fromPcName, to_pc_id AS toPcId, to_pc_name AS toPcName, remaining_time_seconds AS remainingTimeSeconds, transferred_at AS transferredAt FROM dbo.transfers WHERE rental_id = ? ORDER BY transferred_at");
    $tr->execute([$rental['id']]);
    $rental['transfers'] = array_map(static function (array $row): array {
        $row['id'] = (int) $row['id'];
        $row['fromPcId'] = (int) $row['fromPcId'];
        $row['toPcId'] = (int) $row['toPcId'];
        $row['remainingTimeSeconds'] = (int) $row['remainingTimeSeconds'];
        $row['transferredAt'] = dbIso($row['transferredAt']);
        return $row;
    }, $tr->fetchAll());
}
unset($rental);

echo json_encode(['ok' => true, 'rentals' => $rentals]);
