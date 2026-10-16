<?php
// server/config/cors.php
// Allows the Vite dev frontend to call this API with credentials.

declare(strict_types=1);

require_once __DIR__ . '/env.php';

$frontendOrigin = (string) env('FRONTEND_ORIGIN', 'http://localhost:5173');

header("Access-Control-Allow-Origin: $frontendOrigin");
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Max-Age: 86400');

// Preflight request - stop here.
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(204);
    exit;
}
