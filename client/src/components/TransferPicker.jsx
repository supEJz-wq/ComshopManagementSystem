import { useState } from 'react'
import { STATUS_VISUALS } from './pcStatus.jsx'

/*
  TRANSFER PICKER — Core Feature 6.1.4.

  Lists the PCs a rental could be moved to: free ones, plus any flagged
  issue, because the plan defines issue as "a problem was flagged, but the
  PC is still usable". Unresponsive PCs are never offered, and neither is
  any PC that already has a rental running.

  The customer and cashier agree in person (Business Rule 5); this screen
  only records the result.
*/
function TransferPicker({ fromPcName, targets, onPick, onCancel }) {
  const [error, setError] = useState('')

  function handlePick(pc) {
    const result = onPick(pc.id)
    if (!result.ok) setError(result.error)
  }

  return (
    <div className="mt-3 rounded-panel border border-slate-200 bg-slate-50 p-3 shadow-overlay">
      <p className="text-sm font-semibold text-slate-900">Move to another PC</p>
      <p className="mt-0.5 text-xs text-slate-500">
        {fromPcName} is out of action. Remaining time carries over and nothing is added to
        the bill.
      </p>

      {targets.length === 0 ? (
        <p className="mt-3 rounded-control bg-white px-2.5 py-2 text-xs text-slate-600">
          No other PC is free right now.
        </p>
      ) : (
        <div className="mt-3 grid grid-cols-2 gap-1.5">
          {targets.map((pc) => {
            const visual = STATUS_VISUALS[pc.status]
            return (
              <button
                key={pc.id}
                type="button"
                onClick={() => handlePick(pc)}
                className="flex items-center gap-1.5 rounded-control border border-slate-300 bg-white px-2 py-1.5 text-left hover:bg-slate-100"
              >
                <span className={`rounded-control px-1.5 py-0.5 text-xs font-medium ${visual.tile}`}>
                  <span className="flex items-center gap-1">
                    {visual.glyph}
                    {pc.name}
                  </span>
                </span>
              </button>
            )
          })}
        </div>
      )}

      {error && (
        <p role="alert" className="mt-2 text-xs text-state-fault">
          {error}
        </p>
      )}

      <div className="mt-3 flex justify-end border-t border-slate-200 pt-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-control border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

export default TransferPicker
