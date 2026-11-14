export function Notice({ children, onDismiss }) {
  return (
    <div
      role="alert"
      className="mb-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-[13px] leading-5 text-red-800"
    >
      <svg
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        aria-hidden="true"
        className="mt-0.5 size-4 shrink-0"
      >
        <circle cx="10" cy="10" r="7.5" />
        <path d="M10 6.3v4.9" strokeLinecap="round" />
        <path d="M10 13.8h.01" strokeLinecap="round" />
      </svg>
      <p className="min-w-0 flex-1">{children}</p>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Fechar aviso"
        className="-mr-1 -mt-1 inline-flex size-6 shrink-0 items-center justify-center rounded-md text-red-700 transition-colors hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-1"
      >
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          aria-hidden="true"
          className="size-3.5"
        >
          <path d="M6 6l8 8M14 6l-8 8" />
        </svg>
      </button>
    </div>
  );
}
