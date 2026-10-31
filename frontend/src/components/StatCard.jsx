export function StatCard({ label, value, testId, dotClassName }) {
  return (
    <div className="px-2.5 py-4 sm:px-5 sm:py-5">
      <div className="flex items-center gap-1 sm:gap-1.5">
        <span
          aria-hidden="true"
          className={`size-1 shrink-0 rounded-full sm:size-1.5 ${dotClassName}`}
        />
        <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500 sm:text-[11px] sm:tracking-[0.12em]">
          {label}
        </span>
      </div>
      <span
        data-testid={testId}
        className="mt-2 block font-display text-[1.75rem] leading-none tracking-tight text-slate-900 tabular-nums sm:text-4xl"
      >
        {value}
      </span>
    </div>
  );
}
