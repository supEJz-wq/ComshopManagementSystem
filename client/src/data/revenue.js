/*
  REVENUE — the period vocabulary and the reference format.

  WHAT MOVED TO THE SERVER, IN PHASE 11. The calculators are gone from this
  file. The revenue figures, which bills belong to a period, what a bill is
  worth after its refunds, and every chart series are now computed by the
  API — server/api/revenue/ and server/api/analytics/.

  This project has hit the same bug five times: a rule living in two files
  and silently drifting (Phase 3 defects 1, 3, 4 and 10; Phase 4 defect 1).
  The server is the one place a revenue figure is computed, so the Revenue
  screen and the Analytics screen cannot disagree with each other, or with
  what was stored.

  WHAT STAYS HERE, AND WHY. Two things, both presentation:

    - which periods the screen offers, and to which role
    - how a stored reference number is written for a human

  The period RULE — what "this month" actually covers, and which bills fall
  inside it — is the server's. The server is also the enforcement point for
  which periods a role may ask for: a Cashier who requests "this month" is
  answered with Today, whatever the browser asked for.
*/

export const PERIODS = {
  TODAY: 'today',
  MONTH: 'month',
  YEAR: 'year',
  ALL: 'all',
}

/*
  What the Admin can switch between. The Cashier is not offered a choice —
  see `periodsForRole` below, and the enforcement on the server, which
  answers any other period with Today (Decision 110).
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

  This narrows what is OFFERED. It is not what ENFORCES: the server answers
  a Cashier's request for any other period with Today regardless.
*/
export function periodsForRole(isAdmin) {
  return isAdmin ? ADMIN_PERIODS : ADMIN_PERIODS.slice(0, 1)
}

/*
  Display only. The stored form carries no "#", because "#" is presentation
  and a stored value should not need to know how it will be shown.

  The number itself is the server's — a reference is assigned when the bill
  is written and never derived from sort order (Decision 108).
*/
export function formatRef(ref) {
  return ref ? `#${ref}` : '—'
}
