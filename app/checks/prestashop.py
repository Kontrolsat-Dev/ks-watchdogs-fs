import requests

from app.core.config import settings


class PrestashopChecks:
    def check_payments(self):
        params = {"PHP_AUTH_USER": settings.PS_API_KEY}
        response = requests.get(settings.PS_CHECK_PAYMENT_URL, params=params, timeout=settings.PS_TIMEOUT_S)
        response.raise_for_status()
        return response.json()