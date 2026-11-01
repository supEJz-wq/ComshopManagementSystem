// Auth uses the quiet full-page boot layer. Page data uses content-only,
// static placeholders so the surrounding navigation stays visible and usable.
export function LoadingScreen() {
  return (
    <div className="app-loading" role="status" aria-live="polite" aria-busy="true">
      Loading your workspace…
    </div>
  )
}

function PageSkeleton({ label, children, gap = 'gap-4' }) {
  return (
    <div className={`page-skeleton flex flex-col ${gap}`} role="status" aria-label={`Loading ${label}`} aria-busy="true">
      <span className="sr-only">Loading {label}…</span>
      <div className="contents" aria-hidden="true">{children}</div>
    </div>
  )
}

function Block({ className = '' }) {
  return <div className={`rounded-control bg-slate-200/70 ${className}`} />
}

function Card({ children, className = '', padding = 'p-4' }) {
  return <div className={`rounded-card border border-slate-200 bg-white ${padding} shadow-card ${className}`}>{children}</div>
}

function ListRow({ bill = false }) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Block className="h-5 w-16" />
          <Block className="h-3 w-40 max-w-full" />
          <Block className="h-3 w-28" />
        </div>
        <Block className="h-7 w-24 shrink-0" />
      </div>
      {bill && (
        <>
          <div className="mt-3 border-t border-slate-100 pt-3"><Block className="h-4 w-full" /></div>
          <div className="mt-3 flex flex-wrap items-end gap-2 border-t border-slate-100 pt-3">
            <Block className="h-14 w-32" /><Block className="h-9 w-28" />
          </div>
        </>
      )}
    </Card>
  )
}

export function HomeSkeleton() {
  return (
    <PageSkeleton label="home" gap="gap-6">
      <Card padding="p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-sm font-semibold text-slate-900">Right now</h3>
          <Block className="h-4 w-44 self-center" />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[0, 1, 2, 3].map(key => (
            <div key={key} className="rounded-card border border-slate-200 bg-slate-50 p-3">
              <Block className="h-5 w-16 max-w-full" /><Block className="mt-2 h-[30px] w-8" />
            </div>
          ))}
        </div>
      </Card>
    </PageSkeleton>
  )
}

export function PCsSkeleton({ isAdmin = false }) {
  return (
    <PageSkeleton label="computers">
      <Card className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">PCs</h2>
          <p className="mt-1 text-sm text-slate-600"><span className="inline-block h-3 w-20 rounded bg-slate-200/70" />. Names cannot be changed or removed once added.</p>
        </div>
        <div className="flex flex-col items-start gap-2 sm:items-end">
          <Block className="h-7 w-24" />
          {isAdmin && <Block className="h-9 w-[70px]" />}
        </div>
      </Card>
      <div className="flex flex-wrap gap-2">
        {[64, 80, 64, 120].map((width, key) => <div key={key} style={{ width }}><Block className="h-7" /></div>)}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[0, 1, 2, 3, 4, 5].map(key => (
          <Card key={key} className="border-l-4 border-l-slate-300">
            <Block className="h-6 w-16" />
            <Block className="mt-3 h-7 w-20" />
            <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-3">
              <Block className="h-[26px] w-20" /><Block className="h-[26px] w-20" /><Block className="h-[26px] w-32" />
            </div>
          </Card>
        ))}
      </div>
    </PageSkeleton>
  )
}

export function RentalsSkeleton() {
  return (
    <PageSkeleton label="rentals">
      <Card>
        <h2 className="text-base font-semibold text-slate-900">Active rentals</h2>
        <p className="mt-1 text-sm text-slate-600">Soonest ending first. The timer is the block display; the time used is what Phase 4 bills.</p>
      </Card>
      <div className="flex flex-col gap-3"><ListRow /><ListRow /></div>
    </PageSkeleton>
  )
}

export function PaymentsSkeleton() {
  return (
    <PageSkeleton label="payments">
      <Card>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-base font-semibold text-slate-900">Payments</h2><Block className="h-5 w-64 max-w-full self-center" />
        </div>
        <p className="mt-1 text-sm text-slate-600">Record the cash for a finished rental. A bill can be left unsettled and settled later — the PC is already free either way.</p>
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
          <Block className="h-[26px] w-44" /><Block className="h-[26px] w-40" />
        </div>
      </Card>
      <div className="flex flex-col gap-3"><ListRow bill /><ListRow bill /></div>
    </PageSkeleton>
  )
}

export function RevenueSkeleton({ isAdmin = false }) {
  return (
    <PageSkeleton label="revenue" gap="gap-6">
      <Card padding="p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="text-base font-semibold text-slate-900">Today</h2>
          <Block className={`max-w-full self-center ${isAdmin ? 'h-[34px] w-80' : 'h-4 w-64'}`} />
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { label: 'Collected', note: '0 settled bills · money taken in this period' },
            { label: 'Refunded', note: '0 refunds taken in this period' },
            { label: 'Net', note: 'Collected minus refunds' },
          ].map(({ label, note }) => (
            <Card key={label}>
              <p className="text-xs font-medium text-slate-500">{label}</p>
              <Block className="mt-2 h-[30px] w-24 max-w-full" />
              {/* Invisible copy reserves the same wrapping as the live note. */}
              <div className="mt-2 rounded-control bg-slate-200/70 text-xs text-transparent select-none">{note}</div>
            </Card>
          ))}
        </div>
        <div className="mt-3 rounded-control border border-slate-200 bg-slate-50 px-4 py-3">
          <div className="flex items-baseline justify-between gap-2"><span className="text-sm font-medium text-slate-700">Still owed</span><Block className="h-7 w-24 self-center" /></div>
          <p className="mt-1 text-xs text-slate-500">Unsettled bills from any date. Expected cash, not revenue — it is never added to Collected above.</p>
        </div>
      </Card>
      <div><h3 className="mb-3 text-sm font-semibold text-slate-900">Settled bills</h3><ListRow /></div>
      <div><h3 className="mb-3 text-sm font-semibold text-slate-900">Refunds and adjustments</h3><ListRow /></div>
    </PageSkeleton>
  )
}

export function AnalyticsSkeleton() {
  return (
    <PageSkeleton label="analytics" gap="gap-6">
      <Card padding="p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-base font-semibold text-slate-900">Analytics</h2><Block className="h-9 w-40 self-center" />
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {['Total collected', 'Total refunded', 'Net', 'Best hour'].map(label => (
            <Card key={label}><p className="text-xs font-medium text-slate-500">{label}</p><Block className="mt-2 h-6 w-24 max-w-full" /></Card>
          ))}
        </div>
        <Block className="mt-3 h-4 w-72 max-w-full" />
      </Card>
      {[0, 1, 2].map(key => (
        <Card key={key}><Block className="h-5 w-44" /><div className="mt-3 h-56 rounded-control bg-slate-100" /></Card>
      ))}
    </PageSkeleton>
  )
}
