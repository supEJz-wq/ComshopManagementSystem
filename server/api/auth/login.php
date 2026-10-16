<?php
// server/api/auth/login.php
// POST {username, password} -> {ok: true} or {ok: false, error}

declare(strict_types=1);

require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../middleware/session.php';

$input = json_decode(file_get_contents('php://input'), true) ?? [];
$username = trim($input['username'] ?? '');
$password = $input['password'] ?? '';

if ($username === '' || $password === '') {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Username and password are required.']);
    exit;
}

// Look up account (case-insensitive username)
$stmt = $pdo->prepare("SELECT id, username, password_hash, role, is_active FROM dbo.users WHERE username = ?");
$stmt->execute([strtolower($username)]);
$user = $stmt->fetch();

if (!$user) {
    http_response_code(401);
    echo json_encode(['ok' => false, 'error' => 'No account with that username.']);
    exit;
}

if (!$user['is_active']) {
    http_response_code(401);
    echo json_encode([
        'ok'    => false,
        'error' => 'This account is deactivated. Ask the owner to reactivate it.',
    ]);
    exit;
}

if (!password_verify($password, $user['password_hash'])) {
    http_response_code(401);
    echo json_encode(['ok' => false, 'error' => 'Incorrect password.']);
    exit;
}

// Establish PHP session
$_SESSION['user_id']    = (int) $user['id'];
$_SESSION['username']   = $user['username'];
$_SESSION['role']       = $user['role'];
$_SESSION['is_active']  = (bool) $user['is_active'];

echo json_encode([
    'ok'      => true,
    'user'    => [
        'id'       => (int) $user['id'],
        'username' => $user['username'],
        'role'     => $user['role'],
        'active'   => (bool) $user['is_active'],
    ],
]);
