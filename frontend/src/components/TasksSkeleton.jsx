const ROWS = [0, 1, 2];

export function TasksSkeleton() {
  return (
    <div role="status" aria-live="polite" className="px-4 py-4 sm:px-5 sm:py-5">
      <span className="sr-only">Carregando tarefas…</span>
      <ul aria-hidden="true" className="space-y-5">
        {ROWS.map((row) => (
          <li key={row} className="flex items-start gap-3 sm:gap-4">
            <span className="mt-0.5 size-5 shrink-0 animate-pulse rounded-md bg-slate-200 motion-reduce:animate-none" />
            <div className="min-w-0 flex-1 space-y-2">
              <span className="block h-4 w-2/5 animate-pulse rounded bg-slate-200 motion-reduce:animate-none" />
              <span className="block h-3 w-3/5 animate-pulse rounded bg-slate-200/70 motion-reduce:animate-none" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
