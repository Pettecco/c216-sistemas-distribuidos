const FILTERS = [
  { id: "all", label: "Todas" },
  { id: "pending", label: "Pendentes" },
  { id: "done", label: "Concluídas" },
];

export function TaskFilters({ filter, onChange }) {
  return (
    <fieldset className="flex w-full min-w-0 items-center gap-1 rounded-full border border-slate-900/10 bg-slate-100/80 p-1 sm:w-auto">
      <legend className="sr-only">Filtrar tarefas</legend>
      {FILTERS.map(({ id, label }) => {
        const active = filter === id;

        return (
          <button
            key={id}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(id)}
            className={[
              "flex-1 whitespace-nowrap rounded-full px-2.5 py-1.5 text-[13px] font-semibold transition-colors sm:flex-none sm:px-3.5",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2",
              active
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:bg-white/60 hover:text-slate-900",
            ].join(" ")}
          >
            {label}
          </button>
        );
      })}
    </fieldset>
  );
}
