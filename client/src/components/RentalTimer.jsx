import {
  formatClock,
  getDisplayRemaining,
  getWarningTier,
  WARNING_CHIPS,
} from '../data/rentals.js'

function WarningChip({ tier }) {
  const chip = WARNING_CHIPS[tier]
  if (!chip) return null

  return (
    <span className={`rounded-control px-2 py-0.5 font-data text-xs ${chip.className}`}>
      {chip.label} left
    </span>
  )
}

/*
  The timer is set by how long the rental is, not by a fixed size. A
  six-hour session is a day at the counter and has to read from across the
  room; a thirty-minute session is a quick top-up and does not need the
  same presence. Each step is sized to fit a seven-character clock
  ("6:00:00") inside a tile without wrapping or clipping.

    < 30 min      text-2xl        ~72px
    30 – 90 min   text-3xl       ~126px
    1.5 – 5 hr    text-4xl       ~151px
    5 hr and over text-5xl       ~202px

  `size="sm"` steps down one for the compact rows on the Payments screen.
*/
function sizeFor(blockSeconds, size) {
  const step =
    blockSeconds < 30 * 60 ? 0 : blockSeconds < 90 * 60 ? 1 : blockSeconds < 5 * 3600 ? 2 : 3

  const ladder = ['text-2xl', 'text-3xl', 'text-4xl', 'text-5xl']
  return ladder[size === 'sm' ? Math.max(0, step - 1) : step]
}

/*
  The number must not move while it counts down.

  `formatClock` changes character count as time passes: "59:59" is five
  characters and "1:00:00" is seven. Left alone, every running timer
  therefore jumps sideways twice an hour, and on the board every tile
  jumps in the same instant. `tabular-nums` does not prevent this — it
  equalises the width of a digit, not the number of digits.

  The slot is reserved to exactly what this rental can reach, so the chip
  still sits tight against a short timer and a long one still has room
  for a two-digit hour. Rentals are capped at 24 hours (Decision 53), so
  8ch is the true worst case.

    under 1 hr    "59:59"     5ch
    1 – 10 hr     "9:59:59"   7ch
    10 hr and up  "24:00:00"  8ch
*/
function reserveFor(blockSeconds) {
  if (blockSeconds < 3600) return 'min-w-[5ch]'
  if (blockSeconds < 10 * 3600) return 'min-w-[7ch]'
  return 'min-w-[8ch]'
}

/*
  The display timer. Rolls at zero and never reads 0:00. The warning chip
  escalates quietly as time runs out.

  The clock itself stays a neutral colour on purpose. Urgency is the
  chip's job — a timer that turned red would compete with the chip and
  turn every long rental into a false alarm (§6.1.2a).
*/
function RentalTimer({ rental, now, size = 'lg' }) {
  const remaining = getDisplayRemaining(rental, now)
  const tier = getWarningTier(remaining)

  return (
    <div className="mt-3">
      <div className="flex flex-wrap items-center gap-2">
        <p
          className={`font-data leading-none font-semibold text-slate-900 tabular-nums ${sizeFor(rental.blockSeconds, size)} ${reserveFor(rental.blockSeconds)}`}
        >
          {formatClock(remaining)}
        </p>
        <WarningChip tier={tier} />
      </div>
      <p className="mt-2 flex items-baseline gap-1.5 text-xs text-slate-500">
        <span className="font-data tabular-nums text-slate-500">
          {formatClock(rental.blockSeconds)}
        </span>
        <span>block</span>
      </p>
    </div>
  )
}

export default RentalTimer