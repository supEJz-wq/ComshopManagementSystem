import { useState } from 'react'
import { useTransactions } from '../context/transactionContext.js'
import { formatDuration, formatPeso } from '../data/pricing.js'
import { formatSpan, formatDayLabel } from '../data/rentals.js'
import { netAmount, refundableFor } from '../data/refunds.js'
import { formatRef } from '../data/revenue.js'
import { useRentals } from '../context/rentalContext.js'
import RefundPanel from './Refunds.jsx'
import Pager, { PAGE_SIZE } from '../components/Pager.jsx'

/*
  PAYMENTS — Phase 4.

  Stopping a rental lands here with the bill. The cashier records the
  cash, sees the change, and completes the transaction — or leaves it
  unsettled and comes back to it later. The PC is already free either
  way, so an unsettled bill never blocks the shop.
*/
/*
  The PCs a rental passed through. Stored by name at the moment of each
  transfer, so the chain survives forever without needing to look anything
  up — a PC name is never edited and a PC is never deleted.
*/
function TransferChain({ transfers }) {
  if (!transfers || transfers.length === 0) return null

  const names = [transfers[0].fromPcName, ...transfers.map((t) => t.toPcName)]

  return (
    <p className="text-xs text-state-issue">
      moved {names.join(' → ')}
    </p>
  )
}

function PaymentRow({ entry, onSettle, onRefund, refunds, now }) {
  const [cash, setCash] = useState('')
  const [error, setError] = useState('')
  const [refunding, setRefunding] = useState(false)

  // How long this bill has been sitting unsettled. endedAt is when the
  // rental stopped, which is the moment the bill was raised.
  const waitingSeconds = Math.max(0, Math.round((now - entry.endedAt) / 1000))

  if (entry.settled) {
    const figures = refundableFor(entry, entry.usedSeconds, refunds)
    const refunded = figures.alreadyRefunded
    const net = netAmount(entry, refunds)

    return (
      <div className="rounded-card border border-slate-200 bg-white p-4 shadow-card">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            {/* Phase 7 — the stored reference, so a bill can be named out loud */}
            <p className="flex items-baseline gap-2">
              <span className="font-data text-xs font-semibold text-slate-500">
                {formatRef(entry.ref)}
              </span>
              <span className="font-medium text-slate-900">{entry.pcName}</span>
            </p>
            <TransferChain transfers={entry.transfers} />
            <p className="text-xs text-slate-500">{formatSpan(entry.startedAt, entry.endedAt)}</p>
            <p className="text-xs text-slate-500">
              {formatDuration(entry.usedSeconds)} used · {entry.cashierName}
            </p>
          </div>
          <div className="text-right">
            <p className="font-data text-lg tabular-nums text-state-free">
              {formatPeso(entry.amountCharged)}
              <span className="ml-2 text-xs font-sans font-normal text-slate-500">
                {entry.change > 0 ? `${formatPeso(entry.change)} change` : 'paid in full'}
              </span>
            </p>
            {refunded > 0 && (
              <p className="text-xs text-state-fault">
                refunded {formatPeso(refunded)} · net {formatPeso(net)}
              </p>
            )}
          </div>
        </div>

        {!refunding && (
          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
            {refunds.map((r) => (
              <span
                key={r.id}
                className="rounded-control bg-surface-fault px-2 py-0.5 text-xs text-state-fault"
              >
                {formatPeso(r.amount)} · {r.reason}
              </span>
            ))}
            <button
              type="button"
              disabled={figures.maxRefundable === 0}
              onClick={() => setRefunding(true)}
              className="ml-auto rounded-control border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {figures.maxRefundable === 0 ? 'Fully refunded' : 'Refund'}
            </button>
          </div>
        )}

        {refunding && (
          <RefundPanel
            transaction={entry}
            figures={figures}
            onSubmit={(payload) => {
              const result = onRefund(payload)
              if (result.ok) setRefunding(false)
              return result
            }}
            onCancel={() => setRefunding(false)}
          />
        )}
      </div>
    )
  }

  /*
    An empty field coerces to 0 via Number(''), and 0 is a valid integer, so
    without an explicit check an untouched field silently recorded a ₱0
    payment. Empty, 0, negative, and fractional amounts are all rejected —
    there are never centavos, and no payment is ever worth nothing.

    An underpayment is REFUSED, not absorbed. Settling for less than the
    bill would quietly record less revenue than was owed, and a deliberate
    goodwill discount is a rental adjustment with a recorded reason
    (Core Feature 6.1.6, Business Rule 11) — not a sloppy partial
    payment. That arrives in Phase 6. Until then a bill is settled in full
    or left unsettled.
  */
  const raw = cash.trim()
  const received = Number(raw)
  const valid = raw !== '' && Number.isInteger(received) && received >= 1
  const underpaid = valid && received < entry.amountDue
  const change = valid && !underpaid ? Math.max(0, received - entry.amountDue) : 0

  function handleSubmit(event) {
    event.preventDefault()
    if (!valid) {
      setError('Enter the cash received — at least ₱1.')
      return
    }
    if (underpaid) {
      setError(
        `Short by ${formatPeso(entry.amountDue - received)}. The full ${formatPeso(entry.amountDue)} is required to settle this bill.`,
      )
      return
    }
    onSettle(entry.id, received)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-card border border-slate-200 bg-white p-4 shadow-card"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <p className="font-medium text-slate-900">{entry.pcName}</p>
          <TransferChain transfers={entry.transfers} />
          <p className="text-xs text-slate-500">{formatSpan(entry.startedAt, entry.endedAt)}</p>
          <p className="text-xs text-slate-500">
            {formatDuration(entry.usedSeconds)} used
            {entry.overstaySeconds > 0 && ` · ${formatDuration(entry.overstaySeconds)} extra`}
            {' · '}
            <span className="text-state-busy">waiting {formatDuration(waitingSeconds)}</span>
          </p>
        </div>
        <p className="font-data text-2xl tabular-nums text-slate-900">
          {formatPeso(entry.amountDue)}
        </p>
      </div>

      <ul className="mt-3 border-t border-slate-100 pt-3">
        {entry.pieces.map((piece, index) => (
          <li key={index} className="flex justify-between text-xs text-slate-600">
            <span className="tabular-nums">
              {formatDuration(piece.seconds)}
              {piece.seconds === 21600 && ' — promo'}
              {piece.extra && ' — extra time'}
            </span>
            <span className="font-data tabular-nums">{formatPeso(piece.amount)}</span>
          </li>
        ))}
      </ul>

      <div className="mt-3 flex flex-wrap items-end gap-2 border-t border-slate-100 pt-3">
        <div>
          <label htmlFor={`cash-${entry.id}`} className="block text-xs font-medium text-slate-700">
            Cash received
          </label>
          <input
            id={`cash-${entry.id}`}
            type="number"
            min="1"
            step="1"
            inputMode="numeric"
            value={cash}
            onChange={(event) => {
              setCash(event.target.value)
              setError('')
            }}
            aria-invalid={error ? 'true' : undefined}
            className="mt-1 w-28 rounded-control border border-slate-300 px-2 py-1.5 text-sm tabular-nums text-slate-900 focus:border-slate-500 aria-invalid:border-state-fault"
          />
        </div>

        <div className="text-sm text-slate-600">
          Change{' '}
          <span className="font-data tabular-nums text-slate-900">{formatPeso(change)}</span>
        </div>

        <button
          type="submit"
          className="ml-auto rounded-control bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-700"
        >
          Record payment
        </button>
      </div>

      {/*
        Shown live while the cashier types. Underpayment is refused outright,
        so this is not a warning they can click past — it is a block.
      */}
      {underpaid && (
        <p
          role="alert"
          className="mt-2 flex items-start gap-1.5 rounded-control bg-surface-fault px-2.5 py-2 text-xs font-medium text-state-fault"
        >
          <span aria-hidden="true">⚠</span>
          <span>
            Short by {formatPeso(entry.amountDue - received)}. The full{' '}
            {formatPeso(entry.amountDue)} is required to settle this bill — it will
            stay unsettled until it is paid in full.
          </span>
        </p>
      )}

      {error && (
        <p role="alert" className="mt-2 text-xs text-state-fault">
          {error}
        </p>
      )}
    </form>
  )
}

function Payments() {
  const { unsettled, settled, settle, recordRefund, refundsFor } = useTransactions()
  const { rentals, now } = useRentals()

  /*
    Opens on the unpaid list whenever there is one, so a bill can never be
    scrolled past. With nothing outstanding it falls back to everything,
    because an empty page is worse than a long one.
  */
  const [view, setView] = useState(() => (unsettled.length > 0 ? 'unpaid' : 'all'))
  const [query, setQuery] = useState('')
  const [unpaidPage, setUnpaidPage] = useState(1)
  const [paidPage, setPaidPage] = useState(1)

  /*
    Switching the tab, or typing a search, resets both pages. Otherwise the
    screen strands itself on a page index the new filter does not have —
    typing "PC-03" while on page 4 of the paid list, for example.
  */
  function changeView(next) {
    setView(next)
    setUnpaidPage(1)
    setPaidPage(1)
  }

  function changeQuery(next) {
    setQuery(next)
    setUnpaidPage(1)
    setPaidPage(1)
  }

  const needle = query.trim().toLowerCase()
  const matches = (entry) => !needle || entry.pcName.toLowerCase().includes(needle)

  // Oldest first, BEFORE grouping. The bill most likely to be forgotten is
  // the one that has waited longest, so it must be at the top of the
  // page — not grouped away into a day heading and not left in insertion
  // order, which is newest-first (Decision 63).
  // Unpaid is the short list, but it is paged anyway — a busy night can
  // pile one up. Paid is the long list and must page or all-time becomes a
  // single scrolling column.
  const shownUnsettled = [...unsettled].filter(matches).sort((a, b) => a.endedAt - b.endedAt)
  const shownSettled = [...settled].filter(matches)
  const unpaidPages = Math.max(1, Math.ceil(shownUnsettled.length / PAGE_SIZE))
  const paidPages = Math.max(1, Math.ceil(shownSettled.length / PAGE_SIZE))
  const pageUnsettled = shownUnsettled.slice((unpaidPage - 1) * PAGE_SIZE, unpaidPage * PAGE_SIZE)
  const pageSettled = shownSettled.slice((paidPage - 1) * PAGE_SIZE, paidPage * PAGE_SIZE)

  /*
    UNPAID stays flat and OLDEST FIRST. That ordering is what stops a bill
    being overlooked (Decision 63), and there are only ever a handful of
    them — grouping would only get in the way of it.

    PAID is the long list, so that is the one grouped by day, newest day
    first and newest bill first within each day.
  */
  const outstanding = unsettled.reduce((sum, entry) => sum + entry.amountDue, 0)
  const paidTotal = shownSettled.reduce((sum, entry) => sum + entry.amountCharged, 0)

  const paidByDay = []
  for (const entry of [...pageSettled].sort((a, b) => b.endedAt - a.endedAt)) {
    const key = new Date(entry.endedAt).toDateString()
    let group = paidByDay[paidByDay.length - 1]
    if (!group || group.key !== key) {
      group = { key, label: formatDayLabel(entry.endedAt, now), total: 0, entries: [] }
      paidByDay.push(group)
    }
    group.total += entry.amountCharged
    group.entries.push(entry)
  }

  const searching = needle !== ''
  const nothingToShow =
    (view === 'unpaid' || view === 'all') &&
    shownUnsettled.length === 0 &&
    (view === 'paid' || shownSettled.length === 0)

  const views = [
    { id: 'all', label: 'All' },
    { id: 'unpaid', label: 'Unpaid' },
    { id: 'paid', label: 'Paid' },
  ]

  function row(entry) {
    return (
      <PaymentRow
        key={entry.id}
        entry={entry}
        onSettle={settle}
        onRefund={recordRefund}
        refunds={refundsFor(entry.id)}
        now={now}
      />
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-card border border-slate-200 bg-white p-4 shadow-card">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-base font-semibold text-slate-900">Payments</h2>
          {unsettled.length > 0 && (
            <p className="text-sm text-slate-600">
              <span className="font-data tabular-nums text-slate-900">
                {unsettled.length} {unsettled.length === 1 ? 'bill' : 'bills'}
              </span>
              {' · '}
              <span className="font-data tabular-nums font-semibold text-state-busy">
                {formatPeso(outstanding)}
              </span>
              {' outstanding — oldest first'}
            </p>
          )}
        </div>
        <p className="mt-1 text-sm text-slate-600">
          Record the cash for a finished rental. A bill can be left unsettled and settled
          later — the PC is already free either way.
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
          <div className="flex rounded-control border border-slate-300 shadow-card">
            {views.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => changeView(item.id)}
                aria-pressed={view === item.id}
                className={[
                  'px-2.5 py-1 text-xs font-medium',
                  view === item.id
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-50',
                ].join(' ')}
              >
                {item.label}
                {item.id === 'unpaid' && unsettled.length > 0 && ` ${unsettled.length}`}
                {item.id === 'paid' && settled.length > 0 && ` ${settled.length}`}
              </button>
            ))}
          </div>

          <div className="relative">
            <label htmlFor="payment-search" className="sr-only">
              Search by PC name
            </label>
            <input
              id="payment-search"
              type="search"
              value={query}
              onChange={(event) => changeQuery(event.target.value)}
              placeholder="Search PC name"
              className="w-40 rounded-control border border-slate-300 px-2 py-1 text-xs text-slate-900 focus:border-slate-500"
            />
          </div>

          {searching && (
            <p className="text-xs text-slate-500">
              {shownUnsettled.length + shownSettled.length} matching
              {' · '}
              <button
                type="button"
                onClick={() => changeQuery('')}
                className="underline hover:text-slate-700"
              >
                clear
              </button>
            </p>
          )}
        </div>
      </div>

      {(view === 'unpaid' || view === 'all') && shownUnsettled.length > 0 && (
        <>
          <div className="flex flex-col gap-3">
            {pageUnsettled.map(row)}
          </div>
          <Pager page={unpaidPage} pageCount={unpaidPages} onPage={setUnpaidPage} />
        </>
      )}

      {(view === 'unpaid' || view === 'all') && shownUnsettled.length === 0 && (
        <div className="rounded-card border border-slate-200 bg-white p-8 text-center shadow-card">
          <p className="text-sm text-slate-600">
            {searching
              ? 'No unpaid bill matches that search.'
              : 'No rentals waiting for payment.'}
          </p>
        </div>
      )}

      {(view === 'paid' || view === 'all') && (
        <>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-sm font-semibold text-slate-900">
              Paid · {shownSettled.length}{' '}
              {shownSettled.length === 1 ? 'transaction' : 'transactions'}
            </h3>
            {shownSettled.length > 0 && (
              <p className="text-xs text-slate-500">
                charged in view{' '}
                <span className="font-data tabular-nums text-slate-700">
                  {formatPeso(paidTotal)}
                </span>
              </p>
            )}
          </div>

          {shownSettled.length === 0 ? (
            <div className="rounded-card border border-slate-200 bg-white p-8 text-center shadow-card">
              <p className="text-sm text-slate-600">
                {searching ? 'No paid bill matches that search.' : 'No payments recorded yet.'}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {paidByDay.map((group) => (
                <section key={group.key} className="flex flex-col gap-2">
                  <div className="flex items-baseline justify-between gap-2 border-b border-slate-200 pb-1">
                    <h4 className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                      {group.label}
                    </h4>
                    <span className="font-data text-xs tabular-nums text-slate-500">
                      {formatPeso(group.total)}
                    </span>
                  </div>
                  {group.entries.map(row)}
                </section>
              ))}
            </div>
          )}
          <Pager page={paidPage} pageCount={paidPages} onPage={setPaidPage} />
        </>
      )}

      {nothingToShow && searching && (
        <p className="text-center text-xs text-slate-500">
          Nothing matched “{query.trim()}”.
        </p>
      )}

      {rentals.length > 0 && (
        <p className="text-xs text-slate-500">
          {rentals.length} {rentals.length === 1 ? 'rental is' : 'rentals are'} still
          running. Stop one on the board to bill it.
        </p>
      )}
    </div>
  )
}

export default Payments
