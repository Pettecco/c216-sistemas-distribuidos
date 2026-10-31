import { useState } from "react";

import { EmptyState } from "../components/EmptyState.jsx";
import { StatsBar } from "../components/StatsBar.jsx";
import { TaskFilters } from "../components/TaskFilters.jsx";
import { TaskForm } from "../components/TaskForm.jsx";
import { TaskList } from "../components/TaskList.jsx";
import { addTask, countTasks, filterTasks, removeTask, toggleTask } from "../state/tasks.js";

const todayFormatter = new Intl.DateTimeFormat("pt-BR", {
  weekday: "long",
  day: "2-digit",
  month: "long",
});

export function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("all");

  const counts = countTasks(tasks);
  const visibleTasks = filterTasks(tasks, filter);
  const today = todayFormatter.format(new Date());

  function handleAdd(fields) {
    setTasks((current) => addTask(current, fields));
  }

  function handleToggle(id) {
    setTasks((current) => toggleTask(current, id));
  }

  function handleRemove(id) {
    setTasks((current) => removeTask(current, id));
  }

  return (
    <main className="min-h-screen">
      <div className="mx-auto w-full max-w-6xl px-5 pb-10 pt-6 sm:px-8 sm:pt-8">
        <header className="rise-in">
          <div className="flex items-center justify-between gap-4 border-b border-slate-900/10 pb-5">
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white shadow-[0_10px_20px_-12px_rgba(20,32,43,0.8)]"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  className="size-5"
                >
                  <path d="M6.5 7h10M6.5 12h7M6.5 17h4" />
                  <path d="M16 16.5l1.7 1.7 3-3.2" />
                </svg>
              </span>
              <div>
                <p className="text-[13px] font-bold uppercase tracking-[0.22em] text-slate-900">
                  Tarefas
                </p>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  Organize o dia, uma tarefa por vez.
                </p>
              </div>
            </div>

            <span className="hidden items-center gap-2 rounded-full border border-slate-900/10 bg-white/60 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500 backdrop-blur-sm sm:inline-flex">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-800/60 motion-reduce:animate-none" />
                <span className="relative inline-flex size-1.5 rounded-full bg-emerald-800" />
              </span>
              Somente nesta sessão
            </span>
          </div>

          <div className="flex flex-col gap-7 pt-8 md:flex-row md:items-end md:justify-between">
            <div className="max-w-xl">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-800">
                Painel pessoal
              </p>
              <h1 className="mt-2 text-balance font-display text-[2.6rem] leading-[1.02] tracking-[-0.035em] text-slate-900 sm:text-[3.5rem]">
                Minhas <span className="italic text-emerald-800">tarefas</span>
              </h1>
              <p className="mt-3 max-w-md text-[15px] leading-relaxed text-slate-600">
                Organize o dia. Tudo fica apenas nesta sessão.
              </p>
            </div>

            <div className="hidden shrink-0 border-l border-slate-900/10 pl-7 lg:block">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Hoje
              </p>
              <p className="mt-1 font-display text-lg leading-snug text-slate-900 first-letter:uppercase">
                {today}
              </p>
              <p className="mt-1 text-xs text-slate-500">Dados no navegador</p>
            </div>
          </div>
        </header>

        <div className="mt-8">
          <StatsBar counts={counts} />
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-start lg:gap-6">
          <div className="lg:sticky lg:top-6">
            <div className="rise-in" style={{ animationDelay: "140ms" }}>
              <TaskForm onAdd={handleAdd} />
            </div>
          </div>

          <section
            aria-labelledby="tasks-heading"
            className="panel rise-in"
            style={{ animationDelay: "200ms" }}
          >
            <div className="flex flex-col gap-4 border-b border-slate-900/10 px-4 py-4 sm:px-5 sm:py-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Sua lista
                </p>
                <div className="mt-1 flex items-baseline gap-2.5">
                  <h2
                    id="tasks-heading"
                    className="font-display text-2xl leading-tight tracking-tight text-slate-900"
                  >
                    Lista de tarefas
                  </h2>
                  {counts.total > 0 ? (
                    <span className="text-xs font-medium tabular-nums text-slate-500">
                      {visibleTasks.length} de {counts.total}
                    </span>
                  ) : null}
                </div>
              </div>

              <TaskFilters filter={filter} onChange={setFilter} />
            </div>

            {visibleTasks.length > 0 ? (
              <TaskList tasks={visibleTasks} onToggle={handleToggle} onRemove={handleRemove} />
            ) : (
              <EmptyState filter={filter} hasTasks={counts.total > 0} />
            )}
          </section>
        </div>

        <footer className="mt-8 flex flex-col gap-2 border-t border-slate-900/10 pt-5 text-[11px] text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-1.5">
            <svg
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="size-3"
            >
              <rect x="4.5" y="8.5" width="11" height="7.5" rx="1.5" />
              <path d="M7 8.5V6.8a3 3 0 0 1 6 0v1.7" />
            </svg>
            Nada é enviado a servidores. Ao recarregar, a lista começa vazia.
          </p>
          <p className="font-semibold uppercase tracking-[0.14em] text-slate-500">
            Prática 6 · Estado local
          </p>
        </footer>
      </div>
    </main>
  );
}
