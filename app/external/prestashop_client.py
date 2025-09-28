import requests
from app.core.config import settings


class PrestashopClient:
    def __init__(self,
                 base_url: str | None = None,
                 payments_url: str | None = None,
                 api_key: str | None = None,
                 timeout: int | None = None,
                 user_agent: str | None = None
                 ) -> None:
        # Endpoints
        self.base_url = base_url or settings.PS_BASE_URL
        self.payments_url = payments_url or settings.PS_CHECK_PAYMENT_URL
        # Sec
        self.api_key = api_key or settings.PS_API_KEY
        self.user_agent = user_agent or settings.PS_USER_AGENT
        # Misc
        self.timeout = timeout or settings.PS_TIMEOUT

    def fetch_payments(self) -> list[dict]:
        params = {"PHP_AUTH_USER": self.api_key}
        headers = {"User-Agent": self.user_agent}

        r = requests.get(self.payments_url, params=params, headers=headers)
        r.raise_for_status()
        data = r.json()

        rows = data.get("data") or []
        if not isinstance(rows, list):
            raise RuntimeError(f"Unexpected response from prestashop API returned {data}")
        return rows
