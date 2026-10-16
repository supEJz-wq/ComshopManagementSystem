<?php
// server/api/auth/logout.php
// POST -> {ok: true}

declare(strict_types=1);

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../middleware/session.php';

destroySession();

echo json_encode(['ok' => true]);
