import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/auth.js'

function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    const result = login(username, password)
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

        <div className="mt-6 rounded-control border border-dashed border-slate-300 bg-slate-50 p-3">
          <p className="text-xs font-medium text-slate-600">
            Demo accounts — Phase 1 only
          </p>
          <dl className="mt-2 space-y-1 font-data text-xs text-slate-700">
            <div className="flex gap-2">
              <dt className="w-16 shrink-0 text-slate-500">Admin</dt>
              <dd className="select-all">admin / admin123</dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-16 shrink-0 text-slate-500">Cashier</dt>
              <dd className="select-all">cashier / cashier123</dd>
            </div>
          </dl>
          <p className="mt-2 text-xs text-slate-500">
            Click a line to select it, then copy. This notice is removed in
            Phase 11.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
