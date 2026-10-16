<?php
// server/api/auth/me.php
// GET -> {ok: true, user: {...}}

declare(strict_types=1);

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../middleware/session.php';

$user = requireAuth();

echo json_encode([
    'ok'      => true,
    'user'    => [
        'id'       => $user['id'],
        'username' => $user['username'],
        'role'     => $user['role'],
        'active'   => $user['active'],
    ],
]);
