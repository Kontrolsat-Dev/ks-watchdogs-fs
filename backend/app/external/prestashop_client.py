import requests
from requests.adapters import HTTPAdapter
from urllib3.util import Retry
import certifi
import time

from app.core.logging import logging
from app.core.config import settings


log = logging.getLogger("watchdogs.prestashop_client")

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
        adapter = HTTPAdapter(max_retries=retries,
                              pool_connections=4, pool_maxsize=8)
        self._session.mount("https://", adapter)
        self._session.mount("http://", adapter)
        verify_env = str(getattr(settings, "PS_VERIFY_SSL", "true")).lower()
        self._verify = certifi.where() if verify_env != "false" else False

    # -------------------------------
    # Login
    # -------------------------------
    def login(self, email: str, password: str) -> dict:
        url = settings.PS_AUTH_VALIDATE
        headers = {
            settings.PS_AUTH_VALIDATE_HEADER: settings.PS_GENESYS_KEY,  # cuidado: não logar isto
            "User-Agent": self.user_agent,
            "Accept": "application/json",
            "Content-Type": "application/json",
        }

        # NUNCA logar segredos
        log.info("PrestashopClient.login: POST %s for email=%s UA=%s", url, email, self.user_agent)

        try:
            timeout = int(getattr(settings, "PS_TIMEOUT_S", 20))
        except Exception:
            timeout = 20

        verify = certifi.where() if str(getattr(settings, "PS_AUTH_VERIFY_SSL", "true")).lower() != "false" else False

        # Fazer o request
        try:
            resp = self._session.post(
                url,
                json={"email": email, "password": password},
                headers=headers,
                timeout=timeout,
                verify=verify,
            )
        except Exception:
            log.exception("PrestashopClient.login: request failed")
            return {"id": email, "email": email, "name": "Guest", "role": "Guest"}

        # Log da resposta (sem segredos / truncado)
        log.info("PrestashopClient.login: HTTP %s", resp.status_code)
        if resp.status_code >= 400:
            log.warning("PrestashopClient.login: error body=%s", (resp.text[:500] if resp.text else "<empty>"))

        # Parse seguro
        data = {}
        try:
            data = resp.json() if resp.content else {}
        except Exception:
            log.debug("PrestashopClient.login: non-JSON response: %r", resp.text[:500] if resp.text else "<empty>")

        user = data.get("user") or {}
        return {
            "id": data.get("id") or data.get("user_id") or email,
            "email": data.get("email", email),
            "name": user.get("name") or "Guest",
            "role": (user.get("role") or "user") or "Guest",
        }

    # -------------------------------c
    # Payments
    # -------------------------------
    def fetch_payments(self) -> list[dict]:
        params = {"PHP_AUTH_USER": self.api_key}
        headers = {
            "User-Agent": self.user_agent,
            "Accept": "application/json",
        }

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
            raise RuntimeError(
                f"Unexpected response from PrestaShop API: {data!r}")
        return rows

    # -------------------------------
    # Delayed orders
    # -------------------------------
    def fetch_delayed_orders(self) -> list[dict]:
        params = {"PHP_AUTH_USER": self.api_key}
        headers = {"User-Agent": self.user_agent, "Accept": "application/json"}
        resp = self._session.get(
            settings.PS_CHECK_ORDERS_URL,
            params=params,
            headers=headers,
            timeout=(3, self.timeout),
            verify=self._verify,
        )
        resp.raise_for_status()
        data = resp.json()

        if isinstance(data, list):
            rows = data
        else:
            rows = data.get("items") or data.get("data") or []

        if not isinstance(rows, list):
            raise RuntimeError(
                f"Unexpected response for delayed orders: {type(rows)}")

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
                raise RuntimeError(
                    f"Unexpected EOL products response type: {type(rows)}")

            return rows

        # fallback raríssimo: resposta é uma lista já plana
        if isinstance(data, list):
            return data

        raise RuntimeError(f"Unexpected EOL products response: {data!r}")

    # -------------------------------
    # Pages Speed Test
    # -------------------------------
    def fetch_pagespeed(self, page_type: str = "product") -> dict:
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

        for chunk in resp.iter_content(chunk_size=16384):
            if not chunk:
                continue
            if first_chunk_at is None:
                first_chunk_at = time.perf_counter()
            size += len(chunk)

        ended = time.perf_counter()
        resp.close()

        # fallback: se size==0, uma segunda request simples
        if size == 0:
            resp2 = self._session.get(
                endpoint, headers=headers, timeout=(3, self.timeout), verify=self._verify, stream=False
            )
            status = resp2.status_code
            body2 = resp2.content or b""
            size = len(body2)
            ttfb_ms = int(resp2.elapsed.total_seconds() * 1000)
            total_ms = ttfb_ms
            headers_l = {k.lower(): v for k, v in resp2.headers.items()}
            html_text = body2.decode(errors="ignore")
        else:
            ttfb_ms = int(((first_chunk_at or ended) - started) * 1000)
            total_ms = int((ended - started) * 1000)
            headers_l = {k.lower(): v for k, v in resp.headers.items()}
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

    # -------------------------------
    # Stale Carts
    # -------------------------------
    def fetch_carts_stale(
        self,
        hours: int | None = None,
        limit: int | None = None,
        max_days: int | None = None,
        min_items: int | None = None,
    ) -> list[dict]:
        params = {"PHP_AUTH_USER": self.api_key}
        params.update({
            "hours": hours or settings.PS_CART_STALE_WARN_H,
            "limit": limit or settings.PS_CART_STALE_LIMIT,
            "max_days": max_days or settings.PS_CART_STALE_MAX_DAYS,
            "min_items": (settings.PS_CART_STALE_MIN_ITEMS if min_items is None else min_items),
        })
        if hours is None:
            hours = settings.PS_CART_STALE_WARN_H
        if limit is None:
            limit = settings.PS_CART_STALE_LIMIT
        params.update({"hours": hours, "limit": limit})

        headers = {"User-Agent": self.user_agent, "Accept": "application/json"}
        resp = self._session.get(
            settings.PS_CHECK_CARTS_STALE_URL,
            params=params,
            headers=headers,
            timeout=(3, self.timeout),
            verify=self._verify,
        )
        resp.raise_for_status()
        data = resp.json()
        rows = data.get("data") or []
        if not isinstance(rows, list):
            raise RuntimeError(
                f"Unexpected response from carts_stale: {data!r}")
        return rows

    # -------------------------------
    # KPI Employees: timeseries
    # -------------------------------
    def fetch_kpi_employee_timeseries(
        self,
        *,
        role: str,
        gran: str,
        since: str | None = None,
        until: str | None = None,
    ) -> dict:
        params = {
            "PHP_AUTH_USER": self.api_key,
            "role": role,   # "prep" | "invoice"
            "gran": gran,   # "day" | "week" | "month" | "year"
            "since": since,
            "until": until,
            "limit": 50000,
        }
        headers = {"User-Agent": self.user_agent, "Accept": "application/json"}
        resp = self._session.get(
            settings.PS_KPI_EMP_TIMESERIES_URL,   # <-- corrigido (sem PS_)
            params=params,
            headers=headers,
            timeout=(3, self.timeout),
            verify=self._verify,
        )
        resp.raise_for_status()
        data = resp.json()
        rows = data.get("data") or []
        if not isinstance(rows, list):
            raise RuntimeError(f"Unexpected KPI timeseries response: {data!r}")
        return {"meta": {k: data.get(k) for k in ("role", "gran", "since", "until")}, "rows": rows}

    # -------------------------------
    # KPI Employees: performance (ranking)
    # -------------------------------
    # app/external/prestashop_client.py

    def fetch_kpi_employee_performance(
            self,
            *,
            role: str,
            since: str | None = None,
            until: str | None = None,
            order_by: str = "avg",
            order_dir: str = "asc",
            limit: int = 200,
    ) -> dict:
        params = {
            "PHP_AUTH_USER": self.api_key,
            "role": role,
            "since": since,
            "until": until,
            "order_by": order_by,
            "order_dir": order_dir,
            "limit": limit,
            "min_orders": 1,  # <<< garante resultados mesmo com poucas encomendas no dia
        }
        headers = {"User-Agent": self.user_agent, "Accept": "application/json"}
        resp = self._session.get(
            settings.PS_KPI_EMP_PERFORMANCE_URL,
            params=params,
            headers=headers,
            timeout=(3, self.timeout),
            verify=self._verify,
        )
        resp.raise_for_status()
        data = resp.json()
        rows = data.get("data") or []
        if not isinstance(rows, list):
            raise RuntimeError(
                f"Unexpected KPI performance response: {data!r}")
        meta = {k: data.get(k) for k in (
            "role", "since", "until", "order_by", "order_dir", "limit")}
        return {"meta": meta, "rows": rows}
