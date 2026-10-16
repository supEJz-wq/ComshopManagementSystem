import { useEffect, useState } from 'react'
import { PC_STATUS } from '../data/pcs.js'
import {
  MAX_RENTAL_SECONDS,
  billRental,
  bookedSecondsOf,
  priceForPiece,
} from '../data/pricing.js'
import {
  DURATION_ERROR,
  DURATION_TOO_LONG_ERROR,
  createDefaultRentals,
  getDisplayRemaining,
  isValidDuration,
} from '../data/rentals.js'
import { usePcs } from './pcContext.js'
import { RentalContext } from './rentalContext.js'

const RENTALS_KEY = 'cybershopos.rentals'

function loadRentals() {
  try {
    const raw = localStorage.getItem(RENTALS_KEY)
    return raw ? JSON.parse(raw) : createDefaultRentals()
  } catch {
    return createDefaultRentals()
  }
}

export function RentalProvider({ children }) {
  const { pcs, setStatus } = usePcs()
  const [rentals, setRentals] = useState(loadRentals)
  const [now, setNow] = useState(() => Date.now())

  // One interval for the whole app, not one per tile.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    localStorage.setItem(RENTALS_KEY, JSON.stringify(rentals))
  }, [rentals])

  // Both durations are validated here, not only in the UI, so a bad value can
  // never reach localStorage even if a control is bypassed. The pickers apply
  // the same rule from data/rentals.js to reject it sooner with a visible
  // message. Durations are in SECONDS.
  function startRental(pcId, seconds) {
    if (!isValidDuration(seconds)) return { ok: false, error: DURATION_ERROR }

    if (rentals.some((rental) => rental.pcId === pcId)) {
      return { ok: false, error: 'This PC already has an active rental.' }
    }

    // A new rental needs a genuinely free PC. The board only offers the
    // control on a free PC, but the rule is enforced here too, so a flagged
    // machine can never be sold a new rental even if the UI is bypassed.
    // Flagged machines are rescued by a transfer, not rented out.
    const pc = pcs.find((candidate) => candidate.id === pcId)
    if (pc && pc.status !== PC_STATUS.FREE) {
      return { ok: false, error: 'This PC is not available for a new rental.' }
    }

    if (seconds > MAX_RENTAL_SECONDS) {
      return { ok: false, error: DURATION_TOO_LONG_ERROR }
    }

    const at = Date.now()
    setRentals((prev) => [
      ...prev,
      {
        id: `r-${at}`,
        pcId,
        blockSeconds: seconds,
        startedAt: at,
        blockStartedAt: at,
        segments: [{ seconds, amount: priceForPiece(seconds) }],
        transfers: [],
      },
    ])
    setStatus(pcId, PC_STATUS.RENTED)
    return { ok: true }
  }

  /*
    Moves an active rental to another PC — Core Feature 6.1.4, Rule 6.

    A destination may be free, or flagged issue, because the plan defines
    issue as "still usable". Unresponsive is never eligible.

    Nothing about the clock changes. startedAt, blockSeconds, blockStartedAt
    and segments are all left exactly as they were, so the bill cannot move
    and no additional charge can be created. Only pcId and the transfer
    record change.

    Names are captured at the moment of transfer, not looked up later. A PC
    name is never edited and a PC is never deleted (Decision 34), so the
    stored name stays correct forever and the record needs no joins.
  */
  function transferRental(fromPcId, toPcId) {
    if (fromPcId === toPcId) return { ok: false, error: 'Choose a different PC.' }

    const rental = rentals.find((candidate) => candidate.pcId === fromPcId)
    if (!rental) return { ok: false, error: 'No active rental on this PC.' }

    const target = pcs.find((candidate) => candidate.id === toPcId)
    if (!target) return { ok: false, error: 'That PC does not exist.' }

    if (target.status !== PC_STATUS.FREE && target.status !== PC_STATUS.ISSUE) {
      return { ok: false, error: 'That PC cannot be used.' }
    }

    if (rentals.some((candidate) => candidate.pcId === toPcId)) {
      return { ok: false, error: 'That PC already has an active rental.' }
    }

    const source = pcs.find((candidate) => candidate.id === fromPcId)
    const at = Date.now()

    setRentals((prev) =>
      prev.map((candidate) =>
        candidate.id === rental.id
          ? {
              ...candidate,
              pcId: toPcId,
              transfers: [
                ...(candidate.transfers ?? []),
                { fromPcId, fromPcName: source?.name ?? fromPcId, toPcId, toPcName: target.name, at },
              ],
            }
          : candidate,
      ),
    )

    // The source goes free ONLY if it was genuinely rented. A PC flagged
    // broken stays broken — the same rule stopping a rental applies here.
    if (source && source.status === PC_STATUS.RENTED) {
      setStatus(fromPcId, PC_STATUS.FREE)
    }
    setStatus(toPcId, PC_STATUS.RENTED)

    return { ok: true }
  }

  /*
    PCs a rental on this PC could be moved to: free, or flagged issue, and
    with no active rental of its own. Unresponsive is never offered.
  */
  function transferTargets(fromPcId) {
    return pcs.filter(
      (pc) =>
        pc.id !== fromPcId &&
        (pc.status === PC_STATUS.FREE || pc.status === PC_STATUS.ISSUE) &&
        !rentals.some((rental) => rental.pcId === pc.id),
    )
  }

  /*
    Ends the rental and returns everything the payment screen needs: the
    closed rental, when it ended, and the bill. Returning null when there
    is nothing to stop keeps the caller honest.

    A broken PC stays broken when its rental ends. Only a genuinely
    rented PC goes back to free.
  */
  function stopRental(pcId) {
    const rental = rentals.find((candidate) => candidate.pcId === pcId)
    if (!rental) return null

    const endedAt = Date.now()
    setRentals((prev) => prev.filter((candidate) => candidate.pcId !== pcId))

    const pc = pcs.find((candidate) => candidate.id === pcId)
    if (pc && pc.status === PC_STATUS.RENTED) setStatus(pcId, PC_STATUS.FREE)

    return { rental, endedAt, bill: billRental(rental, endedAt) }
  }

  // Extension is only available while time remains on the clock.
  function extendRental(pcId, seconds) {
    if (!isValidDuration(seconds)) return { ok: false, error: DURATION_ERROR }

    const rental = rentals.find((candidate) => candidate.pcId === pcId)
    if (!rental) return { ok: false, error: 'No active rental on this PC.' }

    const remaining = getDisplayRemaining(rental, Date.now())
    if (remaining <= 0) return { ok: false, error: 'Cannot extend at zero minutes.' }

    if (bookedSecondsOf(rental) + seconds > MAX_RENTAL_SECONDS) {
      return { ok: false, error: DURATION_TOO_LONG_ERROR }
    }

    setRentals((prev) =>
      prev.map((candidate) =>
        candidate.id === rental.id
          ? {
              ...candidate,
              // Display block restarts from the new total.
              blockSeconds: remaining + seconds,
              blockStartedAt: Date.now(),
              // Billing gains a separately priced piece, so a 6-hour
              // extension earns the promo on its own.
              segments: [...candidate.segments, { seconds, amount: priceForPiece(seconds) }],
            }
          : candidate,
      ),
    )
    return { ok: true }
  }

  function rentalFor(pcId) {
    return rentals.find((rental) => rental.pcId === pcId) ?? null
  }

  return (
    <RentalContext.Provider
      value={{
        rentals,
        now,
        startRental,
        stopRental,
        extendRental,
        transferRental,
        transferTargets,
        rentalFor,
      }}
    >
      {children}
    </RentalContext.Provider>
  )
}
