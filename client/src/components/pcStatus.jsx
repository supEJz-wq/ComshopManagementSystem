import { PC_STATUS } from '../data/pcs.js'

/*
  Status visuals for the board.

  Every state carries a text label AND a distinct glyph shape, so the board
  never relies on color alone. `rail` tints the left edge of the card, which
  is deliberately redundant with that chip: it lets the whole board be read as
  a column of coloured edges from across the room, and it costs nothing in
  accessibility precisely because the chip already spells the state out.
*/

export const STATUS_VISUALS = {
  [PC_STATUS.FREE]: {
    label: 'Free',
    tile: 'bg-surface-free text-state-free',
    rail: 'border-l-state-free',
    glyph: (
      <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-5 w-5">
        <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M6.5 10.5l2.5 2.5 4.5-5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  [PC_STATUS.RENTED]: {
    label: 'Rented',
    tile: 'bg-surface-busy text-state-busy',
    rail: 'border-l-state-busy',
    glyph: (
      <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-5 w-5">
        <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="10" cy="10" r="3.5" fill="currentColor" />
      </svg>
    ),
  },
  [PC_STATUS.ISSUE]: {
    label: 'Issue',
    tile: 'bg-surface-issue text-state-issue',
    rail: 'border-l-state-issue',
    glyph: (
      <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-5 w-5">
        <path
          d="M10 2.5l8 15H2z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path d="M10 8v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="10" cy="14.5" r="1" fill="currentColor" />
      </svg>
    ),
  },
  [PC_STATUS.UNRESPONSIVE]: {
    label: 'Unresponsive',
    tile: 'bg-surface-fault text-state-fault',
    rail: 'border-l-state-fault',
    glyph: (
      <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-5 w-5">
        <path
          d="M6 2.5h8l3.5 3.5v8L14 17.5H6L2.5 14V6z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M7 7l6 6M13 7l-6 6"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
}

/*
  Single source of truth for the tile actions (Decision 49). A function
  rather than a constant because a PC can be both busy and known-broken:
  a rental on a PC that still needs repair needs a way to clear the repair
  without disturbing the rental.

  A `repair` action means "clear the known fault". Every other action means
  "change the status now". They are deliberately different, so repairing a
  busy PC never stops the customer's time.
*/
export function tileActionsFor(status, needsRepair) {
  if (status === PC_STATUS.UNRESPONSIVE) {
    return [{ label: 'Repair', next: null }]
  }

  if (status === PC_STATUS.ISSUE) {
    return [
      { label: 'Resolve', next: null },
      { label: 'Mark unresponsive', next: PC_STATUS.UNRESPONSIVE },
    ]
  }

  // free and rented share the same shape; only the repair flag differs
  const actions = []
  if (needsRepair) actions.push({ label: 'Repair', next: null })
  actions.push(
    { label: 'Mark issue', next: PC_STATUS.ISSUE },
    { label: 'Mark unresponsive', next: PC_STATUS.UNRESPONSIVE },
  )
  return actions
}

/*
  The repair marker. Shown whenever a PC is known-broken but still
  working, so a fault cannot quietly disappear into the available pool.
  It carries a text label, never colour alone (Decision 19).
*/
export function repairBadgeVisible(status, needsRepair) {
  return Boolean(needsRepair) && (status === PC_STATUS.FREE || status === PC_STATUS.RENTED)
}
