POETRY := poetry
BACKEND := backend
FRONTEND := frontend
NPM := npm

.PHONY: help install format lint test test-cov dev up-build docker-build docker-up docker-down docker-logs docker-restart front-install front-dev front-build front-preview front-lint front-format front-check front-test front-test-e2e front-e2e-install

help:
	@echo "Comandos disponíveis:"
	@echo "  make install       - Instala as dependências"
	@echo "  make format        - Formata o código"
	@echo "  make lint          - Executa o linter"
	@echo "  make test          - Aplica migrations e executa os testes"
	@echo "  make test-cov      - Executa os testes com cobertura resumida"
	@echo "  make dev           - Inicia o servidor de desenvolvimento"
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

install:
	cd $(BACKEND) && $(POETRY) install

format:
	cd $(BACKEND) && $(POETRY) run ruff format .

lint:
	cd $(BACKEND) && $(POETRY) run ruff check .

test:
	cd $(BACKEND) && $(POETRY) run alembic upgrade head && $(POETRY) run pytest -v

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
