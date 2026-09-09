POETRY := poetry
BACKEND := backend

.PHONY: help install test lint dev docker-build docker-up docker-down docker-logs docker-restart

help:
	@echo "Comandos disponíveis:"
	@echo "  make install       - Instala as dependências"
	@echo "  make test          - Executa os testes"
	@echo "  make lint          - Executa o linter"
	@echo "  make dev           - Inicia o servidor de desenvolvimento"
	@echo "  make docker-build  - Constrói as imagens Docker"
	@echo "  make docker-up     - Inicia os containers em background"
	@echo "  make docker-down   - Para e remove os containers"
	@echo "  make docker-logs   - Exibe os logs dos containers"
	@echo "  make docker-restart - Reinicia os containers"

install:
	cd $(BACKEND) && $(POETRY) install

test:
	cd $(BACKEND) && $(POETRY) run pytest

lint:
	cd $(BACKEND) && $(POETRY) run ruff check .

dev:
	cd $(BACKEND) && $(POETRY) run uvicorn main:app --reload

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