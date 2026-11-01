import { MAX_RENTAL_SECONDS, MIN_RENTAL_SECONDS } from './pricing.js'

/*
  RENTAL TIME RULES + MOCK RENTAL
  ---------------------------------------------------------------
  The display and the billing are deliberately separate numbers.

  DISPLAY   counts down from the block, and rolls back to the full block
            at zero. It NEVER shows 0:00. This is a convenience for the
            cashier only.

  BILLING   real elapsed seconds from `startedAt`. The roll never affects
            it. Phase 4 charges this value.

  Because of the roll, the display can read 50:00 while the customer has
  actually been on the machine for 2h 10m. That is correct.

  This file is deleted in Phase 11; the time rules move to the real layer.
*/

/*
  A duration as a clock. Under an hour it reads m:ss; over an hour
  it reads h:mm:ss.
*/
export function formatClock(seconds) {
  const hours = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  const mm = hours > 0 ? String(mins).padStart(2, '0') : String(mins)
  return `${hours > 0 ? `${hours}:` : ''}${mm}:${String(secs).padStart(2, '0')}`
}

/*
  Wall-clock stamps for a transaction.

  Within one day the date is shown once, because repeating it twice is
  noise. Across midnight both dates are shown, so an overnight rental is
  never ambiguous about which day it ended on.
*/
const DATE_FMT = new Intl.DateTimeFormat('en-PH', { day: 'numeric', month: 'short' })
const TIME_FMT = new Intl.DateTimeFormat('en-PH', { hour: 'numeric', minute: '2-digit' })
const STAMP_FMT = new Intl.DateTimeFormat('en-PH', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
})

export function formatStamp(timestamp) {
  return STAMP_FMT.format(new Date(timestamp))
}

export function formatSpan(startedAt, endedAt) {
  const from = new Date(startedAt)
  const to = new Date(endedAt)

  if (from.toDateString() === to.toDateString()) {
    return `${DATE_FMT.format(from)} · ${TIME_FMT.format(from)} → ${TIME_FMT.format(to)}`
  }
  return `${STAMP_FMT.format(from)} → ${STAMP_FMT.format(to)}`
}

/*
  PERIOD BOUNDARIES.

  These live here, with the other time rules, rather than in a revenue
  module. A period boundary is a time rule, and this project has already
  paid for splitting one rule across two files (Phase 3 defect 1).

  All three return the START of the period in local time. "Monthly" is the
  current CALENDAR month and "Yearly" the current CALENDAR year, not a
  rolling 30 or 365 days — that follows the owner instruction that the
  cashier's view resets when the next day arrives (Decision 109).
*/
export function startOfDay(value) {
  const d = new Date(value)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

export function startOfMonth(value) {
  const d = new Date(value)
  d.setHours(0, 0, 0, 0)
  d.setDate(1)
  return d.getTime()
}

export function startOfYear(value) {
  const d = new Date(value)
  d.setHours(0, 0, 0, 0)
  d.setMonth(0, 1)
  return d.getTime()
}

/*
  Adding months/years by constructing a new Date rather than adding
  30*86400000. A fixed millisecond offset drifts: 30 days is not December,
  and 365 is not a leap year.
*/
export function addMonths(value, months) {
  const d = new Date(value)
  d.setMonth(d.getMonth() + months)
  return d.getTime()
}

export function addYears(value, years) {
  const d = new Date(value)
  d.setFullYear(d.getFullYear() + years)
  return d.getTime()
}

/*
  A heading for a day of bills: "Today", "Yesterday", or the date. Only
  two days need naming — anything older is unambiguous with a weekday and
  a date, and a shop's billing does not reach back far enough for the year
  to matter.
*/
export function formatDayLabel(timestamp, now) {
  const days = Math.round((startOfDay(now) - startOfDay(timestamp)) / 86400000)
  if (days <= 0) return 'Today'
  if (days === 1) return 'Yesterday'
  return new Date(timestamp).toLocaleDateString('en-PH', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

/*
  The wall clock, for the shop's header. A counter has no other clock it
  can trust, and it is set in the data face like every other number the
  machine measures.
*/
const WALL_FMT = new Intl.DateTimeFormat('en-PH', {
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
})

export function formatWallClock(timestamp) {
  return WALL_FMT.format(new Date(timestamp))
}

export const WARNING_TEN_MIN = 10 * 60
export const WARNING_FIVE_MIN = 5 * 60
export const WARNING_ONE_MIN = 60

/*
  A duration must be a whole number of SECONDS, at least one minute, and
  no longer than 24 hours.

  One rule, one place. The pickers use this to reject bad input before it is
  ever submitted, and the provider uses the same predicate to refuse the same
  values — so the two can never disagree about what is allowed, and a caller
  that bypasses the UI (a future API layer in Phase 10/11) is still stopped.

  Seconds, not minutes, so an emergency rental can be booked honestly.
*/
export const DURATION_ERROR = 'Enter a duration of at least 1 minute.'
export const DURATION_TOO_LONG_ERROR = 'A rental cannot be longer than 24 hours.'

export function isValidDuration(seconds) {
  return Number.isInteger(seconds) && seconds >= MIN_RENTAL_SECONDS
}

/*
  Assemble a duration from the hours / minutes / seconds boxes the cashier
  typed. Returns the total in seconds, or an error string.
*/
export function durationFromParts(hours, minutes, seconds) {
  const parts = [
    { value: hours, unit: 'hours', limit: 24 },
    { value: minutes, unit: 'minutes', limit: 59 },
    { value: seconds, unit: 'seconds', limit: 59 },
  ]

  const total = parts.reduce((sum, part) => {
    const raw = part.value.trim()
    if (raw === '') return sum
    const value = Number(raw)
    if (!Number.isInteger(value) || value < 0) return NaN
    if (value > part.limit) return NaN
    return sum + value * (part.unit === 'hours' ? 3600 : part.unit === 'minutes' ? 60 : 1)
  }, 0)

  if (Number.isNaN(total)) return { ok: false, error: 'Enter whole hours, minutes and seconds only.' }
  if (!isValidDuration(total)) return { ok: false, error: DURATION_ERROR }
  if (total > MAX_RENTAL_SECONDS) return { ok: false, error: DURATION_TOO_LONG_ERROR }

  return { ok: true, seconds: total }
}

export const DURATION_PRESETS = [
  { label: '30 min', minutes: 30 },
  { label: '1 hr', minutes: 60 },
  { label: '2 hr', minutes: 120 },
  { label: '3 hr', minutes: 180 },
  { label: '5 hr', minutes: 300 },
  { label: '6 hr', minutes: 360 },
]
/*
  Milliseconds since the epoch, from whatever shape a timestamp arrives in.

  WHY THIS EXISTS. Every timestamp used to be a NUMBER — the mock data was built
  with `Date.now()` and arithmetic. Since Phase 11 they arrive from the API as
  ISO STRINGS.

      now - rental.blockStartedAt
      1758000000000 - "2026-10-17T03:00:00.000"   ->  NaN

  That is where "NaN : NaN" on the board came from. Worse, a comparison like
  `timestamp < range.start` between a string and a number does NOT produce NaN —
  JavaScript coerces the number to a string and compares CHARACTERS, which
  quietly filters revenue wrongly. A wrong money figure is far worse than a
  broken timer, so the conversion is done in one place and used by both files.
*/
export function toMillis(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0
  if (value instanceof Date) return value.getTime()
  if (typeof value === 'string') {
    const parsed = Date.parse(value)
    return Number.isNaN(parsed) ? 0 : parsed
  }
  return 0
}

/*
  Remaining time on the display.

  Wraps inside the block, so the result is always 1..blockSeconds and is
  never 0. At an exact boundary it reads the full block again.
*/
export function getDisplayRemaining(rental, now) {
  const blockMs = rental.blockSeconds * 1000
  const intoBlock = now - toMillis(rental.blockStartedAt)
  const wrapped = ((intoBlock % blockMs) + blockMs) % blockMs
  return Math.max(1, Math.ceil((blockMs - wrapped) / 1000))
}

/*
  Real elapsed seconds. This is the billing number and the roll never
  touches it.
*/
export function getElapsedSeconds(rental, now) {
  return Math.max(0, Math.floor((now - toMillis(rental.startedAt)) / 1000))
}

/*
  Warning tier for the display. Checked most-urgent first.
  Returns 'one' | 'five' | 'ten' | null.
*/
export function getWarningTier(remaining) {
  if (remaining <= WARNING_ONE_MIN) return 'one'
  if (remaining <= WARNING_FIVE_MIN) return 'five'
  if (remaining <= WARNING_TEN_MIN) return 'ten'
  return null
}

export const WARNING_CHIPS = {
  ten: { label: '10 min', className: 'bg-slate-200 text-slate-700' },
  five: { label: '5 min', className: 'bg-state-busy text-white' },
  one: { label: '1 min', className: 'bg-state-fault text-white' },
}

/*
  createDefaultRentals — DELETED IN PHASE 11.

  The mock rental is gone. Active rentals come from /api/rentals/active.

  Everything above it in this file is still live and still used by the screens:
  the display-vs-billing distinction (Decision 41), the roll that never reads
  0:00 (Decision 39), the warning thresholds (Decision 45), duration validation
  (Decision 62), and the period boundaries (Decision 109).

  The billing clock itself is server-side now. `startedAt` comes from
  dbo.rentals.started_at, so the number a customer is charged cannot be
  changed by a reload, a slow frame or a doctored browser.
*/
