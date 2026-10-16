<?php
// server/middleware/session.php
// Session gate. Every protected endpoint goes through here.
//
// ORDER MATTERS: the cookie settings must be applied BEFORE session_start().
// Set after it, they are silently ignored  the session has already been sent.
// That was the bug this file previously had.

declare(strict_types=1);

// Local dev is plain HTTP, so session.cookie_secure stays off. Turn it on when
// the shop moves behind HTTPS.
ini_set('session.use_only_cookies', '1');
ini_set('session.use_strict_mode', '1');
ini_set('session.cookie_httponly', '1');
ini_set('session.cookie_samesite', 'Lax');

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

/**
 * The signed-in user, or a 401 and exit.
 *
 * The account is re-read from the database on every request rather than trusted
 * from the session payload, so deactivating the Cashier takes effect on their
 * next request instead of whenever their cookie happens to expire.
 */
function requireAuth(): array
{
    $userId = $_SESSION['user_id'] ?? null;

    if ($userId === null) {
        http_response_code(401);
        echo json_encode(['ok' => false, 'error' => 'Not signed in.']);
        exit;
    }

    global $pdo;

    $stmt = $pdo->prepare('SELECT id, username, role, is_active FROM dbo.users WHERE id = ?');
    $stmt->execute([(int) $userId]);
    $account = $stmt->fetch();

    if (!$account) {
        destroySession();
        http_response_code(401);
        echo json_encode(['ok' => false, 'error' => 'Not signed in.']);
        exit;
    }

    if (!((int) $account['is_active'] === 1)) {
        destroySession();
        http_response_code(401);
        echo json_encode([
            'ok' => false,
            'error' => 'This account is deactivated. Ask the owner to reactivate it.',
        ]);
        exit;
    }

    // Keep the session payload in step with the database.
    $_SESSION['username'] = $account['username'];
    $_SESSION['role'] = $account['role'];

    return [
        'id' => (int) $account['id'],
        'username' => $account['username'],
        'role' => $account['role'],
        'active' => true,
    ];
}

/**
 * The same, plus a role gate. Role permissions are ENFORCED here, not merely
 * hidden in the UI (Phase 10 completion criterion).
 */
function requireAdmin(): array
{
    $user = requireAuth();

    if ($user['role'] !== 'Admin') {
        http_response_code(403);
        echo json_encode(['ok' => false, 'error' => 'Admin only.']);
        exit;
    }

    return $user;
}

function destroySession(): void
{
    $_SESSION = [];

    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(
            session_name(),
            '',
            time() - 42000,
            $params['path'],
            $params['domain'],
            $params['secure'],
            $params['httponly'],
        );
    }

    if (session_status() === PHP_SESSION_ACTIVE) {
        session_destroy();
    }
}
