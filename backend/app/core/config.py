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
    # --> Orders
    PS_CHECK_ORDERS_URL: str = "https://domain.com/__watchdogs/check_orders.php"
    PS_ORDERS_WARN_DS_STD: int = 2
    PS_ORDERS_CRIT_DS_STD: int = 3
    PS_ORDERS_WARN_DS_DROPSHIP: int = 3
    PS_ORDERS_CRIT_DS_DROPSHIP: int = 5
    # --> EOL Products
    PS_CHECK_EOL_PRODUCTS: str = "https://domain.com/__watchdogs/check_eol_products.php"
    PS_EOL_WARN_DAYS: int = 30
    PS_EOL_CRIT_DAYS: int = 60
    # --> Carregamento de Páginas
    PS_HOME_URL: str = "https://domain.com/home.php"
    PS_PRODUCT_URL: str = "https://domain.com/product/product-1.php"
    PS_PAGESPEED_JSONLD_IS_CRITICAL: bool = False
    PS_PAGESPEED_IGNORE_SANITY_WARNINGS: bool = True
    PS_PAGESPEED_IGNORE_WARN_KEYS: list[str] = [
        "title_ok", "meta_desc_ok", "h1_ok", "canonical_ok", "blocking_scripts_in_head"
    ]
    PS_PAGESPEED_HOME_TTFB_WARN: int = 1600
    PS_PAGESPEED_HOME_TTFB_CRIT: int = 2500
    PS_PAGESPEED_HOME_TOTAL_WARN: int = 1800
    PS_PAGESPEED_HOME_TOTAL_CRIT: int = 3000
    PS_PAGESPEED_HOME_HTML_WARN: int = 450_000
    PS_PAGESPEED_HOME_HTML_CRIT: int = 900_000
    PS_PAGESPEED_PRODUCT_TTFB_WARN: int = 350
    PS_PAGESPEED_PRODUCT_TTFB_CRIT: int = 800
    PS_PAGESPEED_PRODUCT_TOTAL_WARN: int = 1000
    PS_PAGESPEED_PRODUCT_TOTAL_CRIT: int = 2000
    PS_PAGESPEED_PRODUCT_HTML_WARN: int = 320_000
    PS_PAGESPEED_PRODUCT_HTML_CRIT: int = 900_000


settings = Settings()
