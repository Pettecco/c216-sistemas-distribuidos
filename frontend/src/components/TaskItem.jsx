export function TaskItem({ task, busy = false, onToggle, onRemove }) {
  const { name, description, done } = task;

  return (
    <li
      aria-busy={busy || undefined}
      className="group flex items-start gap-3 px-4 py-4 transition-colors hover:bg-white/60 sm:gap-4 sm:px-5"
    >
      <label className="relative mt-0.5 flex size-5 shrink-0 cursor-pointer items-center justify-center">
        <input
          type="checkbox"
          checked={done}
          onChange={() => onToggle(task)}
          disabled={busy}
          aria-label={`Marcar ${name} como concluída`}
          className="peer absolute inset-0 size-full cursor-pointer opacity-0 disabled:cursor-wait"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none flex size-5 items-center justify-center rounded-md border border-slate-400 bg-white text-transparent shadow-[inset_0_1px_1px_rgba(15,23,42,0.04)] transition peer-checked:border-emerald-800 peer-checked:bg-emerald-800 peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-emerald-600 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-white"
        >
          <svg
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="size-3.5"
          >
            <path d="M4.8 10.4l3.3 3.3 7.1-7.4" />
          </svg>
        </span>
      </label>

      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
          <p
            className={`min-w-0 break-words text-[15px] leading-6 [overflow-wrap:anywhere] ${
              done
                ? "text-slate-500 line-through decoration-slate-400/70"
                : "font-semibold text-slate-900"
            }`}
          >
            {name}
          </p>
          {done ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-emerald-800">
              <svg
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className="size-2.5"
              >
                <path d="M4.8 10.4l3.3 3.3 7.1-7.4" />
              </svg>
              Concluída
            </span>
          ) : null}
        </div>

        {description ? (
          <p className="mt-1 whitespace-pre-line break-words text-sm leading-relaxed text-slate-500 [overflow-wrap:anywhere]">
            {description}
          </p>
        ) : null}
      </div>

      <button
        type="button"
        onClick={() => onRemove(task)}
        disabled={busy}
        aria-label={`Excluir ${name}`}
        title="Excluir tarefa"
        className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-wait disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-slate-500"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="size-4"
        >
          <path d="M4 7h16" />
          <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
          <path d="M6.5 7l.8 12a1 1 0 0 0 1 .9h7.4a1 1 0 0 0 1-.9l.8-12" />
          <path d="M10 11v5M14 11v5" />
        </svg>
      </button>
    </li>
  );
}
