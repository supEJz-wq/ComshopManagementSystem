<?php
// server/api/pcs/status.php
// PATCH {status} -> Validate ALLOWED_TRANSITIONS. Raise needsRepair on fault.

declare(strict_types=1);

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../middleware/session.php';

requireAuth();

$pcId = (int) ($_GET['id'] ?? 0);
if ($pcId <= 0) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Invalid PC id.']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true) ?? [];
$nextStatus = $input['status'] ?? '';

$allowed = [
    'free'        => ['free', 'rented', 'issue', 'unresponsive'],
    'rented'      => ['free', 'rented', 'issue', 'unresponsive'],
    'issue'       => ['free', 'rented', 'unresponsive'],
    'unresponsive'=> ['free'],
];

if (!in_array($nextStatus, ['free', 'rented', 'issue', 'unresponsive'], true)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Invalid status.']);
    exit;
}

// Load current PC
$stmt = $pdo->prepare("SELECT status, needs_repair FROM dbo.pcs WHERE id = ?");
$stmt->execute([$pcId]);
$pc = $stmt->fetch();
if (!$pc) {
    http_response_code(404);
    echo json_encode(['ok' => false, 'error' => 'PC not found.']);
    exit;
}

$current = $pc['status'];
if (!in_array($nextStatus, $allowed[$current] ?? [], true)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => "Cannot transition $current → $nextStatus."]);
    exit;
}

// Entering a fault state raises needsRepair; never lowered here
$faulted = in_array($nextStatus, ['issue', 'unresponsive'], true);
$needsRepair = $faulted ? 1 : (int) $pc['needs_repair'];

$update = $pdo->prepare("UPDATE dbo.pcs SET status = ?, needs_repair = ? WHERE id = ?");
$update->execute([$nextStatus, $needsRepair, $pcId]);

echo json_encode(['ok' => true, 'pc' => [
    'id'          => $pcId,
    'status'      => $nextStatus,
    'needsRepair' => (bool) $needsRepair,
]]);
