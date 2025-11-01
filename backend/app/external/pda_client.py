from __future__ import annotations
import requests
from requests.adapters import HTTPAdapter
from urllib3.util import Retry
import certifi

from app.core.logging import logging
from app.core.config import settings

log = logging.getLogger("wd.pda_client")

class PdaClient:
    def __init__(self,
         timeout: str | None = None,
         user_agent: str | None = None,
         pda_key: str | None = None,
    ) -> None:
        self.timeout = timeout or settings.PS_TIMEOUT_S
        self.user_agent = user_agent or settings.PS_USER_AGENT
        self.pda_key = pda_key or settings.TOOLS_PDA_API_KEY

        self._session = requests.Session()
        retries = Retry(
            total = 4,
            connect = 4,
            read = 2,
            backoff_factor = 0.4,
            status_forcelist=(502, 503, 504),
            allowed_methods=frozenset(["GET"]),
            raise_on_status=False,
        )

        adapter = HTTPAdapter(max_retries=retries, pool_connections=4, pool_maxsize=8)
        self._session.mount("https://", adapter)
        self._session.mount("http://", adapter)
        verify_env = str(getattr(settings, "PS_VERIFY_SSL", "true")).lower()
        self._verify = certifi.where() if verify_env != "false" else False

    # -------------------------------c
    # Fetch reports
    # -------------------------------
    def fetch_reports(self):
        url = settings.TOOLS_PDA_GET_REPORTS
        headers = {
            "User-Agent": self.user_agent,
            "Accept": "application/json",
            "Authorization": f"Bearer {self.pda_key}",
        }

        log.info("PdaClient.fetch_reports - Fetching reports from: %s", url)

        try:
            resp = self._session.get(url, headers=headers, timeout=self.timeout, verify=self._verify)
        except Exception:
            log.exception("PdaClient.fetch_reports - Failed to fetch report")
            return {}

        if resp.status_code >= 400:
            log.warning("PrestashopClient.login: error body=%s", (resp.text[:500] if resp.text else "<empty>"))

        data = {}

        try:
            data = resp.json() if resp.content else {}
        except Exception:
            log.exception("PdaClient.fetch_reportsnon-JSON response: %r", resp.text[:500] if resp.text else "<empty>")

        return data