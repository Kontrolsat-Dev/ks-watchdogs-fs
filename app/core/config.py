from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field
from typing import List


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_ignore_empty=True)

    # App

    APP_ENV: str = True
    APP_PORT:int = 8000
    CORS_ORIGINS: List[str] = Field(default_factory=lambda: ["http://localhost:5173"])

    # Database
    DB_URL: str = 'sqlite:///db.sqlite3'

    # PRESTASHOP
    PS_BASE_URL: str
    PS_TIMEOUT_S: int
    PS_API_KEY: str

    # Carriers

    # External Services

settings = Settings()