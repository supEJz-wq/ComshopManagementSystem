import { formatClock, getDisplayRemaining, getElapsedSeconds } from '../data/rentals.js'
import RentalTimer from '../components/RentalTimer.jsx'
import { usePcs } from '../context/pcContext.js'
import { useRentals } from '../context/rentalContext.js'
import DataState from '../components/DataState.jsx'
import { RentalsSkeleton } from '../components/skeletons.jsx'

function Rentals() {
  const { pcs, loading: pcsLoading, error: pcsError } = usePcs()
  const { rentals, now, loading, error } = useRentals()

  if (loading || pcsLoading) return <RentalsSkeleton />
  if (error || pcsError) return <DataState error={error || pcsError} />

  // Soonest-ending first. That is the order the cashier cares about.
  const ordered = [...rentals].sort(
    (a, b) => getDisplayRemaining(a, now) - getDisplayRemaining(b, now),
  )

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-card border border-slate-200 bg-white p-4 shadow-card">
        <h2 className="text-base font-semibold text-slate-900">Active rentals</h2>
        <p className="mt-1 text-sm text-slate-600">
          Soonest ending first. The timer is the block display; the time used is
          what Phase 4 bills.
        </p>
      </div>

      {ordered.length === 0 ? (
        <div className="rounded-card border border-slate-200 bg-white p-8 text-center shadow-card">
          <p className="text-sm text-slate-600">No active rentals.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {ordered.map((rental) => {
            const pc = pcs.find((candidate) => candidate.id === rental.pcId)
            return (
              <div
                key={rental.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-card border border-slate-200 bg-white p-4 shadow-card"
              >
                <div>
                  <p className="font-medium text-slate-900">{pc?.name ?? rental.pcId}</p>
                  <p className="text-xs text-slate-500">
                    Used {formatClock(getElapsedSeconds(rental, now))}
                  </p>
                </div>
                <RentalTimer rental={rental} now={now} size="sm" />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Rentals
