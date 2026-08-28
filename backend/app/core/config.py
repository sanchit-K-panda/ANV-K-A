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

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://anviksa:anviksa_dev@localhost:5432/anviksa"

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


settings = Settings()