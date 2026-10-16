<?php
// server/api/rentals/start.php
// POST {pcId, seconds} -> Validate duration, PC free, not already rented, 24h cap

declare(strict_types=1);

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../config/helpers.php';
require_once __DIR__ . '/../../middleware/session.php';

$user = requireAuth();

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
    echo json_encode(['ok' => false, 'error' => 'Select a PC.']);
    exit;
}

// Whole seconds only, and at least one minute (Decision 62). The raw value is
// checked before any cast — see wholeNumber() for why.
if ($seconds === null || $seconds < MIN_RENTAL_SECONDS) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Enter a duration of at least 1 minute.']);
    exit;
}

if ($seconds > MAX_RENTAL_SECONDS) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'A rental cannot be longer than 24 hours.']);
    exit;
}

// PC must exist and be free
$stmt = $pdo->prepare("SELECT id, name, status FROM dbo.pcs WHERE id = ?");
$stmt->execute([$pcId]);
$pc = $stmt->fetch();
if (!$pc) {
    http_response_code(404);
    echo json_encode(['ok' => false, 'error' => 'That PC does not exist.']);
    exit;
}
if ($pc['status'] !== 'free') {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'This PC is not available for a new rental.']);
    exit;
}

// PC must not already have an active rental
$chk = $pdo->prepare("SELECT id FROM dbo.rentals WHERE pc_id = ? AND status = 'active'");
$chk->execute([$pcId]);
if ($chk->fetch()) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'This PC already has an active rental.']);
    exit;
}

$now = new DateTime();
// SQL literal for the database...
$startedAtSql = $now->format('Y-m-d H:i:s.v');

// Start rental
$insert = $pdo->prepare("
    INSERT INTO dbo.rentals (pc_id, started_at, block_seconds, block_started_at, status, cashier_id, created_at)
    OUTPUT INSERTED.id
    VALUES (?, ?, ?, ?, 'active', ?, SYSDATETIME())
");
$insert->execute([$pcId, $startedAtSql, $seconds, $startedAtSql, $user['id']]);
$rentalId = (int) $insert->fetch(PDO::FETCH_COLUMN);

// First segment = the booking
$amount = priceForPiece($seconds);
$segInsert = $pdo->prepare("
    INSERT INTO dbo.rental_segments (rental_id, seconds, amount_charged, is_promo, is_overstay, created_at)
    VALUES (?, ?, ?, ?, 0, SYSDATETIME())
");
$segInsert->execute([$rentalId, $seconds, $amount, $amount === 100 ? 1 : 0]);

// Mark PC rented
$upd = $pdo->prepare("UPDATE dbo.pcs SET status = 'rented' WHERE id = ?");
$upd->execute([$pcId]);

echo json_encode(['ok' => true, 'rental' => [
    'id'            => $rentalId,
    'pcId'          => $pcId,
    'blockSeconds'  => $seconds,
    'startedAt'     => dbIso($startedAtSql),
    'blockStartedAt'=> dbIso($startedAtSql),
    'segments'      => [['seconds' => $seconds, 'amount' => $amount]],
]]);
