// client/src/context/RentalProvider.jsx
//
// Rentals now come from the API. The provider mirrors the server state and
// exposes the same functions the screens already call (startRental, stopRental,
// extendRental, transferRental, transferTargets, rentalFor).
//
// The 1-second tick still lives here: it drives the countdown display. The
// billing clock is server-side (startedAt), so a refresh cannot change the bill.

import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../api.js';
import { normalizeRental } from '../normalize.js';
import { usePcs } from './pcContext.js';
import { useAuth } from './auth.js';
import { RentalContext } from './rentalContext.js';

const PC_STATUS = {
  FREE: 'free',
  RENTED: 'rented',
  ISSUE: 'issue',
  UNRESPONSIVE: 'unresponsive',
};

export function RentalProvider({ children }) {
  const { refresh: refreshPcs } = usePcs();
  // Wait for the session check before requesting, or every refresh fires a
  // request that is guaranteed to 401.
  const { user, loading: authLoading } = useAuth();
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [now, setNow] = useState(() => Date.now());

  // One interval for the whole app, not one per tile.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const refresh = useCallback(async () => {
    try {
      const data = await api.get('/rentals/active');
      setRentals((data.rentals ?? []).map(normalizeRental));
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

  const startRental = useCallback(
    async (pcId, seconds) => {
      try {
        const data = await api.post('/rentals/start', { pcId, seconds });
        // The API changes the PC status too. Update its shared list before the
        // rental controls appear so the board and Home counts agree immediately.
        await refreshPcs();
        await refresh();
        return { ok: true, rental: data.rental };
      } catch (err) {
        return { ok: false, error: err.message };
      }
    },
    [refresh, refreshPcs],
  );

  const stopRental = useCallback(
    async (pcId) => {
      try {
        const data = await api.post('/rentals/stop', { pcId });
        // Stopping can return a healthy PC to Free; Home must see that change
        // before navigation without needing a full browser reload.
        await refreshPcs();
        await refresh();
        return { rental: data.rental, endedAt: data.rental?.endedAt, bill: data.bill };
      } catch (err) {
        return null;
      }
    },
    [refresh, refreshPcs],
  );

  const extendRental = useCallback(
    async (pcId, seconds) => {
      try {
        const data = await api.post('/rentals/extend', { pcId, seconds });
        await refresh();
        return { ok: true, rental: data.rental };
      } catch (err) {
        return { ok: false, error: err.message };
      }
    },
    [refresh],
  );

  const transferRental = useCallback(
    async (fromPcId, toPcId) => {
      try {
        await api.post('/rentals/transfer', { fromPcId, toPcId });
        await refresh();
        return { ok: true };
      } catch (err) {
        return { ok: false, error: err.message };
      }
    },
    [refresh],
  );

  const transferTargets = useCallback(
    async (fromPcId) => {
      try {
        const data = await api.get(`/rentals/targets?fromPcId=${fromPcId}`);
        return data.targets || [];
      } catch {
        return [];
      }
    },
    [],
  );

  const rentalFor = useCallback(
    (pcId) => rentals.find((r) => r.pcId === pcId) ?? null,
    [rentals],
  );

  const value = useMemo(
    () => ({
      rentals,
      now,
      loading,
      error,
      startRental,
      stopRental,
      extendRental,
      transferRental,
      transferTargets,
      rentalFor,
      refresh,
    }),
    [rentals, now, loading, error, startRental, stopRental, extendRental, transferRental, transferTargets, rentalFor, refresh],
  );

  return <RentalContext.Provider value={value}>{children}</RentalContext.Provider>;
}
