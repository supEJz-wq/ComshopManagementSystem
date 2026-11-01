/*
  DEFAULT_PCS — DELETED IN PHASE 11.

  The mock PC list is gone. The board now reads dbo.pcs through /api/pcs.

  WHAT STAYS HERE is the part that was never mock data: PC_STATUS and
  ALLOWED_TRANSITIONS. Those are domain rules — the four states and the legal
  moves between them — and they are still needed by the tile components to
  decide which buttons to draw.

  They are a PRESENTATION copy. The server validates every transition for real
  (api/pcs/status.php), so a forged request cannot make an illegal move. The copy
  here only decides what the cashier is offered.

  Delete the file in Phase 12 once the rules have moved server-side entirely.
*/

export const PC_STATUS = {
  FREE: 'free',
  RENTED: 'rented',
  ISSUE: 'issue',
  UNRESPONSIVE: 'unresponsive',
};

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
};
