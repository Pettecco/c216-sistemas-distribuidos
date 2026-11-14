import { StatCard } from "./StatCard.jsx";

export function StatsBar({ counts, loading = false }) {
  const { total, pending, done } = counts;
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;
  const display = (value) => (loading ? "—" : value);

  return (
    <section
      aria-label="Resumo das tarefas"
      aria-busy={loading}
      className="panel rise-in"
      style={{ animationDelay: "80ms" }}
    >
      <div className="grid grid-cols-3 divide-x divide-slate-900/10">
        <StatCard
          label="Total"
          value={display(total)}
          testId="stat-total"
          dotClassName="bg-slate-400"
        />
        <StatCard
          label="Pendentes"
          value={display(pending)}
          testId="stat-pending"
          dotClassName="bg-amber-500"
        />
        <StatCard
          label="Concluídas"
          value={display(done)}
          testId="stat-done"
          dotClassName="bg-emerald-800"
        />
      </div>

      <div className="flex items-center gap-3 border-t border-slate-900/10 bg-white/30 px-3 py-3 sm:px-5">
        <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500 sm:tracking-[0.14em]">
          Progresso
        </span>
        <div
          role="progressbar"
          aria-label="Tarefas concluídas"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={loading ? 0 : percent}
          className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-900/10"
        >
          <div
            className="h-full rounded-full bg-emerald-800 transition-[width] duration-500 ease-out"
            style={{ width: `${loading ? 0 : percent}%` }}
          />
        </div>
        <span className="w-8 text-right text-[11px] font-semibold tabular-nums text-slate-600 sm:w-9 sm:text-xs">
          {loading ? "—" : `${percent}%`}
        </span>
      </div>
    </section>
  );
}
