"""Application configuration using Pydantic Settings."""
from __future__ import annotations

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Database — local PostgreSQL via asyncpg (air-gapped; see docker-compose.yml)
    DATABASE_URL: str = (
        "postgresql+asyncpg://anviksa:anviksa_dev@localhost:5432/anviksa"
    )
    # SSL is only needed for remote databases; local compose runs without it
    DATABASE_SSL: bool = False  # local compose only; no remote TLS endpoints (Rules.md §4)

    # Redis
    REDIS_URL: str = "redis://:anviksa_dev@localhost:6379/0"

    # Security
    SECRET_KEY: str = "dev-secret-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Environment
    ENVIRONMENT: str = "development"

    # Frontend
    FRONTEND_URL: str = "http://localhost:3000"

    # Local LLM (Ollama — air-gapped supervisory reasoning layer)
    OLLAMA_BASE_URL: str = "http://127.0.0.1:11434"
    OLLAMA_MODEL: str = "deepseek-r1:8b"
    OLLAMA_TIMEOUT_SECONDS: float = 90.0


settings = Settings()