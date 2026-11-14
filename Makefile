POETRY := poetry
BACKEND := backend
FRONTEND := frontend
NPM := npm

.PHONY: help install format lint test test-backend test-frontend test-e2e test-cov db-up dev up-build docker-build docker-up docker-down docker-logs docker-restart front-install front-dev front-build front-preview front-lint front-format front-check front-test front-test-e2e front-e2e-install

help:
	@echo "Comandos disponíveis:"
	@echo "  make install       - Instala as dependências do backend"
	@echo "  make format        - Formata o código do backend"
	@echo "  make lint          - Executa o linter do backend"
	@echo "  make test          - Sobe o banco e roda TODOS os testes (backend, frontend e E2E)"
	@echo "  make test-backend  - Sobe o banco e executa os testes do backend"
	@echo "  make test-frontend - Executa os testes unitários do frontend"
	@echo "  make test-e2e      - Executa os testes end-to-end com backend real"
	@echo "  make test-cov      - Executa os testes do backend com saída detalhada"
	@echo "  make db-up         - Sobe o PostgreSQL e aguarda ficar saudável"
	@echo "  make dev           - Inicia o servidor de desenvolvimento do backend"
	@echo "  make up-build      - Sobe os containers reconstruindo as imagens"
	@echo "  make docker-build  - Constrói as imagens Docker"
	@echo "  make docker-up     - Inicia os containers em background"
	@echo "  make docker-down   - Para e remove os containers"
	@echo "  make docker-logs   - Exibe os logs dos containers"
	@echo "  make docker-restart - Reinicia os containers"
	@echo "  make front-install - Instala as dependências do frontend"
	@echo "  make front-dev     - Inicia o servidor de desenvolvimento do frontend"
	@echo "  make front-build   - Gera o build de produção do frontend"
	@echo "  make front-preview - Serve o build de produção do frontend"
	@echo "  make front-lint    - Executa o linter do frontend"
	@echo "  make front-format  - Formata o código do frontend"
	@echo "  make front-check   - Executa lint e formatação (check) do frontend"
	@echo "  make front-test    - Executa os testes unitários do frontend"
	@echo "  make front-test-e2e - Executa os testes end-to-end do frontend"
	@echo "  make front-e2e-install - Instala o navegador Chromium do Playwright"
	@echo ""
	@echo "O E2E usa um backend próprio na porta 8081, então pode rodar com a stack do Compose no ar."

install:
	cd $(BACKEND) && $(POETRY) install

format:
	cd $(BACKEND) && $(POETRY) run ruff format .

lint:
	cd $(BACKEND) && $(POETRY) run ruff check .

# Sobe o PostgreSQL local usado pelos testes do backend e pelo E2E.
db-up:
	@docker compose up -d db
	@printf "Aguardando o PostgreSQL"
	@for i in $$(seq 1 30); do \
		if docker compose exec -T db pg_isready -U $${POSTGRES_USER:-postgres} -d $${POSTGRES_DB:-appdb} >/dev/null 2>&1; then \
			echo " pronto."; \
			exit 0; \
		fi; \
		printf "."; \
		sleep 1; \
	done; \
	echo " tempo esgotado."; \
	exit 1

test-backend: db-up
	cd $(BACKEND) && $(POETRY) run alembic upgrade head && $(POETRY) run pytest -v

test-frontend:
	cd $(FRONTEND) && $(NPM) run test

test-e2e: db-up
	cd $(FRONTEND) && $(NPM) run test:e2e

# Um único comando roda a suíte inteira, na ordem correta.
test: db-up
	cd $(BACKEND) && $(POETRY) run alembic upgrade head && $(POETRY) run pytest -v
	cd $(FRONTEND) && $(NPM) run test
	cd $(FRONTEND) && $(NPM) run test:e2e

test-cov:
	cd $(BACKEND) && $(POETRY) run pytest -v --tb=short

dev:
	cd $(BACKEND) && $(POETRY) run uvicorn app.main:app --reload --port 8080

up-build:
	docker compose up -d --build

docker-build:
	docker compose build

docker-up:
	docker compose up -d

docker-down:
	docker compose down

docker-logs:
	docker compose logs -f

docker-restart:
	docker compose restart

front-install:
	cd $(FRONTEND) && $(NPM) install

front-dev:
	cd $(FRONTEND) && $(NPM) run dev

front-build:
	cd $(FRONTEND) && $(NPM) run build

front-preview:
	cd $(FRONTEND) && $(NPM) run preview

front-lint:
	cd $(FRONTEND) && $(NPM) run lint

front-format:
	cd $(FRONTEND) && $(NPM) run format

front-check:
	cd $(FRONTEND) && $(NPM) run check

front-test:
	cd $(FRONTEND) && $(NPM) run test

front-test-e2e:
	cd $(FRONTEND) && $(NPM) run test:e2e

front-e2e-install:
	cd $(FRONTEND) && npx playwright install chromium
