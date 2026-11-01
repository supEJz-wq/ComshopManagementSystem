import { useEffect, useState } from 'react'
import { useRentals } from '../context/rentalContext.js'
import { useTransactions } from '../context/transactionContext.js'
import { PERIODS } from '../data/revenue.js'
import { formatPeso } from '../data/pricing.js'
import { DailyEarnings, MonthlyEarnings, YearlyEarnings, BestHours, ByCashier } from '../components/AnalyticsCharts.jsx'
import { AnalyticsSkeleton } from '../components/skeletons.jsx'
import DataState from '../components/DataState.jsx'

/*
  ANALYTICS — Phase 8, admin only.

  What a café owner actually asks about their day: when is it busiest,
  how the month is running, how the years compare. Three questions, three
  panels, and a strip of headline figures so the answer is legible without
  reading a single axis.

  Every number on this page is the SERVER's. The seven endpoints under
  /api/analytics/* and /api/revenue compute them, and this screen only
  chooses which series to draw and what to call it. It used to recompute all
  of them in the browser, from the same records the server was already
  summarising — the same rule in two places, which is how they eventually
  stop agreeing.
*/

/*
  The owner picks the shape of the year explicitly: "2025", "2026", whatever
  years actually have data. That replaces the abstract "this year" — an owner
  in November asking "how did 2025 go" should not have to switch mental
  filters, and a year that produced no bills simply does not appear.

  The current year is always offered, even if it has nothing collected yet,
  so a slow month never hides the year it belongs to.
*/

function Headline({ label, value }) {
  return (
    <div className="rounded-card border border-slate-200 bg-white p-4 shadow-card">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-2 font-data text-2xl leading-none font-semibold tabular-nums text-slate-900">
        {value}
      </p>
    </div>
  )
}

function Analytics() {
  const { now } = useRentals()
  const { analytics, analyticsLoading, analyticsError, loadAnalytics } = useTransactions()
  const [period, setPeriod] = useState(PERIODS.MONTH)

  /*
    Ask the server for this scope. The scope decides which series comes back,
    so switching it re-asks rather than re-shaping what is already here.
  */
  useEffect(() => {
    loadAnalytics(period);
  }, [period, loadAnalytics]);

  const currentYear = new Date(now).getFullYear()
  const yearTabs = analytics?.years ?? []
  const years = yearTabs.includes(currentYear) ? yearTabs : [...yearTabs, currentYear].sort()

  const SCOPE_TABS = [
    { value: PERIODS.MONTH, label: 'This month' },
    ...years.map((year) => ({ value: year, label: String(year) })),
    { value: PERIODS.ALL, label: 'All time' },
  ]

  const summary = analytics?.summary
  const bestHourSlot = analytics?.bestHour
  const bestMonthSlot = analytics?.bestMonth
  const cashierRows = analytics?.byCashier ?? []

  /*
    An explicit year narrows the monthly series to that year; "This month"
    stays per-day; "All time" collapses to year totals. One control, three
    shapes of answer.
  */
  const earningsData =
    period === PERIODS.MONTH
      ? (analytics?.daily ?? [])
      : period === PERIODS.ALL
        ? (analytics?.yearly ?? [])
        : (analytics?.monthly ?? [])

  /*
    The server sends the best month as a year and a month number. A month is
    only a label once it has a name, and naming it is presentation.
  */
  const bestMonthLabel = bestMonthSlot
    ? new Date(bestMonthSlot.year, bestMonthSlot.month - 1, 1).toLocaleDateString('en-PH', {
        month: 'short',
        year: 'numeric',
      })
    : null

  /*
    A response that belongs to a scope the user has already left is not shown.
    It would be correct data under the wrong heading, which is worse than a
    moment of loading.
  */
  const stale = analytics && analytics.period !== period

  if (analyticsError) return <DataState error={analyticsError} />
  if (!summary || analyticsLoading || stale) return <AnalyticsSkeleton />

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-card border border-slate-200 bg-white p-6 shadow-card">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-base font-semibold text-slate-900">Analytics</h2>
          <label className="flex items-center gap-2 text-xs text-slate-500">
            Range
            <select
              value={String(period)}
              onChange={(event) => {
                const raw = event.target.value
                setPeriod(raw === PERIODS.MONTH || raw === PERIODS.ALL ? raw : Number(raw))
              }}
              className="rounded-control border border-slate-300 bg-white px-2 py-1.5 text-sm font-medium text-slate-900"
            >
              {SCOPE_TABS.map((tab) => (
                <option key={tab.value} value={String(tab.value)}>
                  {tab.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Headline label="Total collected" value={formatPeso(summary.collected)} />
          <Headline label="Total refunded" value={formatPeso(summary.refunded)} />
          <Headline label="Net" value={formatPeso(summary.net)} />
          <Headline
            label="Best hour"
            value={bestHourSlot ? `${bestHourSlot.hour}:00` : '—'}
          />
        </div>

        {bestMonthSlot && (
          <p className="mt-3 text-xs text-slate-500">
            Strongest month on record:{' '}
            <span className="font-medium text-slate-900">{bestMonthLabel}</span> at{' '}
            <span className="font-data tabular-nums text-slate-900">
              {formatPeso(bestMonthSlot.collected)}
            </span>
          </p>
        )}
      </div>

      {/*
        Which earnings chart shows which granularity is driven by scope,
        not by a second selector — the owner thinks in "this month / this
        year / all time", not in "day buckets versus month buckets".
      */}
      {period === PERIODS.MONTH && (
        <>
          <DailyEarnings data={earningsData} />
          <BestHours data={analytics?.hourly ?? []} />
        </>
      )}

      {(period !== PERIODS.MONTH && period !== PERIODS.ALL) && (
        <>
          <MonthlyEarnings data={earningsData} />
          <BestHours data={analytics?.hourly ?? []} />
        </>
      )}

      {period === PERIODS.ALL && <YearlyEarnings data={earningsData} />}

      <ByCashier data={cashierRows} />
    </div>
  )
}

export default Analytics
