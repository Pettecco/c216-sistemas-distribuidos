POETRY := poetry
BACKEND := backend

.PHONY: help install test lint

help:
	@echo "Comandos disponíveis:"
	@echo "  make install  - Instala as dependências"
	@echo "  make test     - Executa os testes"
	@echo "  make lint     - Executa o linter"

install:
	cd $(BACKEND) && $(POETRY) install

test:
	cd $(BACKEND) && $(POETRY) run pytest

lint:
	cd $(BACKEND) && $(POETRY) run ruff check .

dev:
	cd $(BACKEND) && $(POETRY) run uvicorn main:app --reload