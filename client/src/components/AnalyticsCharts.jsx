import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

/*
  The only place charts are rendered. Every series here is produced by a
  pure helper in src/data/revenue.js — the chart draws what the module
  decided, it never recomputes.

  Two colours, deliberately: slate-900 for collected (the primary money
  colour, same as the Start/Stop button), and the approved fault tint for
  refunds. A third colour would invite a cashier to ask what it means.
*/

const money = (value) => `₱${Number(value).toLocaleString('en-PH')}`

function ChartShell({ title, children }) {
  return (
    <div className="rounded-card border border-slate-200 bg-white p-4 shadow-card">
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      <div className="mt-3 h-56">
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function SharedAxis() {
  return <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
}

function SharedTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null

  return (
    <div className="rounded-control border border-slate-200 bg-white px-3 py-2 text-xs shadow-card">
      <p className="font-medium text-slate-900">{payload[0].payload.label ?? label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className="font-data tabular-nums text-slate-600">
          {entry.name}: {money(entry.value)}
        </p>
      ))}
    </div>
  )
}

/*
  Collected (slate-900) per day of the month. Refunded overlays in red so
  you can see days refunds were taken without a separate chart.
*/
export function DailyEarnings({ data }) {
  return (
    <ChartShell title="Collected per day">
      <BarChart data={data} margin={{ top: 0, right: 0, left: -12, bottom: 0 }}>
        <SharedAxis />
        <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="#94a3b8" />
        <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" tickFormatter={money} width={60} />
        <Tooltip content={<SharedTooltip />} />
        <Bar dataKey="collected" name="Collected" fill="#0f172a" radius={[3, 3, 0, 0]} />
        <Bar dataKey="refunded" name="Refunded" fill="#dc2626" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ChartShell>
  )
}

/*
  Each month of the active year, collected only. Twelve columns make the
  shape readable: quiet months and the season in between.
*/
export function MonthlyEarnings({ data }) {
  return (
    <ChartShell title="Collected per month">
      <BarChart data={data} margin={{ top: 0, right: 0, left: -12, bottom: 0 }}>
        <SharedAxis />
        <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="#94a3b8" />
        <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" tickFormatter={money} width={60} />
        <Tooltip content={<SharedTooltip />} />
        <Bar dataKey="collected" name="Collected" fill="#0f172a" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ChartShell>
  )
}

/*
  One bar per calendar year across all time. The owner's year-over-year
  read: grew, held, or shrank.
*/
export function YearlyEarnings({ data }) {
  return (
    <ChartShell title="Collected per year">
      <BarChart data={data} margin={{ top: 0, right: 0, left: -12, bottom: 0 }}>
        <SharedAxis />
        <XAxis dataKey="year" tick={{ fontSize: 11 }} stroke="#94a3b8" />
        <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" tickFormatter={money} width={60} />
        <Tooltip content={<SharedTooltip />} />
        <Bar dataKey="collected" name="Collected" fill="#0f172a" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ChartShell>
  )
}

/*
  How money lands across the day. Zero-height hours show when the shop is
  quiet; the tallest bar is the answer to "when should I staff up?".
*/
export function BestHours({ data }) {
  return (
    <ChartShell title="Collected by hour of day">
      <BarChart data={data} margin={{ top: 0, right: 0, left: -12, bottom: 0 }}>
        <SharedAxis />
        <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="#94a3b8" />
        <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" tickFormatter={money} width={60} />
        <Tooltip content={<SharedTooltip />} />
        <Bar dataKey="collected" name="Collected" fill="#0f172a" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ChartShell>
  )
}

export function ByCashier({ data }) {
  return (
    <ChartShell title="Collected per cashier">
      <BarChart data={data} margin={{ top: 0, right: 0, left: -12, bottom: 0 }}>
        <SharedAxis />
        <XAxis dataKey="cashier" tick={{ fontSize: 11 }} stroke="#94a3b8" />
        <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" tickFormatter={money} width={60} />
        <Tooltip content={<SharedTooltip />} />
        <Bar dataKey="collected" name="Collected" fill="#0f172a" radius={[3, 3, 0, 0]} />
        <Bar dataKey="refunded" name="Refunded" fill="#dc2626" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ChartShell>
  )
}
