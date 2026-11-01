import { usePcs } from '../context/pcContext.js'
import { useRentals } from '../context/rentalContext.js'
import DataState from '../components/DataState.jsx'
import { HomeSkeleton } from '../components/skeletons.jsx'
import { STATUS_VISUALS } from '../components/pcStatus.jsx'

/*
  The signed-in landing.

  This page deliberately shows only what is true RIGHT NOW — how many PCs
  are in each state, and how many rentals are running. It carries no money
  figures, no revenue, and no transaction history: those belong to Phase 8
  Admin Monitoring, and duplicating them here would let the two disagree.

  It used to display build progress ("Phase 0 and Phase 1 are complete") and
  a technology-stack table. That was wrong twice over: the shop staff who use
  this app do not care what phase the build is in, and the stack is already
  recorded in projectplan.md §4.1 and client/README.md. Both went stale.
*/
function Home() {
  const { pcs, loading: pcsLoading, error: pcsError } = usePcs()
  const { rentals, loading: rentalsLoading, error: rentalsError } = useRentals()

  // Both lists arrive over the network, so neither is meaningful until both
  // have landed. Rendering a count of zero first is the flicker this avoids.
  const loading = pcsLoading || rentalsLoading
  const error = pcsError || rentalsError

  // Reuses the board's own status visuals, so a state here always carries a
  // label and a glyph as well as its colour.
  const stateCounts = Object.entries(STATUS_VISUALS).map(([status, visual]) => ({
    visual,
    count: pcs.filter((pc) => pc.status === status).length,
  }))

if (loading) return <HomeSkeleton />
  if (error) return <DataState error={error} />

  return (
      <div className="flex flex-col gap-6">
      {/*
        "Signed in as ..." used to be a whole card to itself. It is not
        information — the role is already on the sidebar, where it belongs,
        and a cashier does not open their own app to be reminded who they
        are. The page now leads with the one thing worth leading with.
      */}
      <div className="rounded-card border border-slate-200 bg-white p-6 shadow-card">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-sm font-semibold text-slate-900">Right now</h3>
          <p className="text-xs text-slate-500">
            {pcs.length} {pcs.length === 1 ? 'computer' : 'computers'} ·{' '}
            {rentals.length} active {rentals.length === 1 ? 'rental' : 'rentals'}
          </p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stateCounts.map(({ visual, count }) => (
            <div key={visual.label} className={`rounded-card border border-slate-200 p-3 ${visual.tile}`}>
              <span className="flex items-center gap-1.5 text-xs font-medium">
                {visual.glyph}
                {visual.label}
              </span>
              <p className="mt-2 font-data text-3xl leading-none font-semibold tabular-nums">
                {count}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Home
