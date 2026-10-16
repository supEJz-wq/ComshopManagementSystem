<?php
// server/api/rentals/targets.php
// GET ?fromPcId= -> Eligible destinations: free or issue, not occupied, not source

declare(strict_types=1);

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../middleware/session.php';

requireAuth();

$fromPcId = (int) ($_GET['fromPcId'] ?? 0);
if ($fromPcId <= 0) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Invalid fromPcId.']);
    exit;
}

// Active rentals (occupied PCs)
$occStmt = $pdo->query("SELECT pc_id FROM dbo.rentals WHERE status = 'active'");
$occupied = [];
while ($r = $occStmt->fetch()) {
    $occupied[] = (int) $r['pc_id'];
}

$stmt = $pdo->prepare("
    SELECT id, name, status, needs_repair AS needsRepair
    FROM dbo.pcs
    WHERE id != ?
      AND (status = 'free' OR status = 'issue')
      AND id NOT IN (" . implode(',', array_fill(0, count($occupied), '?')) . ")
    ORDER BY name
");
if (count($occupied) > 0) {
    $params = array_merge([$fromPcId], $occupied);
    $stmt->execute($params);
} else {
    $stmt->execute([$fromPcId]);
}

$targets = array_map(static function (array $row): array {
    $row['id'] = (int) $row['id'];
    $row['needsRepair'] = dbBool($row['needsRepair']);
    return $row;
}, $stmt->fetchAll());

echo json_encode(['ok' => true, 'targets' => $targets]);
