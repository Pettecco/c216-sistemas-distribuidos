# Frontend — Tarefas

Interface da Prática 6: cadastro e acompanhamento de tarefas usando **apenas estado local**
(`useState`). Não há chamadas ao backend, persistência em banco ou `localStorage` — ao recarregar
a página, a lista começa vazia.

## Stack

| Ferramenta                       | Uso                                       |
| -------------------------------- | ----------------------------------------- |
| React 19 + Vite 7                | SPA em JavaScript (sem TypeScript)        |
| Tailwind CSS v4                  | Estilização via `@tailwindcss/vite`       |
| Biome 2                          | Lint, formatação e organização de imports |
| Vitest + Testing Library + jsdom | Testes unitários e de componente          |
| Playwright                       | Testes end-to-end                         |

## Estrutura

```
frontend/
├── index.html
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── index.css              # Tailwind v4 (@import "tailwindcss") + tokens e animações
│   ├── components/            # TaskForm, TaskFilters, TaskList, TaskItem, StatsBar, StatCard, EmptyState
│   ├── pages/TasksPage.jsx    # dono do estado local (lista + filtro)
│   └── state/tasks.js         # funções puras: validateTask, addTask, toggleTask, removeTask, filterTasks, countTasks
├── tests/
│   ├── setup.js               # jest-dom + cleanup do Testing Library
│   ├── unit/
│   │   ├── tasks.test.js      # regras de validação e operações de estado
│   │   └── TasksPage.test.jsx # interação com formulário, filtros, contadores e exclusão
│   └── e2e/tasks.spec.js      # jornada completa no navegador
├── biome.json
├── playwright.config.js
├── vite.config.js
└── package.json
```

## Instalação e scripts

```bash
npm install            # dependências
npm run dev            # servidor de desenvolvimento
npm run build          # build de produção em dist/
npm run preview        # serve o build
npm run lint           # biome lint .
npm run format         # biome format --write .
npm run check          # biome check . (lint + formatação + imports)
npm run test           # Vitest (execução única)
npm run test:watch     # Vitest em watch
npm run test:e2e       # Playwright
```

Na primeira execução dos testes E2E, instale o navegador:

```bash
npx playwright install chromium
```

## Atalhos na raiz do repositório

```bash
make front-install      # npm install
make front-dev          # servidor de desenvolvimento
make front-build        # build de produção
make front-preview      # serve o build
make front-lint         # lint
make front-format       # formatação
make front-check        # lint + formatação
make front-test         # testes unitários
make front-e2e-install  # instala o Chromium do Playwright
make front-test-e2e     # testes end-to-end
```

## CI

`.github/workflows/frontend-ci.yml` roda em pushes para `main`, `aulas` e `pratica-*` (e em pull
requests para `main`/`aulas`) quando há mudanças em `frontend/**`:

1. **Linter e Formatação** — `npm ci` e `npx biome ci .`.
2. **Testes** — `needs: [lint]`, instala o Chromium, roda `npm run test` e `npm run test:e2e`;
   publica o relatório do Playwright como artefato em caso de falha.

## Regras de domínio

- `name`: obrigatório, máximo de 120 caracteres (após `trim`).
- `description`: opcional, máximo de 500 caracteres.
- Tarefas novas entram no topo da lista, com `done: false`.
- Filtros: todas, pendentes e concluídas; os contadores refletem o estado imediatamente.
