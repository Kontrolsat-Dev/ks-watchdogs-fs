from __future__ import annotations
from typing import List
import json
from app.domains.tools.pda.mappers import raw_row_to_domain
from app.external.pda_client import PdaClient
from app.schemas.tools import Report
from app.schemas.common import Page, PageMeta

def _paginate(items: List, page: int, page_size: int):
    total = len(items)
    start = (page - 1) * page_size
    end = start + page_size
    slice_ = items[start:end]
    has_prev = page > 1
    has_next = end < total
    return slice_, total, has_prev, has_next

def _json_dumps_safe(obj) -> str:
    try:
        return json.dumps(obj, ensure_ascii=False, separators=(",", ":"))
    except Exception:
        return json.dumps({"raw": str(obj)}, ensure_ascii=False)


class PdaQueryService:
    """
    Serviço para consultas ao PDA.
    """
    def __init__(self, client: PdaClient | None = None):
        """
        Inicializa o serviço.
        """
        self._pda_client = client or PdaClient()

    def get_pda_report(self, page: int = 1, page_size: int = 50) -> List[Report]:
        """
        Obtém os relatórios do PDA.
        """
        raw_rows = self._pda_client.fetch_reports() 
        domain_rows = [raw_row_to_domain(row) for row in raw_rows]
        page_rows, total, has_prev, has_next = _paginate(domain_rows, page, page_size)
        
        items = [
            Report(
                id=dr.id,
                code=dr.code,
                message=dr.message,
                context_json=(None if dr.context is None else _json_dumps_safe(dr.context)),
                error_text=dr.error_text,
                stack_text=dr.stack_text,
                log_mode=dr.log_mode,
                ts_client=(dr.ts_client.isoformat() if dr.ts_client else ""),
                state=dr.state,
                date_added=(dr.date_added.isoformat() if dr.date_added else ""),
                date_updated=(dr.date_updated.isoformat() if dr.date_updated else ""),
            )
            for dr in page_rows
        ]
        
        return Page[Report](
            items=items,
            meta=PageMeta(
                page=page,
                page_size=page_size,
                total=total,
                has_next=has_next,
                has_prev=has_prev,
            ),
        )