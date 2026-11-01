/*
  DataState — the one shared answer to "the API failed?".

  WHY THIS EXISTS. Every provider fetches from the API, and each screen once
  invented its own failure text. This is the one place that knows what to
  say: the screen that would have shown the data says, instead, what failed
  and what to check first — the API server.

  Loading lives in skeletons.jsx: a quiet boot status for auth and static
  content skeletons for page data. Failed requests replace them with this card.

  Usage:

      const { pcs, error } = usePcs()
      ...
      if (error) return <DataState error={error} />
*/

function DataState({ error }) {
  return (
    <div className="rounded-card border border-state-fault/30 bg-surface-fault p-6 shadow-card">
      <h2 className="text-sm font-semibold text-state-fault">
        Could not load this screen
      </h2>
      <p className="mt-1 text-sm text-slate-700">{error}</p>
      <p className="mt-3 text-xs text-slate-500">
        Is the API running?{' '}
        <code className="font-data">php -S localhost:8000 router.php</code>
      </p>
    </div>
  )
}

export default DataState
