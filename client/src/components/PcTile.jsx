import { useState } from 'react'
import { PC_STATUS } from '../data/pcs.js'
import { DURATION_PRESETS, durationFromParts } from '../data/rentals.js'
import { STATUS_VISUALS, repairBadgeVisible, tileActionsFor } from './pcStatus.jsx'
import RentalTimer from './RentalTimer.jsx'
import TransferPicker from './TransferPicker.jsx'

/*
  The shell both pickers sit in. A contained panel rather than a loose
  block, so a transient decision reads as its own section of the tile and
  the tile's action divider underneath is not mistaken for part of it.
*/
function PickerPanel({ title, hint, children }) {
  return (
    <div className="mt-3 rounded-panel border border-slate-200 bg-slate-50 p-3 shadow-overlay">
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      {hint && <p className="mt-0.5 text-xs text-slate-500">{hint}</p>}
      {children}
    </div>
  )
}

/*
  Presets in an equal-width three-column grid. A flex row of five ragged
  buttons reflows unpredictably in a narrow tile; a fixed grid never does.
  The sixth cell is deliberately empty — there are exactly five approved
  presets, and the free-entry field below is the only other route in.
*/
function PresetGrid({ onPick, prefix = '' }) {
  return (
    <div className="mt-3 grid grid-cols-3 gap-1.5">
      {DURATION_PRESETS.map((preset) => (
        <button
          key={preset.minutes}
          type="button"
          onClick={() => onPick(preset.minutes)}
          className="rounded-control border border-slate-300 bg-white px-2 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
        >
          {prefix}
          {preset.label}
        </button>
      ))}
    </div>
  )
}

/*
  The free-entry half of both pickers: hours, minutes and seconds.
  Shared rather than repeated so the start and extend pickers validate
  identically and cannot drift apart.

  Hours exist so a 7-hour rental does not have to be typed as 420 minutes.
  Seconds exist for an emergency — someone who needs the machine for two
  minutes should be recordable in two minutes, not rounded-control up to 30.
  Both still bill at ₱10 per 30-minute block.
*/
function DurationField({ id, submitLabel, onSubmit, onCancel }) {
  const [hours, setHours] = useState('')
  const [minutes, setMinutes] = useState('')
  const [seconds, setSeconds] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    const result = durationFromParts(hours, minutes, seconds)
    if (!result.ok) {
      setError(result.error)
      return
    }
    onSubmit(result.seconds)
  }

  const box =
    'w-16 rounded-control border border-slate-300 bg-white px-2 py-1.5 text-sm tabular-nums text-slate-900 focus:border-slate-500'

  const parts = [
    { key: 'hours', label: 'hr', value: hours, set: setHours, max: 24, placeholder: '0' },
    { key: 'minutes', label: 'min', value: minutes, set: setMinutes, max: 59, placeholder: '00' },
    { key: 'seconds', label: 'sec', value: seconds, set: setSeconds, max: 59, placeholder: '00' },
  ]

  return (
    <form onSubmit={handleSubmit} className="mt-3 border-t border-slate-200 pt-3">
      <label htmlFor={`${id}-hours`} className="block text-xs font-medium text-slate-700">
        Or enter a duration
      </label>

      <div className="mt-1.5 flex flex-wrap items-end gap-2">
        {parts.map((part) => (
          <div key={part.key}>
            <span className="sr-only">
              {part.label}
            </span>
            <div className="flex items-center gap-1">
              <input
                id={`${id}-${part.key}`}
                type="number"
                min="0"
                max={part.max}
                step="1"
                inputMode="numeric"
                placeholder={part.placeholder}
                value={part.value}
                onChange={(event) => {
                  part.set(event.target.value)
                  setError('')
                }}
                className={box}
              />
              <span className="text-xs text-slate-500">{part.label}</span>
            </div>
          </div>
        ))}

        <div className="ml-auto flex gap-2">
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
            {submitLabel}
          </button>
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-2 text-xs text-state-fault">
          {error}
        </p>
      )}
    </form>
  )
}

function DurationPicker({ onStart, onCancel }) {
  return (
    <PickerPanel title="Start a rental" hint="How long?">
      {/* Presets are authored in minutes; everything downstream is seconds. */}
      <PresetGrid onPick={(minutes) => onStart(minutes * 60)} />
      <DurationField
        id="custom-start"
        submitLabel="Start"
        onSubmit={onStart}
        onCancel={onCancel}
      />
    </PickerPanel>
  )
}

function PcTile({ pc, rental, now, onChange, onRepair, onStart, onStop, onExtend, onTransfer, loadTargets }) {
  const [picking, setPicking] = useState(false)
  const [extendOpen, setExtendOpen] = useState(false)
  const [transferOpen, setTransferOpen] = useState(false)
  const visual = STATUS_VISUALS[pc.status]
  const needsRepair = pc.needsRepair ?? false

  // Single source of truth for fault actions. pcStatus.jsx owns this; do not
  // re-derive it here.
  const actions = tileActionsFor(pc.status, needsRepair)

  // A transfer is only offered on a rented PC that has been flagged. That is
  // the exact situation a transfer exists for.
  const flagged = pc.status === PC_STATUS.ISSUE || pc.status === PC_STATUS.UNRESPONSIVE
  const canTransfer = Boolean(rental) && flagged

  return (
    <div
      className={`flex flex-col rounded-card border border-slate-200 border-l-4 bg-white p-4 shadow-card ${visual.rail}`}
    >
      <span className="font-semibold text-slate-900">{pc.name}</span>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className={`rounded-control px-2 py-1 text-xs font-medium ${visual.tile}`}>
          <span className="flex items-center gap-1.5">
            {visual.glyph}
            {visual.label}
          </span>
        </span>

        {/*
          A PC can be working and known-broken at the same time. Without this
          the fault disappears the moment a rental ends, and a machine with a
          sticky key looks identical to a perfect one.
        */}
        {repairBadgeVisible(pc.status, needsRepair) && (
          <span className="rounded-control border border-state-issue px-2 py-1 text-xs font-medium text-state-issue">
            needs repair
          </span>
        )}
      </div>

      {rental && <RentalTimer rental={rental} now={now} />}

      {picking && (
        <DurationPicker
          onStart={(seconds) => {
            onStart(pc.id, seconds)
            setPicking(false)
          }}
          onCancel={() => setPicking(false)}
        />
      )}

      {extendOpen && rental && (
        <PickerPanel title="Add time" hint="Adds to the time remaining on this rental.">
          <PresetGrid
            prefix="+"
            onPick={(minutes) => {
              onExtend(pc.id, minutes * 60)
              setExtendOpen(false)
            }}
          />

          <DurationField
            id="custom-extend"
            submitLabel="Add"
            onSubmit={(seconds) => {
              onExtend(pc.id, seconds)
              setExtendOpen(false)
            }}
            onCancel={() => setExtendOpen(false)}
          />
        </PickerPanel>
      )}

      {transferOpen && rental && (
        <TransferPicker
          fromPcName={pc.name}
          fromPcId={pc.id}
          loadTargets={loadTargets}
          onPick={async (pcId) => {
            // Async since Phase 11: the server decides whether the move is legal.
            const result = await onTransfer(pc.id, pcId)
            if (result.ok) setTransferOpen(false)
            return result
          }}
          onCancel={() => setTransferOpen(false)}
        />
      )}

      {/*
        One decision at a time. While a picker is open the fault actions are
        withheld, so a transient choice is never competing with permanent
        state changes. While the start picker is open nothing else belongs
        here at all, so the whole row — divider included — is dropped rather
        than left as an empty strip.
      */}
      {!picking && !transferOpen && (
        <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-3">
          {pc.status === PC_STATUS.FREE && !rental && (
            <button
              type="button"
              onClick={() => setPicking(true)}
              /*
                Primary action on the board, so it gets the primary weight.

                It was `bg-state-free` — green, which in this app means the
                machine is free. But pressing it makes the machine *rented*.
                The button was painted the colour of the state it was about
                to end, which is backwards, and it put a state colour on a
                button (Decision 91).
              */
              className="rounded-control bg-slate-900 px-2 py-1 text-xs font-medium text-white hover:bg-slate-700"
            >
              Start rental
            </button>
          )}

          {/*
            Stop and Extend are gated on the RENTAL, never on the PC status.
            A rented PC may be flagged issue/unresponsive, and that is the
            transfer case. Gating on status hid these controls on exactly
            that PC, stranding the rental with no way to end it. Whether the
            PC returns to free is decided in stopRental, not here.
          */}
          {rental && (
            <>
              <button
                type="button"
                onClick={() => onStop(pc.id)}
                className="rounded-control border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                Stop rental
              </button>
              <button
                type="button"
                onClick={() => {
                  setExtendOpen((value) => !value)
                  setTransferOpen(false)
                }}
                className="rounded-control border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                Extend
              </button>
              {canTransfer && (
                <button
                  type="button"
                  onClick={() => {
                    setTransferOpen(true)
                    setExtendOpen(false)
                  }}
                  className="rounded-control border border-state-issue px-2 py-1 text-xs font-medium text-state-issue hover:bg-surface-issue"
                >
                  Transfer
                </button>
              )}
            </>
          )}

          {!extendOpen &&
            actions.map((action) => (
              <button
                key={action.label}
                type="button"
                onClick={() => (action.next ? onChange(pc.id, action.next) : onRepair(pc.id))}
                className="rounded-control border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                {action.label}
              </button>
            ))}
        </div>
      )}
    </div>
  )
}

export default PcTile
