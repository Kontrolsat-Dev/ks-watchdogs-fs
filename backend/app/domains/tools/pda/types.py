# app/domains/tools/pda/types.py
# Tipos para o domínio PDA.

from __future__ import annotations
from dataclasses import dataclass
from typing import Optional, Any
from datetime import datetime


@dataclass(slots=True)
class PdaReport:
    """
    Tipo para um relatório PDA.
    """
    id: str
    code: str
    message: str
    context: Optional[dict[str, Any]]
    error_text: str
    stack_text: str
    log_mode: str
    ts_client: Optional[datetime]
    state: str
    date_added: Optional[datetime]
    date_updated: Optional[datetime]