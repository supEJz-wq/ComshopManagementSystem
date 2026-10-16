<?php
// server/api/rentals/stop.php
// POST {pcId} -> Returns bill {pieces, usedSeconds, bookedSeconds, overstaySeconds, amountDue}
// Broken PC stays broken; rented PC goes free.

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

$user = requireAuth();
$pcId = wholeNumber($input['pcId'] ?? null);

if ($pcId === null || $pcId <= 0) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Invalid PC id.']);
    exit;
}

// Find active rental on this PC
$stmt = $pdo->prepare("
    SELECT r.id, r.pc_id AS pcId, r.started_at AS startedAt, r.block_seconds AS blockSeconds,
           r.block_started_at AS blockStartedAt, p.name AS pcName
    FROM dbo.rentals r
    INNER JOIN dbo.pcs p ON p.id = r.pc_id
    WHERE r.pc_id = ? AND r.status = 'active'
");
$stmt->execute([$pcId]);
$rental = $stmt->fetch();
if (!$rental) {
    http_response_code(404);
    echo json_encode(['ok' => false, 'error' => 'No active rental on this PC.']);
    exit;
}

$rentalId = (int) $rental['id'];
$startedAt = dbDateTime($rental['startedAt']);
$endedAt = new DateTime();

if ($startedAt === null) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Could not read the rental start time.']);
    exit;
}

// Elapsed seconds — real wall-clock time from the start, never the display roll
// (Decision 41). Computed from timestamps rather than a counter so a slow frame
// or a page refresh cannot give away free time.
$usedSeconds = max(0, $endedAt->getTimestamp() - $startedAt->getTimestamp());

// Segments (booked pieces)
$segStmt = $pdo->prepare("SELECT seconds, amount_charged AS amount FROM dbo.rental_segments WHERE rental_id = ? AND is_overstay = 0 ORDER BY id");
$segStmt->execute([$rentalId]);
$segments = $segStmt->fetchAll();

$bookedSeconds = 0;
$amountDue = 0;
foreach ($segments as $s) {
    $bookedSeconds += (int) $s['seconds'];
    $amountDue += (float) $s['amount'];
}

// INT and DECIMAL arrive as STRINGS from pdo_sqlsrv. Left as strings they would
// concatenate in the frontend's sum() instead of adding — see dbNum().
$pieces = array_map(static function (array $piece): array {
    $piece['seconds'] = dbInt($piece['seconds']);
    $piece['amount'] = dbNum($piece['amount']);
    return $piece;
}, $segments);

$overstaySeconds = max(0, $usedSeconds - $bookedSeconds);

// If overstay, add an overstay segment
if ($overstaySeconds > 0) {
    $overstayBlocks = ceil($overstaySeconds / 1800);
    $overstayAmount = $overstayBlocks * 10;
    // Promo check: exactly 6 hours (21600s) gets ₱100
    if ($overstaySeconds === 21600) {
        $overstayAmount = 100;
    }
    $overStmt = $pdo->prepare("
        INSERT INTO dbo.rental_segments (rental_id, seconds, amount_charged, is_promo, is_overstay, created_at)
        VALUES (?, ?, ?, ?, 1, SYSDATETIME())
    ");
    $overStmt->execute([$rentalId, $overstaySeconds, $overstayAmount, $overstaySeconds === 21600 ? 1 : 0]);
    // Appended to the CAST list, not the raw one: the raw rows are strings from
    // the driver and must not reach the frontend.
    $pieces[] = ['seconds' => (int) $overstaySeconds, 'amount' => (float) $overstayAmount, 'isOverstay' => true];
    $amountDue += $overstayAmount;
}

// Mark rental stopped
$updRent = $pdo->prepare("
    UPDATE dbo.rentals SET status = 'stopped', stopped_at = SYSDATETIME() WHERE id = ?
");
$updRent->execute([$rentalId]);

// PC goes free only if genuinely rented; broken stays broken
$pcStmt = $pdo->prepare("SELECT status FROM dbo.pcs WHERE id = ?");
$pcStmt->execute([$pcId]);
$pc = $pcStmt->fetch();
if ($pc && $pc['status'] === 'rented') {
    $updPc = $pdo->prepare("UPDATE dbo.pcs SET status = 'free' WHERE id = ?");
    $updPc->execute([$pcId]);
}

/*
  CREATE THE BILL.

  The server owns this now. On the frontend the bill was created by the client
  after stop; here the price is decided in exactly one place (Decision 59), so
  stopping a rental must write the UNSETTLED bill itself — otherwise there is
  nothing on the Payments screen to settle.

  The bill is created UNSETTLED on purpose: stopping does not require payment
  (Decision 56).

  The reference number is a true sequence, derived from the stored maximum and
  never from sort order, so inserting a late bill can never renumber history
  (Decision 108). UPDLOCK/HOLDLOCK makes the read-then-insert atomic, so two
  cashiers stopping rentals at the same instant cannot claim the same number.
*/
try {
    $pdo->beginTransaction();

    $refStmt = $pdo->query(
        'SELECT ISNULL(MAX(CAST(reference_number AS INT)), 0) + 1
         FROM dbo.payments WITH (UPDLOCK, HOLDLOCK)'
    );
    $reference = str_pad((string) (int) $refStmt->fetchColumn(), 5, '0', STR_PAD_LEFT);

    $billInsert = $pdo->prepare("
        INSERT INTO dbo.payments (
            rental_id, reference_number, pc_id, pc_name,
            started_at, ended_at, used_seconds, booked_seconds, overstay_seconds,
            amount_due, is_settled, cashier_id, cashier_name
        )
        OUTPUT INSERTED.id
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
    ");
    $billInsert->execute([
        $rentalId,
        $reference,
        $pcId,
        $rental['pcName'],
        $startedAt->format('Y-m-d H:i:s.v'),
        $endedAt->format('Y-m-d H:i:s.v'),
        $usedSeconds,
        $bookedSeconds,
        $overstaySeconds,
        $amountDue,
        $user['id'],
        $user['username'],
    ]);

    $paymentId = (int) $billInsert->fetch(PDO::FETCH_COLUMN);

    $pdo->commit();
} catch (Throwable $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Could not create the bill: ' . $e->getMessage()]);
    exit;
}

echo json_encode([
    'ok' => true,
    'rental' => [
        'id' => $rentalId,
        'pcId' => $pcId,
        'startedAt' => dbIso($rental['startedAt']),
        'endedAt' => dbIso($endedAt),
    ],
    'bill' => [
        'id' => $paymentId,
        'ref' => $reference,
        'pieces' => $pieces,
        'usedSeconds' => $usedSeconds,
        'bookedSeconds' => $bookedSeconds,
        'overstaySeconds' => $overstaySeconds,
        'amountDue' => $amountDue,
        'settled' => false,
    ],
]);
