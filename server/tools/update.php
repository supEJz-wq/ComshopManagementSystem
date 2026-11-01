<?php
// server/tools/update.php
//
// The safe way to apply a schema change.
//
//   php server/tools/update.php            structure only (additive, nothing dropped)
//   php server/tools/update.php --seed     structure + demo data
//   php server/tools/update.php --file=database/migrations/002_x.sql
//
// THE ORDER MATTERS, and it is the whole point of this script:
//
//   1. BACKUP   if this fails, NOTHING is applied
//   2. SNAPSHOT record the shape and the money before touching anything
//   3. APPLY    additive, guarded DDL  never a DROP
//   4. VERIFY   shape complete, no data lost, no money altered
//   5. REPORT   what changed, or that nothing needed doing
//
// A verification that only checked "did it run without error" would be worthless:
// it passed on a schema whose revenue query was fatally broken.

declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    http_response_code(403);
    exit("This script is command-line only.\n");
}

require_once __DIR__ . '/db-admin.php';

/**
 * Resolve a --file argument to a real file.
 *
 * Two bases are accepted, in this order: the project root, which is what a
 * person types ("database/migrations/001_x.sql"), and this script's own
 * directory, which is the older form ("../database/migrations/001_x.sql").
 * An absolute path is used exactly as given.
 */
function locateSqlFile(string $path): string
{
    $fromRoot = __DIR__ . '/../../' . $path;

    if (is_file($fromRoot)) {
        return $fromRoot;
    }

    $fromScript = __DIR__ . '/' . $path;

    return is_file($fromScript) ? $fromScript : $fromRoot;
}

$withSeed = in_array('--seed', $argv, true);
$only = null;

foreach ($argv as $arg) {
    if (str_starts_with($arg, '--file=')) {
        $only = substr($arg, 7);
    }
}

$exitCode = 0;

try {
    // ------------------------------------------------------------ 1. BACKUP
    step('1. BACKUP');

    $backupPath = backupDatabase();
    out('Backup', basename($backupPath));
    out('Size', round(filesize($backupPath) / 1048576, 2) . ' MB');

    // ---------------------------------------------------------- 2. SNAPSHOT
    step('2. SNAPSHOT (before)');

    $before = inspectDatabase();
    $moneyBefore = moneyTotals();

    foreach ($before['counts'] as $table => $count) {
        out($table, (string) $count);
    }

    out('amount_due', (string) $moneyBefore['amount_due']);
    out('amount_charged', (string) $moneyBefore['amount_charged']);
    out('refunds', (string) $moneyBefore['refunds']);

    // ------------------------------------------------------------ 3. APPLY
    step('3. APPLY');

    if ($only !== null) {
        $target = str_starts_with($only, '/') || preg_match('#^[A-Za-z]:#', $only)
            ? $only
            : locateSqlFile(ltrim($only, './'));

        out('Applying', $target);
        out('Statements', (string) applySqlFile($target));
    } else {
        out('Applying', 'database/schema.sql');
        out('Statements', (string) applySqlFile(__DIR__ . '/../../database/schema.sql'));

        if ($withSeed) {
            echo "\n";
            out('Applying', 'database/seed.sql');
            out('Statements', (string) applySqlFile(__DIR__ . '/../../database/seed.sql'));
        } else {
            echo "\n(seed.sql skipped  pass --seed to include it)\n";
        }
    }

    // ----------------------------------------------------------- 4. VERIFY
    step('4. VERIFY');

    $shape = verifyShape();

    if ($shape['ok']) {
        out('Shape', 'complete');
    } else {
        out('Shape', 'MISSING -> ' . implode(', ', $shape['missing']));
        $exitCode = 1;
    }

    $after = inspectDatabase();
    $moneyAfter = moneyTotals();

    // Nothing may be lost. schema.sql and migrations are additive, so any drop in
    // a row count means something destructive ran.
    foreach ($before['counts'] as $table => $countBefore) {
        $countAfter = $after['counts'][$table] ?? 0;

        if ($countAfter < $countBefore) {
            out('DATA LOST in ' . $table, "{$countBefore} -> {$countAfter}");
            $exitCode = 1;
        } elseif ($countAfter > $countBefore) {
            out('rows added to ' . $table, "{$countBefore} -> {$countAfter}");
        }
    }

    foreach ($before['tables'] as $table) {
        if (!in_array($table, $after['tables'], true)) {
            out('TABLE LOST', $table);
            $exitCode = 1;
        }
    }

    foreach ($before['columns'] as $column) {
        if (!in_array($column, $after['columns'], true)) {
            out('COLUMN LOST', $column);
            $exitCode = 1;
        }
    }

    foreach ($before['indexes'] as $index) {
        if (!in_array($index, $after['indexes'], true)) {
            out('INDEX LOST', $index);
            $exitCode = 1;
        }
    }

    // Money must be untouched by a structural change. seed.sql does not alter
    // amounts either  only the demo passwords.
    foreach ($moneyBefore as $key => $value) {
        if (abs($moneyAfter[$key] - $value) > 0.001) {
            out('MONEY CHANGED: ' . $key, "{$value} -> {$moneyAfter[$key]}");
            $exitCode = 1;
        }
    }

    if ($exitCode === 0) {
        out('Data', 'intact');
        out('Money', 'unchanged');
    }

    // ------------------------------------------------------------ 5. REPORT
    step('5. REPORT');

    $addedTables = array_diff($after['tables'], $before['tables']);
    $addedColumns = array_diff($after['columns'], $before['columns']);
    $addedIndexes = array_diff($after['indexes'], $before['indexes']);

    if ($addedTables === [] && $addedColumns === [] && $addedIndexes === []) {
        echo "Nothing needed doing. The database was already up to date.\n";
    } else {
        if ($addedTables !== []) {
            echo 'tables added  : ' . implode(', ', $addedTables) . "\n";
        }
        if ($addedColumns !== []) {
            echo 'columns added : ' . implode(', ', $addedColumns) . "\n";
        }
        if ($addedIndexes !== []) {
            echo 'indexes added : ' . implode(', ', $addedIndexes) . "\n";
        }
    }

    echo "\nBackup kept at: " . $backupPath . "\n";

    if ($exitCode === 0) {
        echo "\nOK.\n";
    } else {
        echo "\nPROBLEMS FOUND (exit " . $exitCode . "). Review the VERIFY section above.\n";
        echo "To go back:  php server/tools/restore.php " . basename($backupPath) . " --yes\n";
    }
} catch (Throwable $e) {
    echo "\nFAILED: " . $e->getMessage() . "\n";

    if (isset($backupPath)) {
        echo "\nNothing was lost  a backup was taken first:\n  " . $backupPath . "\n";
        echo "To go back:  php server/tools/restore.php " . basename($backupPath) . " --yes\n";
    }

    exit(1);
}

exit($exitCode);
