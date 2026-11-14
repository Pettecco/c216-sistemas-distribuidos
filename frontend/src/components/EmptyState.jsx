export function EmptyState({ filter, hasTasks }) {
  let message = "Adicione sua primeira tarefa para começar a organizar o dia.";

  if (hasTasks && filter === "pending") {
    message = "Nada pendente. Todas as tarefas desta lista já foram concluídas.";
  } else if (hasTasks && filter === "done") {
    message = "Ainda não há tarefas concluídas. Marque uma para acompanhar o progresso.";
  } else if (hasTasks) {
    message = "Nada por aqui neste filtro. Ajuste o filtro para ver suas tarefas.";
  }

  return (
    <div className="flex flex-col items-center px-6 py-12 text-center sm:py-16">
      <svg viewBox="0 0 180 130" fill="none" aria-hidden="true" className="h-28 w-auto">
        <circle cx="90" cy="65" r="54" fill="#e6efeb" />
        <g transform="rotate(-7 90 65)">
          <rect
            x="48"
            y="30"
            width="80"
            height="72"
            rx="10"
            fill="#eef2ef"
            stroke="#cbd6d0"
            strokeWidth="1.5"
          />
        </g>
        <rect
          x="56"
          y="38"
          width="80"
          height="72"
          rx="10"
          fill="#fcfcf9"
          stroke="#c3d0c8"
          strokeWidth="1.5"
        />
        <path
          d="M72 58h48M72 68h40M72 78h28"
          stroke="#b7c6bd"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <circle cx="130" cy="98" r="16" fill="#1f5c4d" />
        <path
          d="M122.5 98.5l5 5 9-10"
          stroke="#fcfcf9"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <h3 className="mt-5 font-display text-xl leading-tight tracking-tight text-slate-900">
        Nenhuma tarefa por aqui.
      </h3>
      <p className="mt-2 max-w-[22rem] text-sm leading-relaxed text-slate-500">{message}</p>
    </div>
  );
}
