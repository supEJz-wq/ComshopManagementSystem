import { useEffect, useMemo, useState } from 'react'
import { DEFAULT_ACCOUNTS } from '../data/accounts.js'
import { AuthContext } from './auth.js'

const ACCOUNTS_KEY = 'cybershopos.accounts'
const SESSION_KEY = 'cybershopos.session'

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

export function AuthProvider({ children }) {
  const [accounts, setAccounts] = useState(() => readJson(ACCOUNTS_KEY, DEFAULT_ACCOUNTS))

  // Validated on load: a stored session only survives if its account still
  // exists and is active. Otherwise it is discarded.
  const [sessionId, setSessionId] = useState(() => {
    const stored = readJson(SESSION_KEY, null)
    if (!stored) return null
    const list = readJson(ACCOUNTS_KEY, DEFAULT_ACCOUNTS)
    const account = list.find((candidate) => candidate.id === stored)
    return account?.active ? stored : null
  })

  const user = useMemo(() => {
    if (!sessionId) return null
    return accounts.find((account) => account.id === sessionId && account.active) ?? null
  }, [accounts, sessionId])

  useEffect(() => {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts))
  }, [accounts])

  useEffect(() => {
    if (sessionId) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionId))
    } else {
      localStorage.removeItem(SESSION_KEY)
    }
  }, [sessionId])

  function login(username, password) {
    const account = accounts.find(
      (candidate) => candidate.username === username.trim().toLowerCase(),
    )

    if (!account) return { ok: false, error: 'No account with that username.' }
    if (!account.active) {
      return {
        ok: false,
        error: 'This account is deactivated. Ask the owner to reactivate it.',
      }
    }
    if (account.password !== password) return { ok: false, error: 'Incorrect password.' }

    setSessionId(account.id)
    return { ok: true }
  }

  function logout() {
    setSessionId(null)
  }

  // Resetting the password signs the Admin out, so the Cashier must sign in
  // personally with the new one. Keeps actions attributed to the Cashier
  // (Business Rule 12).
  function resetCashierPassword(newPassword) {
    setAccounts((prev) =>
      prev.map((account) =>
        account.role === 'cashier' ? { ...account, password: newPassword } : account,
      ),
    )
    setSessionId(null)
  }

  // Deactivating also ends any live session for that account, so
  // reactivating later can never silently restore it.
  function setCashierActive(active) {
    setAccounts((prev) =>
      prev.map((account) => (account.role === 'cashier' ? { ...account, active } : account)),
    )
    if (!active) setSessionId((current) => (current === 'cashier' ? null : current))
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin: user?.role === 'admin',
        cashier: accounts.find((account) => account.role === 'cashier') ?? null,
        login,
        logout,
        resetCashierPassword,
        setCashierActive,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
