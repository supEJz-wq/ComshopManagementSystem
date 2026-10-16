<?php
// server/api/pcs/store.php
// POST {name} -> Admin only. Add PC with unique name.

declare(strict_types=1);

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../middleware/session.php';

requireAdmin();

$input = json_decode(file_get_contents('php://input'), true) ?? [];
$name = trim($input['name'] ?? '');

if ($name === '') {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Enter a name for the PC.']);
    exit;
}

// Unique name check (case-insensitive)
$chk = $pdo->prepare("SELECT id FROM dbo.pcs WHERE name = ?");
$chk->execute([$name]);
if ($chk->fetch()) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => "$name already exists."]);
    exit;
}

$insert = $pdo->prepare("INSERT INTO dbo.pcs (name, status, needs_repair) OUTPUT INSERTED.id VALUES (?, 'free', 0)");
$insert->execute([$name]);
$newId = (int) $insert->fetch(PDO::FETCH_COLUMN);

echo json_encode(['ok' => true, 'pc' => ['id' => $newId, 'name' => $name, 'status' => 'free', 'needsRepair' => false]]);
