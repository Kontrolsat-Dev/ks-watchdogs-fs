from __future__ import annotations

from contextlib import contextmanager
from typing import Iterable, Optional

from sqlalchemy.engine import Engine
from sqlalchemy import text

from app.models.prestashop import PageSpeedSnapshot as PSS
from app.core.config import settings

@contextmanager
def _begin(engine: Engine):
    with engine.begin() as conn:
        yield conn

def _table_exists(conn, name: str) -> bool:
    res = conn.execute(
        text("SELECT name FROM sqlite_master WHERE type='table' AND name = :n"),
        {"n": name},
    ).scalar()
    return res is not None

def init_sqlite_pragmas(engine: Engine) -> None:
    """PRAGMAs seguros para leitura intensiva na SQLite."""
    with _begin(engine) as conn:
        conn.execute(text("PRAGMA journal_mode=WAL;"))
        conn.execute(text("PRAGMA synchronous=NORMAL;"))
        conn.execute(text("PRAGMA temp_store=MEMORY;"))
        # ~64MB de cache (negativo = KB * -1)
        conn.execute(text("PRAGMA cache_size=-65536;"))

def _ensure_pagespeed_indexes(conn) -> None:
    tbl = getattr(PSS, "__tablename__", "prestashop_pagespeed_snapshots")
    # (page_type, observed_at) suporta filtros por tipo e janela recente
    conn.execute(text(f"""
        CREATE INDEX IF NOT EXISTS ix_{tbl}_ptype_obs
        ON {tbl} (page_type, observed_at);
    """))
    # só observed_at ajuda em janelas recentes e scans ordenados
    conn.execute(text(f"""
        CREATE INDEX IF NOT EXISTS ix_{tbl}_obs
        ON {tbl} (observed_at);
    """))
    # por tipo (para last_status rápido)
    conn.execute(text(f"""
        CREATE INDEX IF NOT EXISTS ix_{tbl}_ptype
        ON {tbl} (page_type);
    """))

def _ensure_runs_indexes(conn, table_name: str) -> None:
    """
    Índices para acelerar:
      - listagem recente (ORDER BY created_at DESC LIMIT N)
      - 'último por check_name' (dedupe em app; índice composto ajuda)
      - eventuais filtros por status
    """
    # 1) (check_name, created_at) – ótimo para “último de cada check” e scans por nome
    conn.execute(text(f"""
        CREATE INDEX IF NOT EXISTS ix_{table_name}_check_created
        ON {table_name} (check_name, created_at);
    """))
    # 2) (created_at) – ótimo para 'recentes' com LIMIT
    conn.execute(text(f"""
        CREATE INDEX IF NOT EXISTS ix_{table_name}_created
        ON {table_name} (created_at);
    """))
    # 3) (status, created_at) – útil se por vezes filtras por status
    conn.execute(text(f"""
        CREATE INDEX IF NOT EXISTS ix_{table_name}_status_created
        ON {table_name} (status, created_at);
    """))

def _first_existing_table(conn, candidates: Iterable[str]) -> Optional[str]:
    for name in candidates:
        if not name:
            continue
        if _table_exists(conn, name):
            return name
    return None

def ensure_indexes(engine: Engine) -> None:
    """Cria índices idempotentes para PageSpeed e Runs/Checks."""
    with _begin(engine) as conn:
        # ---- PageSpeed ----
        _ensure_pagespeed_indexes(conn)

        # ---- Runs / Checks ----
        # Ordem de candidatos: setting explícito → nomes comuns
        candidates = [
            getattr(settings, "RUNS_TABLE_NAME", None),
            "watchdogs_runs",
            "system_runs",
            "runs",
        ]
        runs_table = _first_existing_table(conn, candidates)
        if runs_table:
            _ensure_runs_indexes(conn, runs_table)
        else:
            # opcional: registar aviso leve; não falhar arranque
            # print("[bootstrap] Aviso: tabela de runs/checks não encontrada.")
            pass

def bootstrap_database(engine: Engine) -> None:
    """Invocado no arranque da app."""
    if engine.dialect.name == "sqlite":
        init_sqlite_pragmas(engine)
        ensure_indexes(engine)
