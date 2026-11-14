export function LoadErrorState({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center px-6 py-12 text-center sm:py-16">
      <span
        aria-hidden="true"
        className="flex size-14 items-center justify-center rounded-full border border-red-200 bg-red-50 text-red-700"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="size-7"
        >
          <path d="M12 8v5" />
          <path d="M12 16.5h.01" />
          <path d="M10.3 4.6 2.8 17.5A1.8 1.8 0 0 0 4.4 20h15.2a1.8 1.8 0 0 0 1.6-2.5L13.7 4.6a1.7 1.7 0 0 0-3.4 0Z" />
        </svg>
      </span>

      <h3 className="mt-5 font-display text-xl leading-tight tracking-tight text-slate-900">
        Não foi possível carregar as tarefas.
      </h3>
      <p className="mt-2 max-w-[24rem] text-sm leading-relaxed text-slate-500">{message}</p>

      <button
        type="button"
        onClick={onRetry}
        className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#21303d] active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
      >
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="size-4"
        >
          <path d="M16.5 10a6.5 6.5 0 1 1-1.9-4.6" />
          <path d="M16.5 4.5V8H13" />
        </svg>
        Tentar novamente
      </button>
    </div>
  );
}
