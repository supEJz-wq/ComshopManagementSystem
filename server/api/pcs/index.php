<?php
// server/api/pcs/index.php
// GET -> {ok: true, pcs: [{id, name, status, needsRepair}]}

declare(strict_types=1);

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../middleware/session.php';

requireAuth(); // any signed-in user can view PCs

$stmt = $pdo->query("SELECT id, name, status, needs_repair AS needsRepair, created_at FROM dbo.pcs ORDER BY name");
$pcs = array_map(static function (array $row): array {
    // BIT and INT arrive as strings from pdo_sqlsrv. A "0" string is TRUTHY in
    // JavaScript, so these must be cast here or every PC reads as needing repair.
    $row['id'] = (int) $row['id'];
    $row['needsRepair'] = dbBool($row['needsRepair']);
    $row['created_at'] = dbIso($row['created_at']);
    return $row;
}, $stmt->fetchAll());

echo json_encode(['ok' => true, 'pcs' => $pcs]);
