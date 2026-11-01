import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/auth.js'
import { LoadingScreen } from '../components/skeletons.jsx'

function Login() {
  const { login, user, loading } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  /*
    Already signed in? There is nothing to log in to. This also catches the
    case where a signed-in user lands on /login by typing the URL or by
    hitting Back after a logout that is still in flight.
  */
  if (loading) return <LoadingScreen />

  if (user) {
    return (
      <>
        <Navigate to="/" replace />
        <LoadingScreen />
      </>
    )
  }

  async function handleSubmit(event) {
    event.preventDefault()

    // login() is async: it calls the API and waits for the session cookie.
    // Without the await, `result` is a Promise, `result.ok` is undefined, and
    // every sign-in silently falls into the error branch.
    const result = await login(username, password)

    if (result.ok) {
      navigate('/', { replace: true })
    } else {
      setError(result.error)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <div className="w-full max-w-sm rounded-card border border-slate-200 bg-white p-6 shadow-card">
        <p className="text-xs tracking-wide text-slate-500 uppercase">
          Computer Shop Management System
        </p>
        <h1 className="mt-1 text-lg font-semibold text-slate-900">CyberShopOS</h1>
        <p className="mt-4 text-sm text-slate-600">Sign in to continue.</p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-slate-700">
              Username
            </label>
            <input
              id="username"
              name="username"
              autoComplete="username"
              value={username}
              onChange={(event) => {
                setUsername(event.target.value)
                setError('')
              }}
              className="mt-1 w-full rounded-control border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value)
                setError('')
              }}
              className="mt-1 w-full rounded-control border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500"
            />
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-control border border-state-fault/30 bg-surface-fault px-3 py-2 text-sm text-state-fault"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            className="rounded-control bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            Sign in
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login
