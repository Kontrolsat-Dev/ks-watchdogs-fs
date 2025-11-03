from __future__ import annotations
import requests
from requests.adapters import HTTPAdapter
from urllib3.util import Retry
import certifi

from app.core.logging import logging
from app.core.config import settings

log = logging.getLogger("wd.patife_client")


class PatifeClient:
    def __init__(self,
                 timeout: str | None = None,
                 user_agent: str | None = None,
                 ):
        self.timeout = timeout or settings.PS_TIMEOUT_S
        self.user_agent = user_agent or settings.PS_USER_AGENT

        self._session = requests.Session()
        retries = Retry(
            total=4,
            connect=4,
            read=2,
            backoff_factor=0.4,
            allowed_methods=(["GET"]),
            raise_on_status=False
        )

        adapter = HTTPAdapter(max_retries=retries,
                              pool_connections=4, pool_maxsize=8)
        self._session.mount("https://", adapter)
        self._session.mount("http://", adapter)
        verify_env = str(getattr(settings, "PS_VERIFY_SSL", "true")).lower()
        self._verify = certifi.where() if verify_env != "false" else False

    def healthz(self):
        url = settings.PATIFE_HEALTHZ
        headers = {
            "User-Agent": self.user_agent,
            "Content-Type": "application/json",
        }

        resp = self._session.get(
            url,
            headers=headers,
            timeout=(3, self.timeout),
            verify=self._verify,
        )

        resp.raise_for_status()
        data = resp.json() or {}

        return data
