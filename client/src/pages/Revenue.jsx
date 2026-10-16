import { useState } from 'react'
import { useAuth } from '../context/auth.js'
import { useRentals } from '../context/rentalContext.js'
import { useTransactions } from '../context/transactionContext.js'
import {
  PERIODS,
  periodsForRole,
  netRevenueFor,
  transactionsInPeriod,
  refundsInPeriod,
  netForBill,
  formatRef,
} from '../data/revenue.js'
import { formatPeso } from '../data/pricing.js'
import { formatStamp } from '../data/rentals.js'
import Pager, { PAGE_SIZE } from '../components/Pager.jsx'

/*
  REVENUE & TRANSACTION HISTORY — Phase 7.

  Two things this screen must never do, both because they are decisions
  rather than preferences:

  1. Never call the figure "Revenue". It is cash collected. Decision 106
     made the label part of the decision, because naming it correctly
     removes the ambiguity permanently instead of explaining it later.
  2. Never add "Collected" to "Still owed". Decision 64. They are separate
     figures in separate cards, and nothing on this page sums them.
*/

function Figure({ label, amount, tone, note }) {
  return (
    <div className="rounded-card border border-slate-200 bg-white p-4 shadow-card">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p
        className={`mt-2 font-data text-3xl leading-none font-semibold tabular-nums ${
          tone === 'muted' ? 'text-slate-500' : 'text-slate-900'
        }`}
      >
        {formatPeso(amount)}
      </p>
      {note && <p className="mt-2 text-xs text-slate-500">{note}</p>}
    </div>
  )
}

/*
  The period selector is not rendered at all for a Cashier. That is enforced
  here as well as in `periodsForRole` — a cashier who never receives the
  option cannot be talked into picking another one (Decision 110).
*/
function PeriodTabs({ options, value, onChange }) {
  if (options.length === 1) {
    return (
      <p className="text-xs text-slate-500">
        Showing <span className="font-medium text-slate-900">{options[0].label}</span> · resets
        after midnight
      </p>
    )
  }

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Revenue period">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          aria-pressed={value === option.value}
          className={`rounded-control px-3 py-1.5 text-sm font-medium ${
            value === option.value
              ? 'bg-slate-900 text-white'
              : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

function TransactionRow({ entry, refunds }) {
  const { refunded, net } = netForBill(entry, refunds)

  return (
    <li className="rounded-card border border-slate-200 bg-white p-4 shadow-card">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="flex items-baseline gap-2">
          <span className="font-data text-sm font-semibold text-slate-900">
            {formatRef(entry.ref)}
          </span>
          <span className="text-sm font-medium text-slate-900">{entry.pcName}</span>

          {/*
            An explicit marker, not just the red "−₱" beside the total.
            A cashier (or the owner reviewing) scanning the list should be
            able to pick a refunded bill out by its label, not by parsing
            every figure. Rendered as a span rather than a <button> because
            it is a status, not an action — a button that does nothing
            would only confuse keyboard focus (Decision 19: no colour-only
            state, which this also satisfies by carrying words).
          */}
          {refunded > 0 && (
            <span className="rounded-control border border-state-fault/30 bg-surface-fault px-2 py-0.5 text-xs font-medium text-state-fault">
              Refunded
            </span>
          )}
        </div>

        <div className="flex items-baseline gap-3">
          {refunded > 0 && (
            <span className="font-data text-sm tabular-nums text-state-fault">
              −{formatPeso(refunded)}
            </span>
          )}
          <span className="font-data text-lg font-semibold tabular-nums text-slate-900">
            {formatPeso(net)}
          </span>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-xs text-slate-500">
        <span className="font-data tabular-nums">{formatStamp(entry.settledAt)}</span>
        <span>
          paid {formatPeso(entry.amountCharged)}
          {entry.change > 0 && ` · change ${formatPeso(entry.change)}`}
        </span>
        {/* 7.6 — cashier attribution on every record */}
        <span>{entry.settledByName ?? entry.cashierName ?? 'unknown cashier'}</span>
      </div>
    </li>
  )
}

/*
  7.5 — Refunds and adjustments.

  A ₱0 entry is a real record and belongs in this list (Decision 78: it is
  how a rental adjustment is captured without moving money). It is labelled
  as an adjustment so it is never mistaken for money, and `netRevenueFor`
  excludes it from every figure.
*/
function RefundRow({ entry, transactions }) {
  const bill = transactions.find((entry2) => entry2.id === entry.transactionId)
  const isAdjustment = entry.amount === 0

  return (
    <li
      className={`rounded-card border bg-white p-4 shadow-card ${
        isAdjustment ? 'border-slate-200' : 'border-state-fault/30'
      }`}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="flex items-baseline gap-2">
          {bill && (
            <span className="font-data text-sm font-semibold text-slate-900">
              {formatRef(bill.ref)}
            </span>
          )}
          <span className="text-sm font-medium text-slate-900">{bill?.pcName ?? 'unknown PC'}</span>
        </div>

        <span
          className={`font-data text-lg font-semibold tabular-nums ${
            isAdjustment ? 'text-slate-500' : 'text-state-fault'
          }`}
        >
          {isAdjustment ? 'Adjustment ₱0' : `−${formatPeso(entry.amount)}`}
        </span>
      </div>

      <div className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-xs text-slate-500">
        <span className="font-data tabular-nums">{formatStamp(entry.at)}</span>
        <span>{entry.reason}</span>
        <span>{entry.cashierName ?? 'unknown cashier'}</span>
      </div>
    </li>
  )
}

function Revenue() {
  const { isAdmin } = useAuth()
  const { now } = useRentals()
  const { transactions, refunds } = useTransactions()

  const options = periodsForRole(isAdmin)
  const [period, setPeriod] = useState(options[0].value)
  const [settledPage, setSettledPage] = useState(1)
  const [refundPage, setRefundPage] = useState(1)

  /*
    Reset both pages whenever the period changes. A cashier's period is pinned
    so this only fires on the admin's tab switches, but the reset lives here
    regardless — that way the component cannot strand itself on a page index
    that the new period does not have.
  */
  function changePeriod(next) {
    setPeriod(next)
    setSettledPage(1)
    setRefundPage(1)
  }

  /*
    `now` comes from the rental provider's tick, so crossing local midnight
    re-derives this screen without a reload — and it keeps working on a
    machine that was asleep across midnight, because the value comes from
    the wall clock rather than from a cached "today" (Decision 110).

    A Cashier's period is pinned to TODAY on every render. Even if state
    somehow held another value, they would still only ever see today.
  */
  const effectivePeriod = isAdmin ? period : PERIODS.TODAY

  const summary = netRevenueFor(transactions, refunds, effectivePeriod, now)
  const rows = transactionsInPeriod(transactions, effectivePeriod, now)
  const refundRows = refundsInPeriod(refunds, effectivePeriod, now)

  const settledPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE))
  const refundPages = Math.max(1, Math.ceil(refundRows.length / PAGE_SIZE))
  const settledRows = rows.slice((settledPage - 1) * PAGE_SIZE, settledPage * PAGE_SIZE)
  const pageRefundRows = refundRows.slice((refundPage - 1) * PAGE_SIZE, refundPage * PAGE_SIZE)

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-card border border-slate-200 bg-white p-6 shadow-card">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="text-base font-semibold text-slate-900">{summary.label}</h2>
          <PeriodTabs options={options} value={effectivePeriod} onChange={changePeriod} />
        </div>

        {/*
          COLLECTED and STILL OWED sit side by side and are never added.

          The separation is the point: Decision 64 keeps "expected cash" out
          of "revenue", and on a cash basis they are genuinely disjoint —
          collected is money that came in, still owed is money that has not.
          A note says so, because a reader will otherwise try to add them.
        */}
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Figure
            label="Collected"
            amount={summary.collected}
            note={`${summary.settledCount} settled ${
              summary.settledCount === 1 ? 'bill' : 'bills'
            } · money taken in this period`}
          />
          <Figure
            label="Refunded"
            amount={summary.refunded}
            tone={summary.refunded > 0 ? undefined : 'muted'}
            note={`${summary.refundCount} ${
              summary.refundCount === 1 ? 'refund' : 'refunds'
            } taken in this period`}
          />
          <Figure
            label="Net"
            amount={summary.net}
            note="Collected minus refunds"
          />
        </div>

        {/* 7.7 — shown beside the figures, in its own row, never summed in */}
        <div className="mt-3 rounded-control border border-slate-200 bg-slate-50 px-4 py-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-sm font-medium text-slate-700">Still owed</p>
            <p className="font-data text-xl font-semibold tabular-nums text-slate-900">
              {formatPeso(summary.stillOwed)}
            </p>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Unsettled bills from any date. Expected cash, not revenue — it is never added to
            Collected above.
          </p>
        </div>

        {summary.adjustmentCount > 0 && (
          <p className="mt-3 text-xs text-slate-500">
            {summary.adjustmentCount}{' '}
            {summary.adjustmentCount === 1 ? 'adjustment' : 'adjustments'} of ₱0 recorded in this
            period. Listed below, and deliberately not counted in any figure.
          </p>
        )}
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-slate-900">
          Settled bills
          <span className="ml-2 font-normal text-slate-500">
            {rows.length} in {summary.label.toLowerCase()}
          </span>
        </h3>

        {rows.length === 0 ? (
          <p className="rounded-card border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-card">
            Nothing was collected in this period.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {settledRows.map((entry) => (
              <TransactionRow key={entry.id} entry={entry} refunds={refunds} />
            ))}
          </ul>
        )}
        <Pager page={settledPage} pageCount={settledPages} onPage={setSettledPage} />
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-slate-900">
          Refunds and adjustments
          <span className="ml-2 font-normal text-slate-500">
            {refundRows.length} in {summary.label.toLowerCase()}
          </span>
        </h3>

        {refundRows.length === 0 ? (
          <p className="rounded-card border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-card">
            No refunds or adjustments in this period.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {pageRefundRows.map((entry) => (
              <RefundRow key={entry.id} entry={entry} transactions={transactions} />
            ))}
          </ul>
        )}
        <Pager page={refundPage} pageCount={refundPages} onPage={setRefundPage} />
      </div>
    </div>
  )
}

export default Revenue
