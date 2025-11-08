from __future__ import annotations

from contextlib import contextmanager
from sqlalchemy.engine import Engine
from sqlalchemy import text

from app.models.prestashop import PageSpeedSnapshot as PSS

@contextmanager
def _begin(engine: Engine):
    with engine.begin() as conn:
        yield conn

def init_sqlite_pragmas(engine: Engine) -> None:
    """PRAGMAs seguros para API com leitura intensiva."""
    with _begin(engine) as conn:
        conn.execute(text("PRAGMA journal_mode=WAL;"))
        conn.execute(text("PRAGMA synchronous=NORMAL;"))
        conn.execute(text("PRAGMA temp_store=MEMORY;"))
        # ~64MB de cache (negativo = KB * -1 em SQLite)
        conn.execute(text("PRAGMA cache_size=-65536;"))

def ensure_indexes(engine: Engine) -> None:
    """Cria índices idempotentes. Foca PSS (PageSpeed)."""
    tbl = getattr(PSS, "__tablename__", "prestashop_pagespeed_snapshots")
    with _begin(engine) as conn:
        # índice composto por (page_type, observed_at)
        conn.execute(text(f"""
            CREATE INDEX IF NOT EXISTS ix_{tbl}_ptype_obs
            ON {tbl} (page_type, observed_at);
        """))
        # por observed_at (para filtros por janela)
        conn.execute(text(f"""
            CREATE INDEX IF NOT EXISTS ix_{tbl}_obs
            ON {tbl} (observed_at);
        """))
        # por page_type (para last_status rápido)
        conn.execute(text(f"""
            CREATE INDEX IF NOT EXISTS ix_{tbl}_ptype
            ON {tbl} (page_type);
        """))

def bootstrap_database(engine: Engine) -> None:
    """Invocado no arranque da app."""
    # só aplica PRAGMAs na SQLite
    if engine.dialect.name == "sqlite":
        init_sqlite_pragmas(engine)
        ensure_indexes(engine)
