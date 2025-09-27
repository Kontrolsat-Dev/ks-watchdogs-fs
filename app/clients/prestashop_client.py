# app/clients/prestashop_client.py
from __future__ import annotations
import logging, requests
from app.core.config import settings

log = logging.getLogger("clients.prestashop_client")

class PrestashopClient:
    def __init__(self, timeout: int | None = None):
        self.timeout = timeout or settings.PS_TIMEOUT_S
        self.api_key = settings.PS_API_KEY
        self.ua = settings.PS_USER_AGENT

    def get_payments_raw(self, endpoint: str | None = None) -> dict:
        url = endpoint or settings.PS_CHECK_PAYMENT_URL
        params = {"PHP_AUTH_USER": self.api_key}
        headers = {"User-Agent": self.ua}
        r = requests.get(url, params=params, headers=headers, timeout=self.timeout)
        r.raise_for_status()
        try:
            data = r.json()
        except ValueError as e:
            snippet = r.text[:300]
            raise RuntimeError(f"Resposta não-JSON de {url}: {e} :: {snippet!r}")
        if not data.get("ok", True):
            raise RuntimeError(f"Endpoint respondeu ok=false em {url}")
        return data
