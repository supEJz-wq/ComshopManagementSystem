<?php
// server/middleware/admin.php
// Convenience alias for the Admin gate, which lives in session.php next to the
// other auth helpers. Kept as its own file so an endpoint can require it by name
// and be obvious about what it is protecting.

declare(strict_types=1);

require_once __DIR__ . '/session.php';

/** @return array the signed-in Admin */
function adminOnly(): array
{
    return requireAdmin();
}
