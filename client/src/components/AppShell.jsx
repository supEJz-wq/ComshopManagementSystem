import { useRentals } from '../context/rentalContext.js'
import { formatDayLabel, formatWallClock } from '../data/rentals.js'
import Sidebar from './Sidebar.jsx'

/*
  The shell.

  The header used to be an uppercase eyebrow above the product name — the
  stock SaaS answer, and the single most templated thing in the app. It
  earned nothing and told the cashier nothing.

  It now carries the two things a shop actually needs at a glance and that
  appear nowhere else in the product: the wall clock and the date. Both are
  set in the data face, so they read as numbers rather than as words. The
  brand moved down to the sidebar, where branding belongs.

  Reusing the rental provider's tick means no second interval and no
  extra localStorage write.
*/
function AppShell({ children }) {
  const { now } = useRentals()

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />

      <div className="flex flex-1 flex-col">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-6 py-3 shadow-card">
          <p className="text-sm text-slate-500">Computer Shop Management System</p>

          <div className="flex items-baseline gap-3">
            <time
              dateTime={new Date(now).toISOString()}
              className="font-data text-2xl leading-none font-semibold text-slate-900 tabular-nums"
            >
              {formatWallClock(now)}
            </time>
            <span className="text-xs text-slate-500">{formatDayLabel(now, now)}</span>
          </div>
        </header>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}

export default AppShell
