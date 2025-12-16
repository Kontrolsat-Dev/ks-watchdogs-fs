# app/core/config

from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field
from typing import List, Literal


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_ignore_empty=True, extra="ignore")
    # General
    TIMEZONE: str = "Europe/Lisbon"
    # ---------------
    # App
    APP_ENV: Literal["dev", "prod", "test"] = "dev"
    APP_PORT: int = 8000
    CORS_ORIGINS: List[str] = Field(
        default_factory=lambda: [
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://192.168.1.115:5173",
        ]
    )
    # ---------------
    # Database
    DATABASE_URL: str = "sqlite:///./database/database.sqlite"
    # ---------------
    # JWT
    JWT_SECRET: str = "jwt_secret_example"
    JWT_EXPIRE_MIN: int = 60
    JWT_REFRESH_EXPIRE_MIN: int = 43200
    # ---------------
    # Prestashop
    PS_BASE_URL: str = "http://domain.com"
    PS_TIMEOUT_S: int = 15
    PS_API_KEY: str = "prestashop-ws-key"
    PS_USER_AGENT: str = "prestashop-allowed-ua"
    # --> Auth
    PS_AUTH_VALIDATE: str = "https://domain.com/__watchdogs/login.php"
    PS_GENESYS_KEY: str = "ps-api-key"
    PS_AUTH_VERIFY_SSL: str = "true"
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
        "title_ok",
        "meta_desc_ok",
        "h1_ok",
        "canonical_ok",
        "blocking_scripts_in_head",
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
    # --> Carrinhos abandonados
    PS_CHECK_CARTS_STALE_URL: str = "https://domain.com/__watchdogs/carts_stale.php"
    PS_CART_STALE_MAX_DAYS: int = 14
    PS_CART_STALE_MIN_ITEMS: int = 1
    PS_CART_STALE_WARN_H: int = 6
    PS_CART_STALE_CRIT_H: int = 12
    PS_CART_STALE_LIMIT: int = 50
    # --> KPI
    PS_KPI_EMP_TIMESERIES_URL: str = (
        "https://domain.com/__watchdogs/kpi_employee_timeseries.php"
    )
    PS_KPI_EMP_PERFORMANCE_URL: str = (
        "https://domain.com/__watchdogs/kpi_employee_performance.php"
    )
    FRONT_INVOICE_AUDIT_BASE_URL: str = (
        "https://domain.com/custom/frontInvoiceAudit/get-audits.php"
    )

    # Tools
    # --- PDA ---
    TOOLS_PDA_API_KEY: str = "api-key-pda"
    TOOLS_PDA_GET_REPORTS: str = (
        "https://www.domain.com/__fastLogixApi/reports/api/getReports.php"
    )
    TOOLS_PDA_UPDATE_REPORT: str = (
        "https://www.domain.com/__fastLogixApi/reports/api/updateReport.php"
    )
    # --- PATIFE ---
    PATIFE_HEALTHZ: str = "https://domain.com/api/healthz"


settings = Settings()
