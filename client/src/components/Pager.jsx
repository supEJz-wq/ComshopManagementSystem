/*
  Shared pagination stepper, used by both Revenue and Payments.

  One component, one page size — the screen makes no sense if Revenue and
  Payments paginate differently.

  Numbered pages, not "load more": this is an accounting view and a page a
  cashier eyeballed five minutes ago should still be the page they look at
  when they come back.

  Both callers reset their page to 1 whenever the filter key changes
  (period on Revenue, view/search on Payments) — otherwise switching from
  "All time" to "Today" strands the list on a page that does not exist.
*/

export const PAGE_SIZE = 10

function Pager({ page, pageCount, onPage }) {
  if (pageCount <= 1) return null

  const prev = page > 1
  const next = page < pageCount

  return (
    <div className="mt-3 flex items-center justify-between text-sm">
      <button
        type="button"
        onClick={() => onPage(page - 1)}
        disabled={!prev}
        className="rounded-control border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
      >
        ← Prev
      </button>
      <p className="font-data tabular-nums text-slate-500">
        Page {page} of {pageCount}
      </p>
      <button
        type="button"
        onClick={() => onPage(page + 1)}
        disabled={!next}
        className="rounded-control border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40"
      >
        Next →
      </button>
    </div>
  )
}

export default Pager
