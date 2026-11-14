# Frontend — Tarefas (Prática 7)

Interface React que consome a API FastAPI e persiste as tarefas no PostgreSQL. O estado local da
Prática 6 foi substituído por chamadas HTTP reais, com estados de carregamento, erro e retry.

## Stack

| Ferramenta                       | Uso                                       |
| -------------------------------- | ----------------------------------------- |
| React 19 + Vite 7                | SPA em JavaScript (sem TypeScript)        |
| Tailwind CSS v4                  | Estilização via `@tailwindcss/vite`       |
| Biome 2                          | Lint, formatação e organização de imports |
| Vitest + Testing Library + jsdom | Testes unitários e de componente          |
| Playwright                       | Testes end-to-end contra a API real       |

## Estrutura

```
frontend/
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── index.css                   # Tailwind v4 + tokens e animações
│   ├── components/
│   │   ├── TaskForm.jsx            # validação, submit assíncrono e erro da API
│   │   ├── TaskList.jsx / TaskItem.jsx
│   │   ├── TaskFilters.jsx / StatsBar.jsx / StatCard.jsx / EmptyState.jsx
│   │   ├── Notice.jsx              # aviso de erro de uma ação
│   │   ├── LoadErrorState.jsx      # falha ao carregar + tentar novamente
│   │   └── TasksSkeleton.jsx       # estado de carregamento
│   ├── pages/TasksPage.jsx         # carrega da API e orquestra as ações
│   ├── services/
│   │   ├── http.js                 # URL base, JSON e os 3 cenários de resposta
│   │   └── tasks.js                # espelho de todos os endpoints de /tasks
│   └── state/tasks.js              # validação, filtro e contagem (funções puras)
├── tests/
│   ├── unit/
│   │   ├── tasks.test.js           # validação, filtros e contadores
│   │   ├── services.test.js        # cliente HTTP e serviço de tarefas
│   │   └── TasksPage.test.jsx      # loading, CRUD, erros e retry
│   └── e2e/tasks.spec.js           # fluxo real: React → FastAPI → PostgreSQL
├── Dockerfile                      # build multi-stage + nginx
├── nginx.conf                      # fallback do SPA e cache de assets
├── biome.json
├── playwright.config.js
├── vite.config.js
└── package.json
```

## Serviço de API

`src/services/http.js` centraliza:

- URL base em `VITE_API_URL` (padrão `http://localhost:8080`);
- cabeçalhos JSON e serialização do corpo;
- **falha de rede** → mensagem de conexão;
- **resposta HTTP de erro** → usa o `detail` do FastAPI (texto ou lista de validação);
- **sucesso** → devolve o JSON, ou `null` para `204`.

`src/services/tasks.js` espelha o backend:

```js
listTasks({ done, signal }); // GET    /tasks
getTask(id); // GET    /tasks/{id}
createTask({ name, description }); // POST /tasks
replaceTask(id, task); // PUT    /tasks/{id}
deleteTask(id); // DELETE /tasks/{id}
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
npm run test:e2e       # Playwright + backend real
```

Na primeira execução dos testes E2E, instale o navegador:

```bash
npx playwright install chromium
```

## Testes E2E

O Playwright sobe dois servidores:

1. o frontend em `http://127.0.0.1:4173`;
2. o backend real em `http://127.0.0.1:8081`, com `alembic upgrade head` antes do uvicorn.

Por isso o PostgreSQL precisa estar de pé (`make db-up`). A porta `8081` evita conflito com o
backend do Compose em `8080`. Cada teste limpa a tabela pela própria API antes de começar.

Cenários cobertos: carga de tarefas persistidas, criação com persistência após reload, validação
do formulário, conclusão e exclusão com reload, erro de carregamento com retry e erro de criação
com API inacessível preservando os campos.

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
make test               # backend + frontend + E2E
```

## Docker

O `Dockerfile` compila o SPA com `npm ci && npm run build` e serve o resultado com nginx. A URL da
API é injetada no build por `VITE_API_URL`; no Compose ela aponta para `http://localhost:8080`.
O serviço publica a porta `5173` e depende do backend saudável.
