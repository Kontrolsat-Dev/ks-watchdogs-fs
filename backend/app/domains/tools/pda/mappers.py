# app/domains/tools/pda/mappers.py
# Mapeadores para o domínio PDA.

from __future__ import annotations
from typing import Any, Optional
from datetime import datetime
import json
from dateutil import parser as dtparser  # se não usares dateutil, cria um parse simples
from app.domains.tools.pda.types import PdaReport


def _parse_dt(val: any) -> Optional[datetime]:
    """
    Converte uma string de data para um objeto datetime.
    Se a string for None, retorna None.
    Se a string for um objeto datetime, retorna o objeto datetime.
    Se a string for uma string, tenta converter para um objeto datetime.
    Se a conversão falhar, retorna None.
    """
    if not val:
        return None
    if isinstance(val, datetime):
        return val
    try:
        return dtparser.parse(str(val))
    except Exception:
        return None
    
def _parse_context(ctx: Any) -> Optional[dict]:
    """
    Converte um contexto JSON para um dicionário.
    Se o contexto for None, retorna None.
    Se o contexto for um dicionário, retorna o dicionário.
    Se o contexto for uma string, tenta converter para um dicionário.
    Se a conversão falhar, retorna um dicionário com o contexto original.
    """
    if not ctx:
        return None
    if isinstance(ctx, dict):
        return ctx
    if isinstance(ctx, str):
        try:
            return json.loads(ctx)
        except Exception:
            return {"raw": ctx}
    return {"raw": ctx}


def raw_row_to_domain(row: dict) -> PdaReport:
    """
    Mapeia uma linha de dados bruto do PDA para um objeto PdaReport.
    """
    return PdaReport(
        id         = str(row.get("id", "")).strip(),
        code       = str(row.get("code", "")).strip(),
        message    = (str(row.get("message", "")).strip()
                      or str(row.get("context_json", "")).strip()),
        context    = _parse_context(row.get("context_json")),
        error_text = str(row.get("error_text", "")).strip(),
        stack_text = str(row.get("stack_text", "")).strip(),
        log_mode   = str(row.get("log_mode", "")).strip(),
        ts_client  = _parse_dt(row.get("ts_client")),
        state      = str(row.get("state", "")).strip(),
        date_add   = _parse_dt(row.get("date_add")),
        date_upd   = _parse_dt(row.get("date_upd")),
    )