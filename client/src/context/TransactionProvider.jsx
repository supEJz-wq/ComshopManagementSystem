// client/src/context/TransactionProvider.jsx
//
// Bills, payments and refunds now come from the API. The provider mirrors
// server state and exposes the same names the screens have always used, so
// Payments.jsx and Refunds.jsx are unchanged.
//
// It also carries the two READ-ONLY VIEWS the server owns: the revenue
// figures for a period, and the analytics series. They live here rather than
// in their own provider because they are the same records read differently,
// and because every API call in this app goes through a provider.
//
// The API's snake_case is translated once, in ../normalize.js.

import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../api.js';
import {
  normalizePayment,
  normalizeRefund,
  normalizeRevenueSummary,
  normalizeRevenueBill,
  normalizeRevenueRefund,
  normalizeDayBuckets,
  normalizeHourBuckets,
  normalizeCashierRows,
  normalizeYearRows,
  normalizeMonthRows,
} from '../normalize.js';
import { useAuth } from './auth.js';
import { TransactionContext } from './transactionContext.js';

export function TransactionProvider({ children }) {
  // Bills are behind a login. Waiting for the session check avoids three
  // guaranteed-401 requests on every refresh.
  const { user, loading: authLoading } = useAuth();

  const [transactions, setTransactions] = useState([]);
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /*
    The revenue view of one period: the figures, the bills settled in it, and
    the refunds taken in it — all decided by the server.

    The screen used to receive every bill and pick the ones inside the period
    itself, which put the period rule in the browser. It does not any more.
  */
  const [revenue, setRevenue] = useState(null);
  const [revenueLoading, setRevenueLoading] = useState(false);
  const [revenueError, setRevenueError] = useState(null);

  /*
    The analytics series for one scope. Admin only — every analytics endpoint
    is behind the admin gate, so a cashier never calls them.
  */
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState(null);

  const refresh = useCallback(async () => {
    try {
      // Both lists are needed together: a bill row shows its refund history and
      // its net amount, so fetching one without the other renders a screen that
      // is half right.
      const [bills, adjustments] = await Promise.all([
        api.get('/payments'),
        api.get('/payments/refunds'),
      ]);

      setTransactions((bills.payments ?? []).map(normalizePayment));
      setRefunds((adjustments.refunds ?? []).map(normalizeRefund));
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

  /*
    Called right after a rental stops.

    The OLD flow created the bill here, on the client. It no longer does: the
    server prices the rental and writes the UNSETTLED bill during /rentals/stop,
    because the price must be decided in exactly one place (Decision 59). So
    this only refreshes, and returns the bill that now exists.

    `bill` is the server's own calculation. It is returned unchanged rather than
    recomputed, so the figure the cashier reads is the figure that was stored.
  */
  const openTransaction = useCallback(async () => {
    await refresh();
    return null;
  }, [refresh]);

  const settle = useCallback(
    async (id, cashReceived) => {
      try {
        await api.post('/payments/settle', { id, cashReceived });
        await refresh();
        return true;
      } catch {
        return false;
      }
    },
    [refresh],
  );

  /*
    A refusal is a normal outcome here, not an exception: the cashier may be
    trying to settle an already-paid bill, or record a PHP0 adjustment. The
    server's message is what the cashier needs to read, so it is handed back
    rather than swallowed.
  */
  const recordRefund = useCallback(
    async ({ transactionId, kind, amount, reason }) => {
      try {
        await api.post('/payments/refund', {
          paymentId: transactionId,
          kind,
          amount,
          reason,
        });
        await refresh();
        return { ok: true };
      } catch (err) {
        return { ok: false, error: err.message };
      }
    },
    [refresh],
  );

  const refundsFor = useCallback(
    (transactionId) => refunds.filter((r) => r.transactionId === transactionId),
    [refunds],
  );

  /*
    THE REVENUE VIEW OF ONE PERIOD.

    One request. The server returns the figures, the bills settled in the
    period and the refunds taken in it, all filtered by the same window — so
    the summary and the list can never describe different periods.

    `period` is the server's own vocabulary: today | month | year | all | <year>.
    The server is the enforcement point for which periods a role may see; a
    Cashier asking for anything else is answered with Today.
  */
  const loadRevenue = useCallback(async (period) => {
    setRevenueLoading(true);

    try {
      const data = await api.get(`/revenue?period=${encodeURIComponent(period)}`);

      setRevenue({
        // The period this data belongs to. The screen compares it with the
        // period selected, so a response that arrives after the user moved on
        // is never shown under the wrong heading.
        period,
        summary: normalizeRevenueSummary(data.revenue ?? {}),
        bills: (data.bills ?? []).map(normalizeRevenueBill),
        refunds: (data.refunds ?? []).map(normalizeRevenueRefund),
      });
      setRevenueError(null);
    } catch (err) {
      setRevenueError(err.message);
    } finally {
      setRevenueLoading(false);
    }
  }, []);

  /*
    THE ANALYTICS SERIES FOR ONE SCOPE.

    The scope decides the shape of the main series, so only the series that
    will actually be drawn is asked for:

      month  -> one bucket per day
      a year -> one bucket per month of that year
      all    -> one bucket per year

    The rest — the headline figures, the best hour, the best month, the hour
    shape, the cashier split, and the year list the scope selector is built
    from — are the same whatever the scope is.

    These are parallel requests because none of them depends on another. Seven
    small queries for an admin screen is a fair price for the server owning
    every number on it.
  */
  const loadAnalytics = useCallback(async (period) => {
    setAnalyticsLoading(true);

    try {
      const query = `?period=${encodeURIComponent(period)}`;

      const series =
        period === 'month'
          ? api.get(`/analytics/collected-by-day${query}`)
          : period === 'all'
            ? Promise.resolve(null)
            : api.get('/analytics/collected-by-month');

      const [summary, bestHour, bestMonth, yearly, hourly, cashier, scopeSeries] =
        await Promise.all([
          api.get(`/revenue${query}`),
          api.get(`/analytics/best-hour${query}`),
          api.get('/analytics/best-month'),
          api.get('/analytics/collected-by-year'),
          api.get(`/analytics/collected-by-hour${query}`),
          api.get(`/analytics/collected-by-cashier${query}`),
          series,
        ]);

      const yearRows = normalizeYearRows(yearly.data);

      setAnalytics({
        // The scope this data belongs to — see the note in loadRevenue.
        period,
        summary: normalizeRevenueSummary(summary.revenue ?? {}),
        bestHour: bestHour.bestHour ?? null,
        bestMonth: bestMonth.bestMonth ?? null,
        daily: normalizeDayBuckets(scopeSeries?.buckets),
        monthly: normalizeMonthRows(scopeSeries?.data, period),
        yearly: yearRows,
        hourly: normalizeHourBuckets(hourly.buckets),
        byCashier: normalizeCashierRows(cashier.data),
        years: yearRows.map((row) => row.year),
      });
      setAnalyticsError(null);
    } catch (err) {
      setAnalyticsError(err.message);
    } finally {
      setAnalyticsLoading(false);
    }
  }, []);

  const unsettled = useMemo(
    () => transactions.filter((t) => !t.settled),
    [transactions],
  );

  const settled = useMemo(
    () => transactions.filter((t) => t.settled),
    [transactions],
  );

  const value = useMemo(
    () => ({
      transactions,
      refunds,
      loading,
      error,
      unsettled,
      settled,
      openTransaction,
      settle,
      recordRefund,
      refundsFor,
      revenue,
      revenueLoading,
      revenueError,
      loadRevenue,
      analytics,
      analyticsLoading,
      analyticsError,
      loadAnalytics,
      refresh,
    }),
    [
      transactions,
      refunds,
      loading,
      error,
      unsettled,
      settled,
      openTransaction,
      settle,
      recordRefund,
      refundsFor,
      revenue,
      revenueLoading,
      revenueError,
      loadRevenue,
      analytics,
      analyticsLoading,
      analyticsError,
      loadAnalytics,
      refresh,
    ],
  );

  return <TransactionContext.Provider value={value}>{children}</TransactionContext.Provider>;
}