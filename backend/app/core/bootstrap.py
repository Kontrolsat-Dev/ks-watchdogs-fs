from __future__ import annotations
from sqlalchemy import text
from sqlalchemy.engine import Engine
from app.models.prestashop import PageSpeedSnapshot as PSS

def ensure_sqlite_indexes(engine: Engine) -> None:
    """
    Cria índices úteis para PageSpeedSnapshot em SQLite (no-ops se já existirem).
    Chama isto no startup da app.
    """
    if engine.dialect.name != "sqlite":
        return

    table = PSS.__table__
    tname = table.name  # nome real da tabela
    col_page = PSS.page_type.key
    col_obs = PSS.observed_at.key
    col_ttfb = PSS.ttfb_ms.key

    stmts = [
        # filtros por (page_type, observed_at)
        f"CREATE INDEX IF NOT EXISTS ix_{tname}_page_obs ON {tname} ({col_page}, {col_obs});",
        # scans por observed_at
        f"CREATE INDEX IF NOT EXISTS ix_{tname}_obs ON {tname} ({col_obs});",
        # percentis/ordenação por ttfb por página
        f"CREATE INDEX IF NOT EXISTS ix_{tname}_page_ttfb ON {tname} ({col_page}, {col_ttfb});",
    ]

    with engine.begin() as conn:
        for s in stmts:
            conn.execute(text(s))
