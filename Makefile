VENV        ?= .venv
UVICORN     ?= $(VENV)/Scripts/uvicorn.exe
PIP         ?= $(VENV)/Scripts/pip.exe

APP         ?= main:app
HOST        ?= 127.0.0.1
PORT        ?= 8000
LOG_LEVEL   ?= info

.PHONY: dev install

## Instala dependências
install:
	"$(PIP)" install -r requirements.txt

## Arranca o servidor em modo dev (reload)
dev:
	"$(UVICORN)" $(APP) --host $(HOST) --port $(PORT) --reload --log-level $(LOG_LEVEL)
