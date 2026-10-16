<?php
// server/config/helpers.php
// Shared pricing helpers mirroring client/src/data/pricing.js

declare(strict_types=1);

const THIRTY_MIN_SECONDS = 1800;
const RATE_PER_BLOCK     = 10;
const PROMO_SECONDS      = 21600; // 6 hours
const PROMO_PRICE        = 100;
const MAX_RENTAL_SECONDS = 86400; // 24 hours
const MIN_RENTAL_SECONDS = 60;

function roundUpToBlock(int $seconds): int
{
    return (int) (ceil($seconds / THIRTY_MIN_SECONDS) * THIRTY_MIN_SECONDS);
}

/**
 * Price one piece (booking or extension) on its own length.
 * Exactly 6 hours = promo price; otherwise blocks of ₱10.
 */
function priceForPiece(int $seconds): float
{
    if ($seconds === PROMO_SECONDS) {
        return PROMO_PRICE;
    }
    return (roundUpToBlock($seconds) / THIRTY_MIN_SECONDS) * RATE_PER_BLOCK;
}

/**
 * Read a WHOLE number from decoded JSON input, or null if it is not one.
 *
 * WHY THIS EXISTS. The obvious guard is:
 *
 *     $seconds = (int) $input['seconds'];
 *     if (!is_int($seconds) || $seconds < 60) { ... }
 *
 * which is DEAD CODE. The cast has already made $seconds an int, so is_int()
 * is always true, and 1.5 silently became 1. This project has already paid for
 * that mistake once  a cash field where Number("") is 0 wrote a ₱0 transaction
 * (Phase 4 defect 1). So the raw value is inspected BEFORE any cast.
 *
 * Accepts a real integer, a whole-valued float (JSON has no int/float split that
 * survives every client), or a plain digit string. Rejects fractions, NaN,
 * Infinity, booleans, arrays, null and anything else.
 */
function wholeNumber($value): ?int
{
    if (is_int($value)) {
        return $value;
    }

    if (is_float($value)) {
        if (!is_finite($value) || floor($value) !== $value) {
            return null;
        }
        return (int) $value;
    }

    if (is_string($value) && preg_match('/^-?\d+$/', trim($value)) === 1) {
        return (int) trim($value);
    }

    return null;
}
