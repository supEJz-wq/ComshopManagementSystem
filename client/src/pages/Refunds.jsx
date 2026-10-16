import { useState } from 'react'
import { REFUND_KIND, describeRefund } from '../data/refunds.js'
import { formatDuration, formatPeso } from '../data/pricing.js'

/*
  REFUND / ADJUSTMENT PANEL — Core Features 6.1.5 and 6.1.6.

  Partial is pre-filled with the calculated figure from data/refunds.js, and
  the cashier may lower it or raise it up to the hard cap. Full refunds the
  whole remaining balance — that is a judgement made in person
  (Business Rule 5 and 8), not something the formula produces.

  A ₱0 entry is allowed and is not an error: it records that something
  happened without moving money. The reason is always mandatory
  (Business Rule 11).
*/
function RefundPanel({ transaction, figures, onSubmit, onCancel }) {
  const [kind, setKind] = useState(REFUND_KIND.PARTIAL)
  const [amount, setAmount] = useState(String(figures.suggested))
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')

  const isFull = kind === REFUND_KIND.FULL
  const shown = isFull ? figures.maxRefundable : Number(amount)

  function chooseKind(next) {
    setKind(next)
    setAmount(String(next === REFUND_KIND.FULL ? figures.maxRefundable : figures.suggested))
    setError('')
  }

  function handleSubmit(event) {
    event.preventDefault()
    const result = onSubmit({
      transactionId: transaction.id,
      kind,
      amount: isFull ? figures.maxRefundable : Number(amount),
      reason,
    })
    if (!result.ok) setError(result.error)
  }

  const raw = amount.trim()
  const typed = Number(raw)
  const typedValid = raw !== '' && Number.isInteger(typed) && typed >= 0
  const overCap = !isFull && typedValid && typed > figures.maxRefundable

  return (
    <form onSubmit={handleSubmit} className="mt-3 rounded-panel border border-slate-200 bg-slate-50 p-3 shadow-overlay">
      <p className="text-sm font-semibold text-slate-900">Refund · {transaction.pcName}</p>
      <p className="mt-0.5 text-xs text-slate-500">{describeRefund(figures)}</p>

      <dl className="mt-3 space-y-1 border-t border-slate-200 pt-3 text-xs">
        <div className="flex justify-between">
          <dt className="text-slate-600">Paid</dt>
          <dd className="font-data tabular-nums text-slate-900">
            {formatPeso(transaction.amountCharged)}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-600">
            Used ({figures.blocksUsed} {figures.blocksUsed === 1 ? 'block' : 'blocks'})
          </dt>
          <dd className="font-data tabular-nums text-slate-900">
            {formatDuration(transaction.usedSeconds)} · {formatPeso(figures.usedValue)}
          </dd>
        </div>
        {figures.alreadyRefunded > 0 && (
          <div className="flex justify-between">
            <dt className="text-slate-600">Already refunded</dt>
            <dd className="font-data tabular-nums text-slate-900">
              {formatPeso(figures.alreadyRefunded)}
            </dd>
          </div>
        )}
        <div className="flex justify-between border-t border-slate-200 pt-1 font-medium">
          <dt className="text-slate-700">Refund</dt>
          <dd className="font-data tabular-nums text-slate-900">{formatPeso(shown || 0)}</dd>
        </div>
      </dl>

      <div className="mt-3 flex flex-col gap-2">
        <label className="flex items-center gap-2 text-xs text-slate-700">
          <input
            type="radio"
            name={`refund-kind-${transaction.id}`}
            checked={!isFull}
            onChange={() => chooseKind(REFUND_KIND.PARTIAL)}
          />
          Partial — unused time
        </label>
        <label className="flex items-center gap-2 text-xs text-slate-700">
          <input
            type="radio"
            name={`refund-kind-${transaction.id}`}
            checked={isFull}
            onChange={() => chooseKind(REFUND_KIND.FULL)}
          />
          Full — the whole {formatPeso(figures.maxRefundable)} remaining
        </label>
      </div>

      {!isFull && (
        <div className="mt-3">
          <label
            htmlFor={`refund-amount-${transaction.id}`}
            className="block text-xs font-medium text-slate-700"
          >
            Refund amount
          </label>
          <input
            id={`refund-amount-${transaction.id}`}
            type="number"
            min="0"
            max={figures.maxRefundable}
            step="1"
            inputMode="numeric"
            value={amount}
            onChange={(event) => {
              setAmount(event.target.value)
              setError('')
            }}
            aria-invalid={overCap || error ? 'true' : undefined}
            className="mt-1 w-28 rounded-control border border-slate-300 bg-white px-2 py-1.5 text-sm tabular-nums text-slate-900 focus:border-slate-500 aria-invalid:border-state-fault"
          />
        </div>
      )}

      <div className="mt-3">
        <label
          htmlFor={`refund-reason-${transaction.id}`}
          className="block text-xs font-medium text-slate-700"
        >
          Reason <span className="text-state-fault">*</span>
        </label>
        <input
          id={`refund-reason-${transaction.id}`}
          type="text"
          value={reason}
          onChange={(event) => {
            setReason(event.target.value)
            setError('')
          }}
          placeholder="PC malfunction"
          className="mt-1 w-full max-w-xs rounded-control border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900 focus:border-slate-500"
        />
      </div>

      {overCap && (
        <p role="alert" className="mt-2 text-xs text-state-fault">
          That is more than the remaining {formatPeso(figures.maxRefundable)}.
        </p>
      )}

      {error && (
        <p role="alert" className="mt-2 text-xs text-state-fault">
          {error}
        </p>
      )}

      <div className="mt-3 flex justify-end gap-2 border-t border-slate-200 pt-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-control border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-control bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-slate-700"
        >
          {isFull ? 'Record full refund' : 'Record refund'}
        </button>
      </div>
    </form>
  )
}

export default RefundPanel
