# C216 — Sistemas Distribuídos · Prática 7

Aplicação web full-stack de tarefas. O frontend React deixou de manter os itens apenas em
memória: agora ele consome a API FastAPI, que persiste os dados no PostgreSQL. Os três serviços
sobem em contêineres separados com Docker Compose.

## Arquitetura

```
Navegador (React + Vite)
   │  HTTP (fetch) — origem diferente → CORS explícito
   ▼
API FastAPI (Python)
   │  SQLAlchemy + Alembic
   ▼
PostgreSQL
```

| Camada        | Tecnologias                                                       |
| ------------- | ----------------------------------------------------------------- |
| Frontend      | React 19, Vite 7, Tailwind CSS v4, Biome                          |
| Backend       | FastAPI, SQLAlchemy 2, Alembic, Pydantic                          |
| Banco         | PostgreSQL 16                                                     |
| Qualidade     | Pytest/httpx, Vitest/Testing Library, Playwright (E2E real)       |
| Infraestrutura| Docker, Docker Compose (frontend + backend + banco)               |

## Subir a aplicação

```bash
cp .env-example .env        # ajuste portas/credenciais se precisar
make up-build               # constrói e sobe os três contêineres
```

| Serviço   | URL                     |
| --------- | ----------------------- |
| Frontend  | http://localhost:5173   |
| API       | http://localhost:8080   |
| Postgres  | localhost:5433          |

O backend aplica as migrations automaticamente ao iniciar (`alembic upgrade head`). O Compose
encadeia as dependências: o frontend só sobe com o backend saudável, e o backend só sobe com o
banco saudável.

## Desenvolvimento local

```bash
make install            # dependências do backend (Poetry)
make front-install      # dependências do frontend (npm)
make db-up              # sobe apenas o PostgreSQL
make dev                # API em http://localhost:8080
make front-dev          # frontend em http://localhost:5173
```

## Variáveis de ambiente

| Variável         | Padrão                                              | Uso                                     |
| ---------------- | --------------------------------------------------- | --------------------------------------- |
| `DATABASE_URL`   | `postgresql+psycopg://postgres:postgres@localhost:5433/appdb` | Conexão SQLAlchemy              |
| `CORS_ORIGINS`   | `http://localhost:5173,http://127.0.0.1:5173,...`   | Origens explícitas autorizadas          |
| `VITE_API_URL`   | `http://localhost:8080`                             | URL da API usada pelo bundle do frontend |
| `BACKEND_PORT`   | `8080`                                              | Porta pública da API                    |
| `FRONTEND_PORT`  | `5173`                                              | Porta pública do frontend               |
| `POSTGRES_PORT`  | `5433`                                              | Porta pública do PostgreSQL             |

O CORS nunca usa `*`: as origens são uma lista explícita, configurável por ambiente.

## API

| Método   | Rota          | Descrição                         |
| -------- | ------------- | --------------------------------- |
| `GET`    | `/tasks`      | Lista tarefas (`?done=true/false`)|
| `GET`    | `/tasks/{id}` | Busca uma tarefa                  |
| `POST`   | `/tasks`      | Cria uma tarefa (`201`)           |
| `PUT`    | `/tasks/{id}` | Substitui a tarefa (nome, descrição, done) |
| `DELETE` | `/tasks/{id}` | Remove a tarefa (`204`)           |
| `GET`    | `/health`     | Healthcheck usado pelo Compose    |

O frontend espelha todos esses métodos em `frontend/src/services/tasks.js`.

## Fluxo de uma requisição

1. `TaskForm` valida os campos e chama `onAdd(values)`.
2. `TasksPage` chama `createTask()` → `fetch POST /tasks`.
3. O navegador envia o preflight `OPTIONS`; o `CORSMiddleware` autoriza a origem.
4. A rota valida o payload com o schema Pydantic e chama o service.
5. O repository executa o `INSERT` via SQLAlchemy.
6. O PostgreSQL grava a linha.
7. A rota responde `201` com a tarefa criada.
8. O frontend adiciona a tarefa devolvida pela API à lista.

Falhas de rede, respostas HTTP de erro e sucesso são tratadas em
`frontend/src/services/http.js`, que converte tudo em mensagens exibidas na interface.

## Testes

Um único comando roda a suíte inteira:

```bash
make test
```

Ele sobe o PostgreSQL (`make db-up`) e executa, em ordem:

1. **Backend** — `pytest`, incluindo CRUD real no PostgreSQL e os testes de CORS.
2. **Frontend** — `vitest`, com o módulo de serviços mockado: carregamento, criação,
   conclusão, exclusão, erro de carga, erro de ação e retry.
3. **E2E** — Playwright contra o backend real e o PostgreSQL, incluindo persistência após
   recarregar a página e simulação de API inacessível.

Pré-requisitos: Docker em execução e o Chromium do Playwright instalado
(`make front-e2e-install`). Se a stack do Compose estiver no ar, o E2E usa a porta `8081`
para não conflitar com o backend em `8080`.

## Estrutura

```
backend/
├── app/
│   ├── api/routes/tasks.py        # rotas /tasks
│   ├── api/schemas/task.py        # contratos Pydantic
│   ├── models/task.py             # modelo SQLAlchemy
│   ├── repositories/task.py       # acesso ao banco
│   ├── services/task.py           # regras e 404
│   ├── config.py                  # DATABASE_URL e CORS
│   └── main.py                    # app + CORSMiddleware
├── alembic/                       # migrations
└── tests/                         # unitários, integração e CORS

frontend/
├── src/
│   ├── pages/TasksPage.jsx        # estado da API: loading, erro, ações
│   ├── services/http.js           # fetch + tratamento dos 3 cenários
│   ├── services/tasks.js          # espelho dos endpoints do backend
│   ├── state/tasks.js             # validação, filtro e contagem (puro)
│   └── components/                # formulário, lista, filtros, avisos, skeleton
├── tests/unit/                    # Vitest (serviços e página)
└── tests/e2e/                     # Playwright com API real
```

## Checklist da prática

- [x] Serviço de API por entidade, espelhando todos os endpoints do backend.
- [x] Estado local substituído por chamadas HTTP com loading e mensagens de erro.
- [x] CORS configurado com origem explícita (sem `*`).
- [x] `Dockerfile` do frontend e serviço no Compose com `depends_on`.
- [x] Testes unitários, de integração e E2E atualizados.
- [x] `make test` roda toda a suíte em um único comando.
