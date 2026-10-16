/*
  REVENUE — Phase 7.

  THE ONE PLACE A REVENUE FIGURE IS COMPUTED.

  This project has hit the same bug five times: a rule living in two files
  and silently drifting (Phase 3 defects 1, 3, 4 and 10; Phase 4 defect 1).
  The revenue screen and the Phase 8 monitoring screen both read from here,
  so they cannot disagree.

  src/data/revenue.js is deleted in Phase 11; the server becomes the only
  place these figures are computed in Phase 10.
*/

import {
  startOfDay,
  startOfMonth,
  startOfYear,
  addMonths,
  addYears,
} from './rentals.js'

export const PERIODS = {
  TODAY: 'today',
  MONTH: 'month',
  YEAR: 'year',
  ALL: 'all',
}

/*
  What the Admin can switch between. The Cashier is not offered a choice —
  see `periodsForRole` below, which is the enforcement point rather than a
  UI convention (Decision 110).
*/
export const ADMIN_PERIODS = [
  { value: PERIODS.TODAY, label: 'Today' },
  { value: PERIODS.MONTH, label: 'This month' },
  { value: PERIODS.YEAR, label: 'This year' },
  { value: PERIODS.ALL, label: 'All time' },
]

/*
  A cashier's figure has to be verifiable by definition, and with exactly one
  cashier (Decision 66) that means it must be what they personally took. So
  they are given Today and nothing else — the absence of a choice is the
  feature (Decision 110).
*/
export function periodsForRole(isAdmin) {
  return isAdmin ? ADMIN_PERIODS : ADMIN_PERIODS.slice(0, 1)
}

/*
  The window a period covers, as [start, end). `end` is exclusive so that a
  record at exactly midnight belongs to the NEW day, not both.

  `period` is usually one of PERIODS, but it may also be a concrete year
  NUMBER — that is how the Analytics screen offers "2025" / "2026" as
  explicit choices instead of only "this year". Every helper that takes a
  period flows through here, so a chosen year re-weights the whole page
  through one seam.

  ALL TIME is unbounded. It is expressed as null rather than ±Infinity so
  the same comparison works everywhere.
*/
export function periodRange(period, now) {
  if (typeof period === 'number') {
    const start = startOfYear(new Date(period, 0, 1))
    return { start, end: addYears(start, 1), label: `${period}` }
  }

  switch (period) {
    case PERIODS.TODAY: {
      const start = startOfDay(now)
      return { start, end: addDays(start, 1), label: 'Today' }
    }
    case PERIODS.MONTH: {
      const start = startOfMonth(now)
      return { start, end: addMonths(start, 1), label: 'This month' }
    }
    case PERIODS.YEAR: {
      const start = startOfYear(now)
      return { start, end: addYears(start, 1), label: 'This year' }
    }
    case PERIODS.ALL:
      return { start: null, end: null, label: 'All time' }
    default:
      throw new Error(`Unknown revenue period: ${period}`)
  }
}

function addDays(value, days) {
  // Calendar-day arithmetic, not +86400000. A local day is 23 or 25 hours
  // at a DST boundary, and adding a fixed millisecond count would put the
  // midnight boundary in the wrong place twice a year.
  const d = new Date(value)
  d.setDate(d.getDate() + days)
  return d.getTime()
}

function inRange(timestamp, range) {
  if (timestamp == null) return false
  if (range.start !== null && timestamp < range.start) return false
  if (range.end !== null && timestamp >= range.end) return false
  return true
}

function sum(values) {
  return values.reduce((total, value) => total + (Number(value) || 0), 0)
}

/*
  A transaction counts as revenue only once it is SETTLED, and it counts on
  the day the money was taken — `settledAt`, not `endedAt`.

  That is the cash basis in Decision 105, and it is the only reading under
  which Decision 64's split holds: "collected" and "still owed" become
  disjoint categories rather than two views of one number.

  It matters most exactly where the owner asked for it to be true. A rental
  ending Tuesday 11pm that is settled Wednesday 09:00 is WEDNESDAY's
  collected figure. Under accrual it would credit Tuesday — money the
  cashier never took, on a day they cannot verify.
*/
function collectedIn(transactions, range) {
  return sum(
    transactions
      .filter((entry) => entry.settled && inRange(entry.settledAt, range))
      .map((entry) => entry.amountCharged),
  )
}

/*
  Refunds reduce the period they HAPPENED IN, never the period of the
  original payment (Decision 107).

  §6.1.8 forbids "directly edit historical revenue", and restating January
  would break the append-only principle the whole refund design rests on
  (Rule 10). A February refund therefore leaves January exactly as it was.

  A refund of ₱0 is excluded from the sum. It is a real record — Decision 78
  allows a ₱0 entry as a non-monetary adjustment — but it moved no money,
  so it must not move a figure. It is still listed in the history.
*/
function refundedIn(refunds, range) {
  return sum(
    refunds
      .filter((entry) => entry.amount > 0 && inRange(entry.at, range))
      .map((entry) => entry.amount),
  )
}

/*
  THE CALCULATION, in the order the spec states it:

    1. settled transactions whose settledAt is inside the period
    2. sum their amountCharged                                  -> collected
    3. refunds whose own timestamp is inside the period,
       excluding ₱0                                            -> refunded
    4. net = collected − refunded
    5. separately, the total still owed

  Step 5 is deliberately period-INDEPENDENT. "Still owed" is every
  unsettled bill, which is exactly what the Payments screen already shows.
  Restricting it to the period would put a second, different "outstanding"
  number into the app — and two numbers for one thing is how they drift.

  `net` and `stillOwed` are returned SEPARATELY and must never be added
  together. Decision 64 forbids it, and this shape makes the mistake
  awkward rather than easy.
*/
export function netRevenueFor(transactions, refunds, period, now) {
  const range = periodRange(period, now)

  const collected = collectedIn(transactions, range)
  const refunded = refundedIn(refunds, range)
  const net = collected - refunded

  const stillOwed = sum(
    transactions.filter((entry) => !entry.settled).map((entry) => entry.amountDue),
  )

  return {
    period,
    label: range.label,
    range,
    collected,
    refunded,
    net,
    stillOwed,
    settledCount: transactions.filter(
      (entry) => entry.settled && inRange(entry.settledAt, range),
    ).length,
    refundCount: refunds.filter(
      (entry) => entry.amount > 0 && inRange(entry.at, range),
    ).length,
    adjustmentCount: refunds.filter(
      (entry) => entry.amount === 0 && inRange(entry.at, range),
    ).length,
  }
}

/*
  THE REFERENCE NUMBER.

  Stored at bill creation and NEVER derived from sort order (Decision 108).
  Numbering by position would renumber history every time a late bill was
  inserted, which is the one thing a reference number must never do —
  §6.1.8 shows "#00152" and a cashier needs to be able to say it.

  Mirrors `nextPcId` in PcProvider: find the lowest unused. Bills are never
  deleted (Rule 10), so "lowest unused" and "monotonic" are the same thing
  here — but if a delete path ever appears, this must become a stored max.

  KNOWN LIMITATION, recorded in phase.md: this restarts if localStorage is
  cleared, because it is derived from the stored set. Within one dataset it
  is permanent. On the Phase 9/10 server it becomes a true sequence.

  Bills created before Phase 7 have no `ref`. That is safe: none of them can
  be holding "00001", so the sequence cannot collide with history.
*/
export function nextRef(transactions) {
  let n = 1
  let ref = padRef(n)
  while (transactions.some((entry) => entry.ref === ref)) {
    n += 1
    ref = padRef(n)
  }
  return ref
}

function padRef(n) {
  return String(n).padStart(5, '0')
}

/*
  Display only. The stored form carries no "#", because "#" is presentation
  and a stored value should not need to know how it will be shown.
*/
export function formatRef(ref) {
  return ref ? `#${ref}` : '—'
}

/*
  The rows each list needs, filtered to the period but NOT summed here.
  Grouping and formatting stay on the page; only the FIGURE comes from
  netRevenueFor.
*/
export function transactionsInPeriod(transactions, period, now) {
  const range = periodRange(period, now)
  return transactions
    .filter((entry) => inRange(entry.settledAt, range))
    .slice()
    .sort((a, b) => b.settledAt - a.settledAt)
}

export function refundsInPeriod(refunds, period, now) {
  const range = periodRange(period, now)
  return refunds.filter((entry) => inRange(entry.at, range)).slice().sort((a, b) => b.at - a.at)
}

/*
  Refunds for one bill, oldest first, so the sequence of adjustments reads
  in the order they happened.
*/
export function refundsForBill(refunds, transactionId) {
  return refunds.filter((entry) => entry.transactionId === transactionId).slice().sort((a, b) => a.at - b.at)
}

export function netForBill(transaction, refunds) {
  const total = sum(refundsForBill(refunds, transaction.id).map((entry) => entry.amount))
  return {
    refunded: total,
    net: (transaction.amountCharged ?? 0) - total,
  }
}

/*
  ANALYTICS HELPERS — Phase 8.

  Every series a chart draws is produced here, in the same module that
  defines the figures, so the chart can never disagree with the page it
  sits next to. Same rules as netRevenueFor: cash basis (settledAt), no
  ₱0 adjustments, and a refund counts in the period it happened in.
*/

/*
  One bar per day, in period order. The day key is local midnight so two
  bills 30 seconds apart land on the same bar, and the axis always carries
  every day in the range even those with zero.
*/
export function collectedByDay(transactions, refunds, period, now) {
  const range = periodRange(period, now)
  const buckets = new Map()

  for (let t = range.start; t < range.end; t = addDays(t, 1)) {
    const day = startOfDay(t)
    buckets.set(day, {
      at: day,
      label: new Date(day).toLocaleDateString('en-PH', { day: 'numeric', month: 'short' }),
      collected: 0,
      refunded: 0,
    })
  }

  for (const entry of transactions) {
    if (!entry.settled || !inRange(entry.settledAt, range)) continue
    const day = startOfDay(entry.settledAt)
    if (buckets.has(day)) buckets.get(day).collected += entry.amountCharged ?? 0
  }
  for (const entry of refunds) {
    if (!(entry.amount > 0) || !inRange(entry.at, range)) continue
    const day = startOfDay(entry.at)
    if (buckets.has(day)) buckets.get(day).refunded += entry.amount
  }

  return [...buckets.values()].sort((a, b) => a.at - b.at)
}

/*
  Collected per calendar month across all time. Always renders twelve
  months for the years that have any data.
*/
export function collectedByMonth(transactions) {
  const years = new Map()
  for (const entry of transactions) {
    if (!entry.settled || entry.settledAt == null) continue
    const d = new Date(entry.settledAt)
    const y = d.getFullYear()
    if (!years.has(y)) years.set(y, new Array(12).fill(0))
    years.get(y)[d.getMonth()] += entry.amountCharged ?? 0
  }
  return [...years.entries()]
    .sort(([a], [b]) => a - b)
    .flatMap(([year, months]) =>
      months.map((collected, month) => ({
        label: new Date(year, month, 1).toLocaleDateString('en-PH', {
          month: 'short',
          year: 'numeric',
        }),
        at: startOfMonth(new Date(year, month, 1)),
        collected,
      })),
    )
}

/*
  Collected per calendar year, oldest first — the year-over-year read.
*/
export function collectedByYear(transactions) {
  const totals = new Map()
  for (const entry of transactions) {
    if (!entry.settled || entry.settledAt == null) continue
    const year = new Date(entry.settledAt).getFullYear()
    totals.set(year, (totals.get(year) ?? 0) + (entry.amountCharged ?? 0))
  }
  return [...totals.entries()]
    .sort(([a], [b]) => a - b)
    .map(([year, collected]) => ({ year, collected }))
}

/*
  Collected per cashier, busiest first. The cashier with zero rows simply
  does not appear — a table of empty rows is not information.
*/
export function collectedByCashier(transactions, refunds, period, now) {
  const range = periodRange(period, now)
  const totals = new Map()

  for (const entry of transactions) {
    if (!entry.settled || !inRange(entry.settledAt, range)) continue
    const name = entry.cashierName ?? 'Unknown'
    totals.set(name, (totals.get(name) ?? 0) + (entry.amountCharged ?? 0))
  }

  const cashierRefunds = new Map()
  for (const entry of refunds) {
    if (!(entry.amount > 0) || !inRange(entry.at, range)) continue
    const name = entry.cashierName ?? 'Unknown'
    cashierRefunds.set(name, (cashierRefunds.get(name) ?? 0) + entry.amount)
  }

  return [...totals.entries()]
    .map(([cashier, collected]) => ({
      cashier,
      collected,
      refunded: cashierRefunds.get(cashier) ?? 0,
      net: collected - (cashierRefunds.get(cashier) ?? 0),
    }))
    .sort((a, b) => b.net - a.net)
}

/*
  Collected per hour of day across the selected range. Always returns 24
  buckets — a gap hour is a real part of the shape (e.g. 3am is closed
  for business).
*/
export function collectedByHour(transactions, period, now) {
  const range = periodRange(period, now)
  const buckets = new Array(24).fill(0)

  for (const entry of transactions) {
    if (!entry.settled || !inRange(entry.settledAt, range)) continue
    buckets[new Date(entry.settledAt).getHours()] += entry.amountCharged ?? 0
  }

  return buckets.map((collected, hour) => ({ hour, collected }))
}

/*
  The two numbers a human wants from the day-hours shape: which hour earns
  most, and how much. Returns null when nothing was collected in range.
*/
export function bestHour(transactions, period, now) {
  const buckets = collectedByHour(transactions, period, now)
  const best = buckets.reduce((peak, hour) => (hour.collected > peak.collected ? hour : peak), { hour: null, collected: 0 })
  return best.collected > 0 ? best : null
}

/*
  Highest-earning month in the same coarse shape. null when empty.
*/
export function bestMonth(transactions) {
  const buckets = collectedByMonth(transactions)
  if (buckets.length === 0) return null
  return buckets.reduce((peak, month) => (month.collected > peak.collected ? month : peak), buckets[0])
}
