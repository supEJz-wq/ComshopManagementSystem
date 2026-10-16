/*
  REFUND RULES — Phase 6
  ---------------------------------------------------------------
  The refund is the CHARGE rule run backwards. Nothing here invents a
  price; it reuses the ₱10-per-30-minute-block and the round-up that
  Phase 4 already established, so the books balance by construction.

      refund = amount paid − (time used, rounded UP to 30-min blocks × ₱10)

  Used time rounds UP for exactly the same reason it did when charging:
  15 minutes consumed a whole block, and the customer was told the block
  was ₱10. Refunding more than that would give away time that was
  genuinely consumed.

  A refund can never exceed the amount paid, no matter how many are
  recorded. A full refund is the cashier's judgement (Business Rule 8),
  not something this formula produces.

  A ₱0 entry is allowed and is not an error: it records that something
  happened without moving money — a PC that failed, a session cut short
  (Core Feature 6.1.6, Business Rule 11).

  This file is deleted in Phase 11; the rules move to the server.
*/

import { RATE_PER_BLOCK, THIRTY_MIN_SECONDS } from './pricing.js'

export const REFUND_KIND = {
  PARTIAL: 'partial',
  FULL: 'full',
}

/*
  How many 30-minute blocks the used time consumed. Rounds up, always,
  so 1 second and 30 minutes both cost one block.
*/
export function blocksUsed(usedSeconds) {
  return Math.max(0, Math.ceil(Math.max(0, usedSeconds) / THIRTY_MIN_SECONDS))
}

/*
  What the time the customer actually used is worth.
*/
export function usedValueFor(usedSeconds) {
  return blocksUsed(usedSeconds) * RATE_PER_BLOCK
}

/*
  Everything the refund screen needs, in one place.

  fair        what the unused time is worth, before anything already
              refunded
  suggested   what to pre-fill the form with
  hardCap     the most that may still be refunded — the amount paid
              minus what has already gone back. This is the ceiling
              that makes multiple refunds safe.
*/
export function refundableFor(transaction, usedSeconds, refunds = []) {
  const alreadyRefunded = refundedTotal(refunds)

  const fair = Math.max(0, (transaction?.amountDue ?? 0) - usedValueFor(usedSeconds))
  const hardCap = Math.max(0, (transaction?.amountDue ?? 0) - alreadyRefunded)

  return {
    blocksUsed: blocksUsed(usedSeconds),
    usedValue: usedValueFor(usedSeconds),
    alreadyRefunded,
    fair: Math.min(fair, hardCap),
    suggested: Math.min(fair, hardCap),
    maxRefundable: hardCap,
  }
}

export function refundedTotal(refunds) {
  return (refunds ?? []).reduce((sum, entry) => sum + entry.amount, 0)
}

/*
  One line the cashier can read, so the arithmetic is never a mystery:
  what they used, what that consumed, and what is left over.
*/
export function describeRefund(figures) {
  const blocks = `${figures.blocksUsed} × 30 min`
  return `${blocks} used = ₱${figures.usedValue} · the rest is unused`
}

/*
  What the shop actually kept from this rental. Revenue is
  payments − refunds (Business Rule 7); this is the per-bill half of
  that, and the full revenue view is Phase 7.
*/
export function netAmount(transaction, refunds) {
  return (transaction?.amountCharged ?? transaction?.amountDue ?? 0) - refundedTotal(refunds)
}
