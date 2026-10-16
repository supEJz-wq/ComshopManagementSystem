<?php
// server/api/pcs/repair.php
// POST -> Clear needsRepair. If was issue/unresponsive, set to free.

declare(strict_types=1);

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../middleware/session.php';

requireAuth();

$input = json_decode(file_get_contents('php://input'), true) ?? [];
$pcId = (int) ($input['id'] ?? 0);
if ($pcId <= 0) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Invalid PC id.']);
    exit;
}

$stmt = $pdo->prepare("SELECT status, needs_repair FROM dbo.pcs WHERE id = ?");
$stmt->execute([$pcId]);
$pc = $stmt->fetch();
if (!$pc) {
    http_response_code(404);
    echo json_encode(['ok' => false, 'error' => 'PC not found.']);
    exit;
}

$newStatus = in_array($pc['status'], ['issue', 'unresponsive'], true) ? 'free' : $pc['status'];

$update = $pdo->prepare("UPDATE dbo.pcs SET status = ?, needs_repair = 0 WHERE id = ?");
$update->execute([$newStatus, $pcId]);

echo json_encode(['ok' => true, 'pc' => [
    'id'          => $pcId,
    'status'      => $newStatus,
    'needsRepair' => false,
]]);
