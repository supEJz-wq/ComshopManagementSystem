<?php
// server/config/app.php
// Application-wide settings that are not the database and not the API surface.

declare(strict_types=1);

/*
  TIMEZONE.

  The shop is in the Philippines. SQL Server reports +08:00, but PHP falls back
  to UTC when date.timezone is unset  which is the case in a stock php.ini.
  That made "today" mean the wrong day: the database said 2026-10-17 03:06
  local while PHP computed a Today window of 2026-10-16 → 2026-10-17. Every
  revenue figure for "today" would have been silently wrong for eight hours a
  day.

  Period boundaries are computed in PHP and compared against DATETIME2 columns,
  so the two clocks must agree. Setting it here keeps them together.
*/
date_default_timezone_set('Asia/Manila');

/**
 * Turn a DATETIME2 value from SQL Server into a DateTime.
 *
 * WHY THIS EXISTS. pdo_sqlsrv returns DATETIME2 as a STRING unless the driver is
 * told otherwise, so `$row['started_at']->format(...)` fatals with
 * "Call to a member function format() on string". This accepts either shape so
 * no endpoint has to care which one it got.
 */
function dbDateTime($value): ?DateTime
{
    if ($value instanceof DateTimeInterface) {
        return new DateTime($value->format('Y-m-d H:i:s.u'), $value->getTimezone());
    }

    if (is_string($value) && trim($value) !== '') {
        try {
            return new DateTime($value);
        } catch (Exception $e) {
            return null;
        }
    }

    return null;
}

/**
 * A DATETIME2 value as an ISO-8601 string for JSON, or null.
 *
 * The frontend runs `new Date(timestamp)`, which needs ISO-8601. SQL Server's
 * native "2026-10-17 03:06:25.3159351" is not reliably parsed by JavaScript, so
 * it must not be sent raw.
 */
function dbIso($value): ?string
{
    $dt = dbDateTime($value);

    return $dt === null ? null : $dt->format('Y-m-d\TH:i:s.v');
}

/**
 * A BIT column as a real JSON boolean.
 *
 * pdo_sqlsrv returns BIT as the string "0" or "1". In JavaScript the string
 * "0" is TRUTHY, so every PC would have rendered as needing repair. Cast at the
 * boundary rather than trusting each endpoint to remember.
 */
function dbBool($value): bool
{
    if (is_bool($value)) {
        return $value;
    }

    if (is_int($value) || is_float($value)) {
        return (int) $value === 1;
    }

    if (is_string($value)) {
        return in_array(trim($value), ['1', 'true', 'True'], true);
    }

    return false;
}

/**
 * An INT or DECIMAL column as a real JSON number.
 *
 * Same reason as dbBool(): pdo_sqlsrv returns numeric columns as STRINGS unless
 * told otherwise. That is not cosmetic. The frontend sums the pieces like
 *
 *     rental.segments.reduce((sum, piece) => sum + piece.seconds, 0)
 *
 * and in JavaScript 0 + "3600" is "03600", not 3600. A stringified number would
 * quietly corrupt bookedSeconds and every amount derived from it.
 */
function dbNum($value): float
{
    if (is_int($value) || is_float($value)) {
        return (float) $value;
    }

    if (is_string($value) && is_numeric(trim($value))) {
        return (float) trim($value);
    }

    return 0.0;
}

/** An INT column as a real JSON integer. */
function dbInt($value): int
{
    if (is_int($value)) {
        return $value;
    }

    if (is_float($value) && is_finite($value)) {
        return (int) $value;
    }

    if (is_string($value) && preg_match('/^-?\d+$/', trim($value)) === 1) {
        return (int) trim($value);
    }

    return 0;
}

/**
 * Resolve a period into a [start, end) window.
 *
 *   today  the current local calendar day
 *   month  the current CALENDAR month, not a rolling 30 days
 *   year   the current CALENDAR year, not a rolling 365 days
 *   all    unbounded  start and end are both null
 *   2026   that specific calendar year, so Analytics can offer a year list
 *
 * Calendar periods, not rolling windows, because the cashier's view resets when
 * the next day arrives (Decision 109).
 *
 * `end` is EXCLUSIVE so a record stamped at exactly midnight belongs to the new
 * day and never to both.
 *
 * Returns null for an unrecognised period.
 *
 * WHY IT IS HERE. This was previously copy-pasted into five endpoints. A rule
 * that lives in five places is a rule that will drift  the bug class this
 * project has now hit six times.
 */
function periodWindow(string $period, ?DateTime $now = null): ?array
{
    $now ??= new DateTime();

    if ($period === 'today') {
        $start = (clone $now)->setTime(0, 0, 0);
        $end = (clone $start)->modify('+1 day');
        $label = 'Today';
    } elseif ($period === 'month') {
        $start = (clone $now)->setDate((int) $now->format('Y'), (int) $now->format('m'), 1)->setTime(0, 0, 0);
        $end = (clone $start)->modify('+1 month');
        $label = $start->format('F Y');
    } elseif ($period === 'year') {
        $start = (clone $now)->setDate((int) $now->format('Y'), 1, 1)->setTime(0, 0, 0);
        $end = (clone $start)->modify('+1 year');
        $label = $start->format('Y');
    } elseif ($period === 'all') {
        $start = null;
        $end = null;
        $label = 'All time';
    } elseif (ctype_digit($period)) {
        $year = (int) $period;
        $start = new DateTime(sprintf('%04d-01-01 00:00:00', $year));
        $end = (clone $start)->modify('+1 year');
        $label = (string) $year;
    } else {
        return null;
    }

    return ['start' => $start, 'end' => $end, 'label' => $label];
}

/**
 * The [start, end) window as SQL literals, or nulls for an unbounded period.
 * Ready to drop straight into a prepared statement's parameter list.
 *
 * @return array{0: ?string, 1: ?string}
 */
function periodSql(?DateTime $start, ?DateTime $end): array
{
    if ($start === null || $end === null) {
        return [null, null];
    }

    return [$start->format('Y-m-d H:i:s.v'), $end->format('Y-m-d H:i:s.v')];
}
