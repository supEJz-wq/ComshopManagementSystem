<?php
// server/router.php
//
// Used only by PHP's built-in development server:
//
//     php -S localhost:8000 router.php
//
// Its whole job is to hand /api requests to the front controller
// (api/index.php), which owns method + path routing. Everything else is served
// as a plain file.
//
//   /api/...            -> api/index.php   (method + path dispatch, auth gate)
//   /api/....php        -> also api/index.php, with the extension stripped, so
//                          the endpoints work with or without ".php"
//   /anything-else      -> served as-is, or 404
//
// A production web server (Apache/Nginx/IIS) would do the same rewrite with a
// rule pointing /api at api/index.php; this file is only the dev-server
// equivalent.

declare(strict_types=1);

$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
$path = is_string($path) ? rawurldecode($path) : '/';
$apiPath = '/' . trim($path, '/');

// Reject anything that tries to climb out of the server directory.
if (str_contains($path, '..') || str_contains($path, "\0")) {
    http_response_code(400);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['ok' => false, 'error' => 'Bad request.']);
    return true;
}

// The API, with or without a trailing ".php", always goes to the front
// controller so method + path routing AND the auth gate live in exactly one
// place. There is deliberately no "is there a file with this name" shortcut:
// that shortcut would let an endpoint be reached without passing the gate.
if (str_starts_with($apiPath, '/api')) {
    if (str_ends_with($apiPath, '.php')) {
        $apiPath = substr($apiPath, 0, -4);
    }

    require __DIR__ . '/api/index.php';
    return true;
}

// Everything else: a real file is served as-is.
$target = __DIR__ . $path;

if (is_file($target)) {
    return false;
}

// A directory with an index.php.
if (is_dir($target) && is_file($target . '/index.php')) {
    require $target . '/index.php';
    return true;
}

http_response_code(404);
header('Content-Type: application/json; charset=utf-8');
echo json_encode(['ok' => false, 'error' => 'Not found: ' . $path]);

return true;
