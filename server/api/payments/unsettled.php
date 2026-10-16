<?php
// server/api/payments/unsettled.php
// GET -> Unsettled bills, oldest first, with waiting age

declare(strict_types=1);

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../middleware/session.php';

requireAuth();

$stmt = $pdo->prepare("
    SELECT p.id, p.reference_number, p.pc_name, p.started_at, p.amount_due,
           DATEDIFF(MINUTE, p.created_at, SYSDATETIME()) AS waitingMinutes
    FROM dbo.payments p
    WHERE p.is_settled = 0
    ORDER BY p.created_at ASC
");
$stmt->execute();
$bills = $stmt->fetchAll();

foreach ($bills as &$b) {
    $b['id'] = (int) $b['id'];
    $b['amount_due'] = (float) $b['amount_due'];
    $b['started_at'] = dbIso($b['started_at']);
    $b['waitingAge'] = (int) ($b['waitingMinutes'] ?? 0);
    unset($b['waitingMinutes']);
}
unset($b);

echo json_encode(['ok' => true, 'unsettled' => $bills]);
