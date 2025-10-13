import requests
from requests.adapters import HTTPAdapter
from urllib3.util import Retry
import certifi
import time

from app.core.config import settings


class PrestashopClient:
    def __init__(
            self,
            base_url: str | None = None,
            api_key: str | None = None,
            timeout: int | None = None,
            user_agent: str | None = None,
    ) -> None:
        self.base_url = base_url or settings.PS_BASE_URL
        # Sec
        self.api_key = api_key or settings.PS_API_KEY
        self.user_agent = user_agent or settings.PS_USER_AGENT
        # Misc
        self.timeout = timeout or settings.PS_TIMEOUT_S

        # --- HTTP session com retries e CA bundle explícito ---
        self._session = requests.Session()
        retries = Retry(
            total=4,
            connect=4,
            read=2,
            backoff_factor=0.4,
            status_forcelist=(502, 503, 504),
            allowed_methods=frozenset(["GET"]),
            raise_on_status=False,
        )
        adapter = HTTPAdapter(max_retries=retries, pool_connections=4, pool_maxsize=8)
        self._session.mount("https://", adapter)
        self._session.mount("http://", adapter)
        verify_env = str(getattr(settings, "PS_VERIFY_SSL", "true")).lower()
        self._verify = certifi.where() if verify_env != "false" else False

    # -------------------------------
    # Payments
    # -------------------------------
    def fetch_payments(self) -> list[dict]:
        params = {"PHP_AUTH_USER": self.api_key}
        headers = {
            "User-Agent": self.user_agent,
            "Accept": "application/json",
        }

        # timeout (connect, read)
        resp = self._session.get(
            settings.PS_CHECK_PAYMENT_URL,
            params=params,
            headers=headers,
            timeout=(3, self.timeout),
            verify=self._verify,
        )
        resp.raise_for_status()

        data = resp.json()
        rows = data.get("data") or []
        if not isinstance(rows, list):
            raise RuntimeError(f"Unexpected response from PrestaShop API: {data!r}")
        return rows

    # -------------------------------
    # Delayed orders
    # -------------------------------
    def fetch_delayed_orders(self) -> list[dict]:
        params = {"PHP_AUTH_USER": self.api_key}
        headers = {"User-Agent": self.user_agent, "Accept": "application/json"}
        resp = self._session.get(
            settings.PS_CHECK_ORDERS_URL,
            params=params, headers=headers,
            timeout=(3, self.timeout), verify=self._verify,
        )
        resp.raise_for_status()
        data = resp.json()

        if isinstance(data, list):
            rows = data
        else:
            rows = data.get("items") or data.get("data") or []

        if not isinstance(rows, list):
            raise RuntimeError(f"Unexpected response for delayed orders: {type(rows)}")

        return rows

    # -------------------------------
    # EOL Products
    # -------------------------------
    def fetch_eol_products(self) -> list[dict]:
        params = {"PHP_AUTH_USER": self.api_key}
        headers = {
            "User-Agent": self.user_agent,
            "Accept": "application/json",
        }

        resp = self._session.get(
            settings.PS_CHECK_EOL_PRODUCTS,
            params=params,
            headers=headers,
            timeout=(3, self.timeout),
            verify=self._verify,
        )
        resp.raise_for_status()
        data = resp.json() or {}

        # formato típico: {"counts": {...}, "warning": [...], "critical": [...]}
        if isinstance(data, dict):
            rows: list[dict] = []

            for key in ("warning", "critical"):
                part = data.get(key)
                if isinstance(part, list):
                    # garante "severity" quando vier omitido
                    for it in part:
                        if isinstance(it, dict) and "severity" not in it:
                            it["severity"] = key
                    rows.extend(part)

            # fallbacks (se o endpoint algum dia devolver outra chave)
            if not rows:
                rows = data.get("items") or data.get("data") or []

            if not isinstance(rows, list):
                raise RuntimeError(f"Unexpected EOL products response type: {type(rows)}")

            return rows

        # fallback raríssimo: resposta é uma lista já plana
        if isinstance(data, list):
            return data

        raise RuntimeError(f"Unexpected EOL products response: {data!r}")

    # -------------------------------
    # Pages Speed Test
    # -------------------------------
    def fetch_pagespeed(self, page_type: str = "product") -> dict:
        import time

        endpoint = settings.PS_HOME_URL if page_type == "home" else settings.PS_PRODUCT_URL
        headers = {
            "User-Agent": self.user_agent,
            "Accept": "text/html",
            "Accept-Language": "pt-PT,pt;q=0.9,en;q=0.8",
            "Cache-Control": "no-cache",
            "Pragma": "no-cache",
        }

        started = time.perf_counter()
        resp = self._session.get(
            endpoint, headers=headers, timeout=(3, self.timeout), verify=self._verify, stream=True
        )
        status = resp.status_code

        size = 0
        first_chunk_at = None

        # LÊ APENAS UMA VEZ
        for chunk in resp.iter_content(chunk_size=16384):
            if not chunk:
                continue
            if first_chunk_at is None:
                first_chunk_at = time.perf_counter()
            size += len(chunk)

        ended = time.perf_counter()
        resp.close()

        # fallback raro: se algum proxy quebrou o stream e size==0, faz um GET normal
        if size == 0:
            resp2 = self._session.get(
                endpoint, headers=headers, timeout=(3, self.timeout), verify=self._verify, stream=False
            )
            status = resp2.status_code
            body2 = resp2.content or b""
            size = len(body2)
            # usa o elapsed como proxy de TTFB neste fallback
            ttfb_ms = int(resp2.elapsed.total_seconds() * 1000)
            total_ms = ttfb_ms  # com fallback não temos medição granular
            headers_l = {k.lower(): v for k, v in resp2.headers.items()}
            html_text = body2.decode(errors="ignore")
        else:
            ttfb_ms = int(((first_chunk_at or ended) - started) * 1000)
            total_ms = int((ended - started) * 1000)
            headers_l = {k.lower(): v for k, v in resp.headers.items()}
            # já consumimos tudo acima; não faças nova leitura — html virá do tamanho medido
            # como não guardámos os bytes, só precisamos do texto p/ sanidade:
            # para evitar nova request grande, lê o corpo via Segunda request apenas se precisares mesmo do HTML:
            # aqui vamos fazer uma segunda request leve SEM stream (custa 1 ida) para obter o HTML para sanidade
            # (se preferires evitar 2ª request, acumula os chunks numa lista e faz join)
            resp_full = self._session.get(
                endpoint, headers=headers, timeout=(3, self.timeout), verify=self._verify, stream=False
            )
            html_text = resp_full.text

        headers_out = {
            "content_type": headers_l.get("content-type", ""),
            "cache_control": headers_l.get("cache-control", ""),
            "age": headers_l.get("age", ""),
            "server": headers_l.get("server", ""),
            "cf_cache_status": headers_l.get("cf-cache-status", ""),
            "x_cache": headers_l.get("x-cache", ""),
        }

        return {
            "page_type": "home" if page_type == "home" else "product",
            "url": endpoint,
            "status_code": status,
            "ttfb_ms": ttfb_ms,
            "total_ms": total_ms,
            "html_bytes": size,
            "headers": headers_out,
            "html_text": html_text,
        }




