import { Navigate, Route, Routes } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import AppShell from './components/AppShell.jsx'
import { useAuth } from './context/auth.js'
import Accounts from './pages/Accounts.jsx'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import PCs from './pages/PCs.jsx'
import Payments from './pages/Payments.jsx'
import Rentals from './pages/Rentals.jsx'
import Revenue from './pages/Revenue.jsx'

/*
  Analytics (and all of Recharts) is lazy-loaded. Decision 113: it is the
  sole new dependency, but there is no reason it should be downloaded on
  every route — the cashier's Home renders faster because /analytics is the
  only thing that ever pulls it in. Without this, Vite bundled Recharts
  into the shared chunk (685 kB, tripping its size warning).
*/
const Analytics = lazy(() => import('./pages/Analytics.jsx'))

function Protected({ adminOnly = false, children }) {
  const { user, isAdmin } = useAuth()

  if (!user) return <Navigate to="/login" replace />
  if (adminOnly && !isAdmin) return <Navigate to="/" replace />

  return children
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={
          <Protected>
            <AppShell>
              <Home />
            </AppShell>
          </Protected>
        }
      />

      <Route
        path="/pcs"
        element={
          <Protected>
            <AppShell>
              <PCs />
            </AppShell>
          </Protected>
        }
      />

      <Route
        path="/rentals"
        element={
          <Protected>
            <AppShell>
              <Rentals />
            </AppShell>
          </Protected>
        }
      />

      <Route
        path="/payments"
        element={
          <Protected>
            <AppShell>
              <Payments />
            </AppShell>
          </Protected>
        }
      />

      {/*
        Both roles may open this. A Cashier is not refused the screen — they
        are given a narrower one, Today only, with no period selector
        (Decision 110). Hiding the route from them would imply the figure is
        secret, which is not what was decided; Decision 66's whole reason is
        that the one cashier must be able to verify what they personally took.
      */}
      <Route
        path="/revenue"
        element={
          <Protected>
            <AppShell>
              <Revenue />
            </AppShell>
          </Protected>
        }
      />

      <Route
        path="/accounts"
        element={
          <Protected adminOnly>
            <AppShell>
              <Accounts />
            </AppShell>
          </Protected>
        }
      />

      <Route
        path="/analytics"
        element={
          <Protected adminOnly>
            <AppShell>
              <Suspense fallback={<p className="p-6 text-sm text-slate-500">Loading analytics...</p>}>
                <Analytics />
              </Suspense>
            </AppShell>
          </Protected>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
