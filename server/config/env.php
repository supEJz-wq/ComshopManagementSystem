<?php
// server/config/env.php
//
// A tiny .env reader. No Composer, no phpdotenv — this project is plain PHP on
// purpose (Decision: plain PHP, no framework), and pulling in a package to read
// six lines of configuration would undo that.
//
// WHY THIS EXISTS. server/config/database.php used to hold the database
// credentials directly. That file is source code, so Git tracks it, so a real
// password typed into it would eventually be pushed to a public remote. The
// credentials now live in .env at the project root, which is gitignored, and
// .env.example is committed so anyone else knows what to fill in.
//
// This file is committed. It contains no secrets.

declare(strict_types=1);

/**
 * Read a value from .env, with a fallback.
 *
 * @param mixed $default returned when the key is absent or empty
 */
function env(string $key, mixed $default = null): mixed
{
    static $values = null;

    if ($values === null) {
        $values = loadEnvFile(projectRoot() . '/.env');
    }

    $value = $values[$key] ?? null;

    return ($value === null || $value === '') ? $default : $value;
}

/** True when a .env file was found and parsed. */
function hasEnvFile(): bool
{
    return is_file(projectRoot() . '/.env');
}

/** The project root, three levels up from server/config/. */
function projectRoot(): string
{
    return dirname(__DIR__, 2);
}

/**
 * Parse a .env file into an array.
 *
 * Supports the subset that matters here:
 *   KEY=value            plain
 *   KEY="value"           quoted, spaces allowed
 *   KEY='value'           single quoted, literal
 *   # comment             whole-line
 *   KEY=value  # comment  trailing comment on an unquoted value
 *
 * @return array<string, string>
 */
function loadEnvFile(string $path): array
{
    if (!is_file($path) || !is_readable($path)) {
        return [];
    }

    $values = [];

    foreach (file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [] as $line) {
        $line = trim($line);

        if ($line === '' || str_starts_with($line, '#')) {
            continue;
        }

        $splitAt = strpos($line, '=');

        if ($splitAt === false) {
            continue;
        }

        $key = trim(substr($line, 0, $splitAt));
        $value = trim(substr($line, $splitAt + 1));

        if ($key === '') {
            continue;
        }

        // Quoted value: keep it verbatim, minus the quotes.
        if (strlen($value) >= 2) {
            $first = $value[0];

            if (($first === '"' || $first === "'") && str_ends_with($value, $first)) {
                $values[$key] = substr($value, 1, -1);
                continue;
            }
        }

        // Unquoted: a trailing # starts a comment.
        $hash = strpos($value, ' #');

        if ($hash !== false) {
            $value = rtrim(substr($value, 0, $hash));
        }

        $values[$key] = trim($value, '"');
    }

    return $values;
}

/**
 * The database settings, from .env with sensible fallbacks.
 *
 * The fallbacks are the Windows Authentication path: no username and no
 * password, which makes the driver use the logged-in Windows account. That is
 * how this project connects today, and it is why .env is currently optional.
 *
 * @return array{server: string, database: string, username: string, password: string}
 */
function dbConfig(): array
{
    return [
        'server' => (string) env('DB_SERVER', 'localhost'),
        'database' => (string) env('DB_DATABASE', 'comshop'),
        'username' => (string) env('DB_USERNAME', ''),
        'password' => (string) env('DB_PASSWORD', ''),
    ];
}

/** True when SQL Server Authentication is in use rather than Windows Auth. */
function usingSqlAuth(): bool
{
    $config = dbConfig();

    return $config['username'] !== '' && $config['password'] !== '';
}
