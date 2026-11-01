import { useState } from 'react'
import { useAuth } from '../context/auth.js'

function Accounts() {
  const { cashier, resetCashierPassword, setCashierActive } = useAuth()
  const [resetting, setResetting] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [error, setError] = useState('')

  if (!cashier) return null

async function handleReset(event) {
      event.preventDefault()
      if (newPassword.length < 4) {
        setError('Use at least 4 characters.')
        return
      }
      // Async since Phase 11: the password is hashed and stored by the server.
      try {
        await resetCashierPassword(newPassword)
      } catch (err) {
        setError(err.message)
      }
    }

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-card border border-slate-200 bg-white p-6 shadow-card">
        <h2 className="text-base font-semibold text-slate-900">Accounts</h2>
        <p className="mt-1 text-sm text-slate-600">
          The shop has one cashier. There is no signup and no self-registration.
        </p>
      </div>

      <div className="rounded-card border border-slate-200 bg-white p-6 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-medium text-slate-900">{cashier.username}</p>
            <p className="text-sm text-slate-500">Cashier</p>
          </div>
          <span
            className={[
              'rounded-control px-2 py-1 text-xs font-medium',
              cashier.active
                ? 'bg-surface-free text-state-free'
                : 'bg-surface-fault text-state-fault',
            ].join(' ')}
          >
            {cashier.active ? 'Active' : 'Deactivated'}
          </span>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              setResetting((value) => !value)
              setError('')
              setNewPassword('')
            }}
            className="rounded-control border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Reset password
          </button>

          <button
            type="button"
            onClick={async () => {
            try {
              await setCashierActive(!cashier.active)
            } catch (err) {
              setError(err.message)
            }
          }}
            className={[
              'rounded-control px-3 py-2 text-sm font-medium',
              /*
                Was `bg-state-free` — green, which on the board means the
                machine is free. Reactivating a cashier is not a free PC, and
                the same green already appears on an "Active" badge directly
                above, so it was saying the same thing twice while competing
                with the board for the colour's meaning. One treatment for
                both states of the same toggle.
              */
              'border border-slate-300 text-slate-700 hover:bg-slate-50',
            ].join(' ')}
          >
            {cashier.active ? 'Deactivate' : 'Reactivate'}
          </button>
        </div>

        {cashier.active && (
          <p className="mt-4 text-xs text-slate-500">
            Accounts cannot be permanently deleted.
          </p>
        )}
      </div>

      {resetting && (
        <div className="rounded-card border border-slate-200 bg-white p-6 shadow-card">
          <h3 className="text-sm font-semibold text-slate-900">New cashier password</h3>
          <p className="mt-1 text-sm text-slate-600">
            Write this down and give it to the cashier. You will be signed out
            afterwards so the cashier signs in personally.
          </p>

          <form onSubmit={handleReset} className="mt-4 flex flex-col gap-4">
            <div>
              <label htmlFor="new-password" className="block text-sm font-medium text-slate-700">
                New password
              </label>
              <input
                id="new-password"
                type="text"
                autoComplete="off"
                value={newPassword}
                onChange={(event) => {
                  setNewPassword(event.target.value)
                  setError('')
                }}
                className="mt-1 w-full max-w-xs rounded-control border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500"
              />
            </div>

            {error && (
              <p role="alert" className="text-sm text-state-fault">
                {error}
              </p>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                className="rounded-control bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700"
              >
                Save and sign me out
              </button>
              <button
                type="button"
                onClick={() => setResetting(false)}
                className="rounded-control border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}

export default Accounts
