// client/src/context/PcProvider.jsx
//
// PC list comes from the API. Status changes, repair and registration all go
// through the API. The provider just mirrors server state and exposes the same
// shape the screens already use.

import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../api.js';
import { useAuth } from './auth.js';
import { PcContext } from './pcContext.js';

export function PcProvider({ children }) {
  // The board is behind a login, so wait for the session check before asking
  // for data. Otherwise every refresh fires three requests that are guaranteed
  // to come back 401.
  const { user, loading: authLoading } = useAuth();

  const [pcs, setPcs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    try {
      const data = await api.get('/pcs');
      setPcs(data.pcs ?? []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading || !user) return;
    refresh();
  }, [user, authLoading, refresh]);

  const addPc = useCallback(
    async (rawName) => {
      const name = rawName.trim();
      if (!name) return { ok: false, error: 'Enter a name for the PC.' };
      try {
        const data = await api.post('/pcs', { name });
        await refresh();
        return { ok: true, pc: data.pc };
      } catch (err) {
        return { ok: false, error: err.message };
      }
    },
    [refresh],
  );

  const setStatus = useCallback(
    async (id, nextStatus) => {
      try {
        await api.patch(`/pcs/${id}/status`, { status: nextStatus });
        await refresh();
        return { ok: true };
      } catch (err) {
        return { ok: false, error: err.message };
      }
    },
    [refresh],
  );

  const repairPc = useCallback(
    async (id) => {
      try {
        await api.post('/pcs/repair', { id });
        await refresh();
        return { ok: true };
      } catch (err) {
        return { ok: false, error: err.message };
      }
    },
    [refresh],
  );

  const value = useMemo(
    () => ({ pcs, loading, error, addPc, setStatus, repairPc, refresh }),
    [pcs, loading, error, addPc, setStatus, repairPc, refresh],
  );

  return <PcContext.Provider value={value}>{children}</PcContext.Provider>;
}
