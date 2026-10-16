/*
  MOCK PC DATA + PC DOMAIN RULES — Phase 2 onward.
  src/data/pcs.js is deleted in Phase 11. The status keys and transition
  rules below move to the real data layer in Phase 9/10 and are NOT deleted.

  A PC has a name, a status, and — since Phase 5 — a needsRepair flag.
  Still no location and still no notes.

  WHY THE FLAG EXISTS. `status` says what the PC is doing RIGHT NOW.
  `needsRepair` says whether the machine has a KNOWN PROBLEM. They are
  different questions, and before this flag existed one value had to
  answer both. Moving a customer onto a PC flagged `issue` overwrote the
  status with `rented`, and when that rental ended the PC went back to
  `free` with the fault erased — a machine with a sticky key was silently
  returned to the available pool.

  Decision 33 was amended for this. A PC is name + status + needsRepair.
*/

export const PC_STATUS = {
  FREE: 'free',
  RENTED: 'rented',
  ISSUE: 'issue',
  UNRESPONSIVE: 'unresponsive',
}

/*
  Allowed status changes.

  free <-> rented arrived in Phase 3, when starting and stopping a rental
  became possible.

  rented -> issue / unresponsive stays allowed, because a rented PC is
  exactly the case that triggers a transfer (Phase 5).
*/
export const ALLOWED_TRANSITIONS = {
  [PC_STATUS.FREE]: [PC_STATUS.RENTED, PC_STATUS.ISSUE, PC_STATUS.UNRESPONSIVE],
  [PC_STATUS.RENTED]: [PC_STATUS.FREE, PC_STATUS.ISSUE, PC_STATUS.UNRESPONSIVE],
  // issue → rented arrived in Phase 5, for TRANSFERS ONLY. The plan defines
  // issue as "a problem was flagged, but the PC is still usable", so a
  // customer may be moved onto one. It is deliberately NOT a route to a new
  // rental: startRental refuses anything that is not free, so a flagged
  // machine can be rescued but not sold.
  [PC_STATUS.ISSUE]: [PC_STATUS.FREE, PC_STATUS.RENTED, PC_STATUS.UNRESPONSIVE],
  [PC_STATUS.UNRESPONSIVE]: [PC_STATUS.FREE],
}

export const DEFAULT_PCS = [
  { id: 'pc-01', name: 'PC-01', status: PC_STATUS.FREE, needsRepair: false },
  { id: 'pc-02', name: 'PC-02', status: PC_STATUS.RENTED, needsRepair: false },
  { id: 'pc-03', name: 'PC-03', status: PC_STATUS.FREE, needsRepair: false },
  { id: 'pc-04', name: 'PC-04', status: PC_STATUS.UNRESPONSIVE, needsRepair: true },
  { id: 'pc-05', name: 'PC-05', status: PC_STATUS.FREE, needsRepair: false },
  { id: 'pc-06', name: 'PC-06', status: PC_STATUS.ISSUE, needsRepair: true },
  { id: 'pc-07', name: 'PC-07', status: PC_STATUS.FREE, needsRepair: false },
  { id: 'pc-08', name: 'PC-08', status: PC_STATUS.FREE, needsRepair: false },
]
