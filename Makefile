POETRY := poetry
BACKEND := backend

.PHONY: help install format lint test test-cov dev up-build docker-build docker-up docker-down docker-logs docker-restart

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
