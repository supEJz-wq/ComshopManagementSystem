// client/src/context/AuthProvider.jsx
//
// Session state mirrors the server. On mount we ask /api/auth/me; if the
// cookie is valid we are signed in, otherwise we are not. Login, logout,
// password reset and deactivation all go through the API.

import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../api.js';
import { AuthContext } from './auth.js';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [cashier, setCashier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /*
    The Cashier account, for the Admin's Accounts screen.

    It is not the signed-in user, so /auth/me cannot answer it, and it is a
    separate endpoint because only an Admin may read it. When the signed-in
    user is not an Admin the request is simply not made — the screen that uses
    this is admin-only, so there is nothing to fetch.
  */
  const refreshCashier = useCallback(async (isAdmin) => {
    if (!isAdmin) {
      setCashier(null);
      return;
    }

    try {
      const data = await api.get('/auth/cashier');
      setCashier(data.cashier);
    } catch {
      setCashier(null);
    }
  }, []);

  // Ask the server who is signed in. This is the single source of truth.
  const refresh = useCallback(async () => {
    try {
      const data = await api.get('/auth/me');
      setUser(data.user || null);
      setError(null);
      await refreshCashier(data.user?.role === 'Admin');
    } catch (err) {
      // 401 means "not signed in", which is normal, not an error.
      setUser(null);
      setCashier(null);
      if (!err.message.includes('Not signed in')) {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [refreshCashier]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(async (username, password) => {
    try {
      const data = await api.post('/auth/login', { username, password });
      setUser(data.user);
      await refreshCashier(data.user?.role === 'Admin');
      setError(null);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  }, [refreshCashier]);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Even if the call fails, clear local state.
    }
    setUser(null);
    setCashier(null);
  }, []);

  const resetCashierPassword = useCallback(
    async (newPassword) => {
      await api.post('/auth/reset-password', { newPassword });
      // The server signs the admin out. Mirror that locally.
      setUser(null);
      setCashier(null);
    },
    [],
  );

  const setCashierActive = useCallback(
    async (active) => {
      const data = await api.post('/auth/deactivate', { active });
      // The server returns the updated state; trust it rather than assuming.
      setCashier((current) => (current ? { ...current, active: data.active } : current));

      if (!active && user?.role === 'cashier') {
        setUser(null);
      }
    },
    [user],
  );

  const value = useMemo(
    () => ({
      user,
      cashier,
      loading,
      error,
      isAdmin: user?.role === 'Admin',
      login,
      logout,
      resetCashierPassword,
      setCashierActive,
      refresh,
    }),
    [
      user,
      cashier,
      loading,
      error,
      login,
      logout,
      resetCashierPassword,
      setCashierActive,
      refresh,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
