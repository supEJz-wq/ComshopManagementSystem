import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/auth.js'
import { usePcs } from '../context/pcContext.js'
import { useRentals } from '../context/rentalContext.js'
import { useTransactions } from '../context/transactionContext.js'
import DataState from '../components/DataState.jsx'
import { PCsSkeleton } from '../components/skeletons.jsx'
import PcTile from '../components/PcTile.jsx'
import { STATUS_VISUALS } from '../components/pcStatus.jsx'
import { formatPeso } from '../data/pricing.js'

function Legend() {
  return (
    <div className="flex flex-wrap gap-3">
      {Object.entries(STATUS_VISUALS).map(([status, visual]) => (
        <span
          key={status}
          className={`flex items-center gap-1.5 rounded-control px-2 py-1 text-xs font-medium ${visual.tile}`}
        >
          {visual.glyph}
          {visual.label}
        </span>
      ))}
    </div>
  )
}

function AddPcForm({ onAdd, onClose }) {
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    const result = onAdd(name)
    if (result.ok) setError('')
    else setError(result.error)
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-card border border-slate-200 bg-white p-4 shadow-card">
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor="pc-name" className="block text-sm font-medium text-slate-700">
            PC name
          </label>
          <input
            id="pc-name"
            value={name}
            onChange={(event) => {
              setName(event.target.value)
              setError('')
            }}
            placeholder="PC-09"
            className="mt-1 w-40 rounded-control border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500"
          />
        </div>
        <button
          type="submit"
          className="rounded-control bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          Add PC
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-control border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Cancel
        </button>
      </div>
      {error && (
        <p role="alert" className="mt-3 text-sm text-state-fault">
          {error}
        </p>
      )}
    </form>
  )
}

function PCs() {
  const { isAdmin } = useAuth()
  const { pcs, addPc, setStatus, repairPc, loading, error: pcsError } = usePcs()
  const { now, startRental, stopRental, extendRental, transferRental, transferTargets, rentalFor, loading: rentalsLoading, error: rentalsError } =
    useRentals()
  const { openTransaction, unsettled, loading: paymentsLoading, error: paymentsError } = useTransactions()
  const [adding, setAdding] = useState(false)
  const navigate = useNavigate()

  // Expected cash, not revenue — money the shop has not collected yet.
  const outstanding = unsettled.reduce((sum, entry) => sum + entry.amountDue, 0)

  // Stopping a rental ends it and opens an unsettled bill. The cashier is
  // taken to Payments, where they may record the cash or leave it for
  // later — either way the PC is already free.
async function handleStop(pcId) {
      // Async since Phase 11: the server prices the rental and writes the
      // UNSETTLED bill itself, so this has to finish before we navigate.
      const closed = await stopRental(pcId)
      if (!closed) return

      const pc = pcs.find((candidate) => candidate.id === pcId)
      if (pc) await openTransaction({ rental: closed.rental, pc, endedAt: closed.endedAt, bill: closed.bill })
      navigate('/payments')
    }

  if (loading || rentalsLoading || paymentsLoading) return <PCsSkeleton isAdmin={isAdmin} />
  if (pcsError || rentalsError || paymentsError) return <DataState error={pcsError || rentalsError || paymentsError} />

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-4 rounded-card border border-slate-200 bg-white p-4 shadow-card">
        <div>
            <h2 className="text-base font-semibold text-slate-900">PCs</h2>
            <p className="mt-1 text-sm text-slate-600">
              {pcs.length} {pcs.length === 1 ? 'computer' : 'computers'}. Names cannot
              be changed or removed once added.
            </p>
          </div>
          <div className="flex flex-col items-start gap-2 sm:items-end">
            {unsettled.length > 0 && (
              <button
                type="button"
                onClick={() => navigate('/payments')}
                className="rounded-control bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-700"
              >
                {unsettled.length}{' '}
                {unsettled.length === 1 ? 'bill' : 'bills'} ·{' '}
                {formatPeso(outstanding)}
              </button>
            )}
            {isAdmin && !adding && (
              <button
                type="button"
                onClick={() => setAdding(true)}
                className="rounded-control bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700"
              >
                Add PC
              </button>
            )}
          </div>
        </div>

      {adding && isAdmin && <AddPcForm onAdd={addPc} onClose={() => setAdding(false)} />}

      <Legend />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {pcs.map((pc) => (
          <PcTile
            key={pc.id}
            pc={pc}
            rental={rentalFor(pc.id)}
            now={now}
            onChange={setStatus}
            onRepair={repairPc}
            onStart={startRental}
            onStop={handleStop}
            onExtend={extendRental}
            onTransfer={transferRental}
            loadTargets={transferTargets}
          />
        ))}
      </div>
    </div>
  )
}

export default PCs
