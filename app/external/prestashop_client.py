import requests
from requests.adapters import HTTPAdapter
from urllib3.util import Retry
import certifi

from app.core.config import settings


class PrestashopClient:
    def __init__(
        self,
        base_url: str | None = None,
        payments_url: str | None = None,
        api_key: str | None = None,
        timeout: int | None = None,
        user_agent: str | None = None,
    ) -> None:
        # Endpoints
        self.base_url = base_url or settings.PS_BASE_URL
        self.payments_url = payments_url or settings.PS_CHECK_PAYMENT_URL
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

        # Verify TLS (permite override em DEV com PS_VERIFY_SSL=false)
        verify_env = str(getattr(settings, "PS_VERIFY_SSL", "true")).lower()
        self._verify = certifi.where() if verify_env != "false" else False

    def fetch_payments(self) -> list[dict]:
        params = {"PHP_AUTH_USER": self.api_key}
        headers = {
            "User-Agent": self.user_agent,
            "Accept": "application/json",
        }

        # timeout (connect, read)
        resp = self._session.get(
            self.payments_url,
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

    def fetch_delayed_orders(self) -> list[dict]:
        params = {"PHP_AUTH_USER": self.api_key}
        headers = {"User-Agent": self.user_agent, "Accept": "application/json"}
        resp = self._session.get(settings.PS_CHECK_ORDERS_URL, params=params,
                                 headers=headers, timeout=(3, self.timeout),
                                 verify=self._verify)
        resp.raise_for_status()
        data = resp.json()
        rows = data if isinstance(data, list) else data.get("data", [])
        if not isinstance(rows, list):
            raise RuntimeError("Unexpected response for delayed orders")
        return rows
