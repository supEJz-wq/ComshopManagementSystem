import { useEffect, useState } from 'react'
import { useAuth } from './auth.js'
import { REFUND_KIND, refundableFor, refundedTotal } from '../data/refunds.js'
import { nextRef } from '../data/revenue.js'
import { TransactionContext } from './transactionContext.js'

const TRANSACTIONS_KEY = 'cybershopos.transactions'
const REFUNDS_KEY = 'cybershopos.refunds'

function readList(key) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

/*
  TRANSACTION RECORDS — Phase 4.

  A rental that is stopped immediately becomes a transaction in the
  UNSETTLED state. The cashier may leave it that way: the PC is already
  free and the rental is over, so nothing is blocked on payment. An
  unsettled transaction keeps its full bill and can be settled later from
  the Payments screen.

  The original bill is never rewritten. Recording a payment adds the
  cash figures and marks the record settled — it does not touch
  amountDue or pieces (Business Rule 10).

  A bill is settled in full or not at all. An underpayment is refused
  rather than absorbed, so the shop never records less revenue than was
  owed. Forgiving part of a bill on purpose is a rental adjustment with a
  recorded reason (Core Feature 6.1.6, Business Rule 11), which is Phase 6
  — until then there is deliberately no way to settle for less.

  This provider is replaced by real API calls in Phase 11.
*/
export function TransactionProvider({ children }) {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState(() => readList(TRANSACTIONS_KEY))
  // Refunds are their OWN records, never fields added to a bill. This is
  // what keeps the original transaction unedited (Business Rule 10).
  const [refunds, setRefunds] = useState(() => readList(REFUNDS_KEY))

  useEffect(() => {
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions))
  }, [transactions])

  useEffect(() => {
    localStorage.setItem(REFUNDS_KEY, JSON.stringify(refunds))
  }, [refunds])

  // Called the moment a rental stops, before any cash is involved.
  function openTransaction({ rental, pc, endedAt, bill }) {
    const entry = {
      id: `t-${endedAt}`,
      // Stored here, at creation, and never derived from position — see
      // `nextRef` in data/revenue.js (Decision 108).
      ref: nextRef(transactions),
      rentalId: rental.id,
      pcId: pc.id,
      pcName: pc.name,
      startedAt: rental.startedAt,
      endedAt,
      usedSeconds: bill.usedSeconds,
      bookedSeconds: bill.bookedSeconds,
      overstaySeconds: bill.overstaySeconds,
      pieces: bill.pieces,
      // The full transfer chain, so the original PC is never lost. A
      // transaction created before this existed has no transfers field, so
      // the default keeps older records rendering.
      transfers: rental.transfers ?? [],
      amountDue: bill.amountDue,
      cashReceived: null,
      amountCharged: null,
      change: null,
      settled: false,
      cashierId: user?.id ?? null,
      cashierName: user?.username ?? null,
    }
    setTransactions((prev) => [entry, ...prev])
    return entry
  }

  function settle(id, cashReceived) {
    // Re-checked here as well as in the UI, so a zero, negative, or
    // fractional payment can never be recorded even if the form is
    // bypassed. There are never centavos, and no payment is worth nothing.
    if (!Number.isInteger(cashReceived) || cashReceived < 1) return false

    // An underpayment is refused, not absorbed. Settling for less than the
    // bill would record less revenue than was owed. A deliberate goodwill
    // discount is a rental adjustment with a recorded reason
    // (Core Feature 6.1.6, Business Rule 11) and arrives in Phase 6.
    const target = transactions.find((entry) => entry.id === id)
    if (!target || target.settled) return false
    if (cashReceived < target.amountDue) return false

    setTransactions((prev) =>
      prev.map((entry) => {
        if (entry.id !== id) return entry
        return {
          ...entry,
          cashReceived,
          amountCharged: entry.amountDue,
          change: Math.max(0, cashReceived - entry.amountDue),
          settled: true,
          settledAt: Date.now(),
          settledById: user?.id ?? null,
          settledByName: user?.username ?? null,
        }
      }),
    )
    return true
  }

  /*
    Records a refund or an adjustment against a bill.

    The bill is never touched — this appends a separate record. Guards,
    all of them enforced here as well as in the form:

      settled only   an unpaid bill has no cash in it to give back
      whole pesos    no centavos, and ₱0 is allowed for a note
      hard cap       refunds can never pass the amount paid, however
                     many are recorded
      reason         mandatory, always (Business Rule 11)
  */
  function recordRefund({ transactionId, kind = REFUND_KIND.PARTIAL, amount, reason }) {
    const transaction = transactions.find((entry) => entry.id === transactionId)
    if (!transaction) return { ok: false, error: 'That bill no longer exists.' }

    if (!transaction.settled) {
      return { ok: false, error: 'Settle the bill before refunding it.' }
    }

    if (!Number.isInteger(amount) || amount < 0) {
      return { ok: false, error: 'Enter a whole peso amount, 0 or more.' }
    }

    const existing = refunds.filter((entry) => entry.transactionId === transactionId)
    const { maxRefundable } = refundableFor(transaction, transaction.usedSeconds, existing)

    if (amount > maxRefundable) {
      return {
        ok: false,
        error:
          maxRefundable === 0
            ? 'Nothing left to refund on this bill.'
            : `That is more than the remaining ${maxRefundable}.`,
      }
    }

    if (!reason || !reason.trim()) {
      return { ok: false, error: 'A reason is required.' }
    }

    const entry = {
      id: `r-${Date.now()}`,
      transactionId,
      kind: kind === REFUND_KIND.FULL ? REFUND_KIND.FULL : REFUND_KIND.PARTIAL,
      amount,
      reason: reason.trim(),
      cashierId: user?.id ?? null,
      cashierName: user?.username ?? null,
      at: Date.now(),
    }

    setRefunds((prev) => [...prev, entry])
    return { ok: true, entry }
  }

  const unsettled = transactions.filter((entry) => !entry.settled)
  const settled = transactions.filter((entry) => entry.settled)
  const refundsFor = (transactionId) => refunds.filter((entry) => entry.transactionId === transactionId)

  const value = {
    transactions,
    refunds,
    unsettled,
    settled,
    openTransaction,
    settle,
    recordRefund,
    refundsFor,
    refundedTotal,
  }

  return <TransactionContext.Provider value={value}>{children}</TransactionContext.Provider>
}
