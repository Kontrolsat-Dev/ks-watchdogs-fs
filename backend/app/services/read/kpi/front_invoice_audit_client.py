# app/services/read/kpi/front_invoice_audit_client.py

from __future__ import annotations

from datetime import datetime
from typing import Any, List, Dict, Optional

import requests

from app.core.config import settings


class FrontInvoiceAuditClient:
    """
    Client simples para o endpoint frontInvoiceAudit.
    """

    def __init__(self) -> None:
        self.base_url = settings.FRONT_INVOICE_AUDIT_BASE_URL
        self.token = settings.PS_API_KEY
        self.headers = {"User-Agent": "Kontrolsat-LOCAL-CRON"}

    def fetch_events(
        self,
        *,
        since_iso: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """
        since_iso: 'YYYY-MM-DDTHH:MM:SS' ou None.
        Se None, não envia o parâmetro e o PHP que se oriente.
        """
        params = {
            "PHP_AUTH_USER": self.token,
        }
        if since_iso:
            params["data_created_since"] = since_iso

        resp = requests.get(
            self.base_url, params=params, timeout=15, headers=self.headers
        )
        resp.raise_for_status()
        data = resp.json()
        if not isinstance(data, list):
            return []
        return data
