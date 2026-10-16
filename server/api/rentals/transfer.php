<?php
// server/api/rentals/transfer.php
// POST {fromPcId, toPcId} -> Preserve clock, capture names, no charge

declare(strict_types=1);

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../middleware/session.php';

$user = requireAuth();

$input = json_decode(file_get_contents('php://input'), true) ?? [];
$fromPcId = (int) ($input['fromPcId'] ?? 0);
$toPcId   = (int) ($input['toPcId'] ?? 0);

if ($fromPcId <= 0 || $toPcId <= 0 || $fromPcId === $toPcId) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Choose a different PC.']);
    exit;
}

// Active rental on source PC. block_seconds and block_started_at are read too
// so the remaining display time can be recorded on the transfer (Decision 70).
$stmt = $pdo->prepare("
    SELECT r.id, r.pc_id AS pcId, r.block_seconds AS blockSeconds,
           r.block_started_at AS blockStartedAt
    FROM dbo.rentals r
    WHERE r.pc_id = ? AND r.status = 'active'
");
$stmt->execute([$fromPcId]);
$rental = $stmt->fetch();
if (!$rental) {
    http_response_code(404);
    echo json_encode(['ok' => false, 'error' => 'No active rental on this PC.']);
    exit;
}

// Destination PC must exist
$pcStmt = $pdo->prepare("SELECT id, name, status FROM dbo.pcs WHERE id = ?");
$pcStmt->execute([$toPcId]);
$target = $pcStmt->fetch();
if (!$target) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'That PC does not exist.']);
    exit;
}

$targetStatus = $target['status'];
if ($targetStatus !== 'free' && $targetStatus !== 'issue') {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'That PC cannot be used.']);
    exit;
}

// Destination must not already have active rental
$chk = $pdo->prepare("SELECT id FROM dbo.rentals WHERE pc_id = ? AND status = 'active'");
$chk->execute([$toPcId]);
if ($chk->fetch()) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'That PC already has an active rental.']);
    exit;
}

// Source PC name
$pcStmt->execute([$fromPcId]);
$source = $pcStmt->fetch();
$fromPcName = $source ? $source['name'] : (string) $fromPcId;
$toPcName = $target['name'];
$now = new DateTime();

// Remaining display time, captured at the moment of transfer. The display rolls
// and never reads zero, so the result is always 1..blockSeconds (Decision 39).
// This is a RECORD of the clock only — the clock itself is not touched, which is
// exactly why a transfer cannot create a charge (Decision 68, Rule 6).
$blockSeconds = (int) $rental['blockSeconds'];
$blockStartedAt = dbDateTime($rental['blockStartedAt']);

if ($blockStartedAt === null) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Could not read the rental start time.']);
    exit;
}

$blockMs = $blockSeconds * 1000;
$intoBlockMs = ($now->getTimestamp() * 1000) - ($blockStartedAt->getTimestamp() * 1000);
$wrapped = (($intoBlockMs % $blockMs) + $blockMs) % $blockMs;
$remainingSeconds = max(1, (int) ceil(($blockMs - $wrapped) / 1000));

// Update rental to point to new PC (clock untouched)
$updRent = $pdo->prepare("UPDATE dbo.rentals SET pc_id = ? WHERE id = ?");
$updRent->execute([$toPcId, $rental['id']]);

// Record transfer
$trInsert = $pdo->prepare("
    INSERT INTO dbo.transfers (rental_id, from_pc_id, from_pc_name, to_pc_id, to_pc_name, remaining_time_seconds, transferred_at, cashier_id)
    OUTPUT INSERTED.id
    VALUES (?, ?, ?, ?, ?, ?, SYSDATETIME(), ?)
");
$trInsert->execute([$rental['id'], $fromPcId, $fromPcName, $toPcId, $toPcName, $remainingSeconds, (int) $user['id']]);

// Source goes free only if genuinely rented
$srcStatus = $source ? $source['status'] : '';
if ($srcStatus === 'rented') {
    $updSrc = $pdo->prepare("UPDATE dbo.pcs SET status = 'free' WHERE id = ?");
    $updSrc->execute([$fromPcId]);
}

// Destination becomes rented
$updDst = $pdo->prepare("UPDATE dbo.pcs SET status = 'rented' WHERE id = ?");
$updDst->execute([$toPcId]);

echo json_encode(['ok' => true, 'transfer' => [
    'rentalId'       => (int) $rental['id'],
    'fromPcId'       => $fromPcId,
    'fromPcName'     => $fromPcName,
    'toPcId'         => $toPcId,
    'toPcName'       => $toPcName,
    'transferredAt'  => $now->format('Y-m-d\TH:i:s'),
]]);
