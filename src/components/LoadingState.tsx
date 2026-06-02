export function LoadingState() {
  return <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4" aria-label="Loading vocabulary">{Array.from({ length: 8 }).map((_, index) => <div key={index} className="min-h-32 animate-pulse rounded-3xl border-4 border-slate-200 bg-white p-3"><div className="mb-3 h-16 rounded-2xl bg-slate-100" /><div className="mx-auto h-4 w-3/4 rounded bg-slate-100" /></div>)}</div>;
}
