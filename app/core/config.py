# app/core/config

from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field
from typing import List, Literal


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_ignore_empty=True)

    # General
    TIMEZONE: str = "Europe/Lisbon"
    # ---------------
    # App
    APP_ENV: Literal["dev", "prod", "test"] = "dev"   # ← antes: str = True
    APP_PORT: int = 8000
    CORS_ORIGINS: List[str] = Field(default_factory=lambda: ["http://localhost:5173"])
    # ---------------
    # Database
    DATABASE_URL: str = 'sqlite:///./database/database.sqlite'
    # ---------------
    # Prestashop
    PS_BASE_URL: str = 'http://domain.com'
    PS_TIMEOUT_S: int = 15
    PS_API_KEY: str = "prestashop-ws-key"
    PS_USER_AGENT: str = "prestashop-allowed-ua"
    # --> Payments
    PS_CHECK_PAYMENT_URL: str = "https://domain.com/__watchdogs/check_payments.php"
    PS_PAYMENTS_WARNING_HOURS: int = 48  # amarelo
    PS_PAYMENTS_CRITICAL_HOURS: int = 72  # vermelho
    # Carriers

    # External Services


settings = Settings()
