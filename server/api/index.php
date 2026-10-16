<?php
// server/api/index.php
//
// THE FRONT CONTROLLER. Every /api request arrives here (see ../router.php) and
// is dispatched on METHOD + PATH.
//
// WHY THIS EXISTS. Mapping URLs straight onto files does not work for a REST API
// on PHP's built-in server:
//
//   POST /api/pcs        and    GET /api/pcs        are different endpoints, but
//                                                     they resolve to the same file
//   PATCH /api/pcs/5/status       has an id IN THE PATH, which a file-per-endpoint
//                                                     layout cannot express at all
//
// Both were live bugs: POST /api/pcs silently ran the PC *list*, and the status
// endpoint was unreachable. So the routing lives in one table here, where the
// method and the path pattern are both visible and checked.
//
// Nothing else decides what a URL means.

declare(strict_types=1);

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
$path = is_string($path) ? rawurldecode($path) : '/';
$path = '/' . trim($path, '/');

// Only /api is handled here.
if (!str_starts_with($path, '/api/')) {
    http_response_code(404);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['ok' => false, 'error' => 'Not found: ' . $path]);
    return;
}

$path = substr($path, 4); // strip "/api", keep the leading slash

/*
  ROUTE TABLE.

  Pattern placeholders:
      {id}   one path segment, captured into $_GET['id']

  'auth' is enforced by including the middleware BEFORE the endpoint runs, so an
  endpoint cannot forget to check. That is the whole point of doing it here
  rather than inside each file.
*/
$routes = [
    // ---- auth ----------------------------------------------------------
    'POST /auth/login' => ['file' => 'auth/login.php', 'auth' => 'none'],
    'POST /auth/logout' => ['file' => 'auth/logout.php', 'auth' => 'session'],
    'GET /auth/me' => ['file' => 'auth/me.php', 'auth' => 'session'],
    'POST /auth/reset-password' => ['file' => 'auth/reset-password.php', 'auth' => 'admin'],
    'POST /auth/deactivate' => ['file' => 'auth/deactivate.php', 'auth' => 'admin'],

    // ---- pcs -----------------------------------------------------------
    'GET /pcs' => ['file' => 'pcs/index.php', 'auth' => 'session'],
    'POST /pcs' => ['file' => 'pcs/store.php', 'auth' => 'admin'],
    'PATCH /pcs/{id}/status' => ['file' => 'pcs/status.php', 'auth' => 'session'],
    'POST /pcs/repair' => ['file' => 'pcs/repair.php', 'auth' => 'session'],

    // ---- rentals -------------------------------------------------------
    'GET /rentals/active' => ['file' => 'rentals/active.php', 'auth' => 'session'],
    'POST /rentals/start' => ['file' => 'rentals/start.php', 'auth' => 'session'],
    'POST /rentals/stop' => ['file' => 'rentals/stop.php', 'auth' => 'session'],
    'POST /rentals/extend' => ['file' => 'rentals/extend.php', 'auth' => 'session'],
    'POST /rentals/transfer' => ['file' => 'rentals/transfer.php', 'auth' => 'session'],
    'GET /rentals/targets' => ['file' => 'rentals/targets.php', 'auth' => 'session'],

    // ---- payments ------------------------------------------------------
    'GET /payments' => ['file' => 'payments/index.php', 'auth' => 'session'],
    'GET /payments/unsettled' => ['file' => 'payments/unsettled.php', 'auth' => 'session'],
    'GET /payments/settled' => ['file' => 'payments/settled.php', 'auth' => 'session'],
    'POST /payments/settle' => ['file' => 'payments/settle.php', 'auth' => 'session'],
    'POST /payments/refund' => ['file' => 'payments/refund.php', 'auth' => 'session'],

    // ---- revenue -------------------------------------------------------
    'GET /revenue' => ['file' => 'revenue/index.php', 'auth' => 'session'],
    'GET /revenue/net-for-bill' => ['file' => 'revenue/net-for-bill.php', 'auth' => 'session'],

    // ---- analytics (admin only) ----------------------------------------
    'GET /analytics/collected-by-day' => ['file' => 'analytics/collected-by-day.php', 'auth' => 'admin'],
    'GET /analytics/collected-by-month' => ['file' => 'analytics/collected-by-month.php', 'auth' => 'admin'],
    'GET /analytics/collected-by-year' => ['file' => 'analytics/collected-by-year.php', 'auth' => 'admin'],
    'GET /analytics/collected-by-hour' => ['file' => 'analytics/collected-by-hour.php', 'auth' => 'admin'],
    'GET /analytics/best-hour' => ['file' => 'analytics/best-hour.php', 'auth' => 'admin'],
    'GET /analytics/best-month' => ['file' => 'analytics/best-month.php', 'auth' => 'admin'],
    'GET /analytics/collected-by-cashier' => ['file' => 'analytics/collected-by-cashier.php', 'auth' => 'admin'],
];

$matched = null;
$params = [];

// Exact match first.
$key = $method . ' ' . $path;
if (isset($routes[$key])) {
    $matched = $routes[$key];
}

// Then placeholder patterns, e.g. PATCH /pcs/{id}/status.
if ($matched === null) {
    foreach ($routes as $pattern => $route) {
        [$patternMethod, $patternPath] = explode(' ', $pattern, 2);

        if ($patternMethod !== $method) {
            continue;
        }

        $regex = '#^' . str_replace('\{id\}', '(\d+)', preg_quote($patternPath, '#')) . '$#';

        if (preg_match($regex, $path, $m) === 1) {
            $matched = $route;
            $params['id'] = $m[1];
            break;
        }
    }
}

// 404  no such endpoint.
if ($matched === null) {
    http_response_code(404);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['ok' => false, 'error' => 'No such endpoint: ' . $method . ' ' . $path]);
    return;
}

// Path parameters become ordinary query parameters for the endpoint.
foreach ($params as $name => $value) {
    $_GET[$name] = $value;
}

// CORS and the database connection are needed by every endpoint.
require_once __DIR__ . '/../config/cors.php';
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/session.php';

// Auth is enforced HERE, before the endpoint body runs.
if ($matched['auth'] === 'admin') {
    requireAdmin();
} elseif ($matched['auth'] === 'session') {
    requireAuth();
}

require __DIR__ . '/' . $matched['file'];
