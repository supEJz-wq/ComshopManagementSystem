import { Navigate, Route, Routes } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import AppShell from './components/AppShell.jsx'
import { AnalyticsSkeleton, LoadingScreen } from './components/skeletons.jsx'
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

/*
  Keep the quiet boot layer through the session check. Once authenticated,
  mount the shell and let each page show its content skeleton while data loads.
  Wait for auth before mounting protected pages or deciding redirects.
*/
function Protected({ adminOnly = false, children }) {
  const { user, isAdmin, loading, error } = useAuth()

  if (loading) return <LoadingScreen />

  // The API is unreachable. Say so instead of silently acting like a signed-out
  // user, which sends the cashier to the login screen for no reason.
  if (error && !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
        <div className="w-full max-w-sm rounded-card border border-state-fault/30 bg-white p-6 text-center shadow-card">
          <h1 className="text-base font-semibold text-slate-900">Cannot reach the server</h1>
          <p className="mt-2 text-sm text-slate-600">{error}</p>
          <p className="mt-3 text-xs text-slate-500">
            Is the API running?{' '}
            <code className="font-data">php -S localhost:8000 router.php</code>
          </p>
        </div>
      </div>
    )
  }

  if (!user || (adminOnly && !isAdmin)) {
    return (
      <>
        <Navigate to={!user ? '/login' : '/'} replace />
        <LoadingScreen />
      </>
    )
  }

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
              <Suspense fallback={<AnalyticsSkeleton />}>
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
