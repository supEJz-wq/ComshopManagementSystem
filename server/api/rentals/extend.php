<?php
// server/api/rentals/extend.php
// POST {pcId, seconds} -> Validate remaining > 0, booked+seconds <= 24h, add segment

declare(strict_types=1);

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/helpers.php';
require_once __DIR__ . '/../../middleware/session.php';

requireAuth();

$input = json_decode(file_get_contents('php://input'), true) ?? [];

if (!is_array($input)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Invalid request body.']);
    exit;
}

$pcId = wholeNumber($input['pcId'] ?? null);
$seconds = wholeNumber($input['seconds'] ?? null);

if ($pcId === null || $pcId <= 0) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Invalid PC id.']);
    exit;
}

// Whole seconds only, at least one minute. Raw value checked before any cast —
// see wholeNumber() in config/helpers.php.
if ($seconds === null || $seconds < MIN_RENTAL_SECONDS) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Enter a duration of at least 1 minute.']);
    exit;
}

// Active rental on this PC
$stmt = $pdo->prepare("
    SELECT r.id, r.block_seconds AS blockSeconds, r.block_started_at AS blockStartedAt,
           r.started_at AS startedAt
    FROM dbo.rentals r
    WHERE r.pc_id = ? AND r.status = 'active'
");
$stmt->execute([$pcId]);
$rental = $stmt->fetch();
if (!$rental) {
    http_response_code(404);
    echo json_encode(['ok' => false, 'error' => 'No active rental on this PC.']);
    exit;
}

// Total booked seconds so far
$segStmt = $pdo->prepare("SELECT seconds FROM dbo.rental_segments WHERE rental_id = ?");
$segStmt->execute([$rental['id']]);
$booked = 0;
while ($s = $segStmt->fetch()) {
    $booked += (int) $s['seconds'];
}

// 24h cap
if ($booked + $seconds > MAX_RENTAL_SECONDS) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'A rental cannot be longer than 24 hours.']);
    exit;
}

// Remaining display time (computed from the block, never a counter)
$now = new DateTime();
$blockStarted = dbDateTime($rental['blockStartedAt']);

if ($blockStarted === null) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Could not read the rental start time.']);
    exit;
}

$blockSeconds = (int) $rental['blockSeconds'];
$blockMs = $blockSeconds * 1000;
$intoBlockMs = ($now->getTimestamp() * 1000) - ($blockStarted->getTimestamp() * 1000);
$wrapped = (($intoBlockMs % $blockMs) + $blockMs) % $blockMs;

// Never 0: the display rolls at the block boundary and must not show 0:00
// (Decision 39).
$remaining = max(1, (int) ceil(($blockMs - $wrapped) / 1000));

if ($remaining <= 0) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Cannot extend at zero minutes.']);
    exit;
}

$newBlockSeconds = $remaining + $seconds;
$amount = priceForPiece($seconds);

// Restart display block
$updRent = $pdo->prepare("
    UPDATE dbo.rentals SET block_seconds = ?, block_started_at = SYSDATETIME() WHERE id = ?
");
$updRent->execute([$newBlockSeconds, $rental['id']]);

// Add priced extension segment
$segInsert = $pdo->prepare("
    INSERT INTO dbo.rental_segments (rental_id, seconds, amount_charged, is_promo, is_overstay, created_at)
    VALUES (?, ?, ?, ?, 0, SYSDATETIME())
");
$segInsert->execute([$rental['id'], $seconds, $amount, $seconds === 21600 ? 1 : 0]);

echo json_encode(['ok' => true, 'rental' => [
    'id'           => (int) $rental['id'],
    'pcId'         => $pcId,
    'blockSeconds' => $newBlockSeconds,
    'segments'     => [['seconds' => $seconds, 'amount' => $amount]],
]]);
