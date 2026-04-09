"""Application settings loaded from environment variables and .env files."""

from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Runtime configuration for the backend services."""

    cf_ai_api_key: str = Field(alias="CF_AI_API_KEY")
    cf_account_id: str = Field(alias="CF_ACCOUNT_ID")
    cf_model: str = Field(
        default="@cf/meta/llama-3.2-3b-instruct",
        alias="CF_MODEL",
    )
    request_timeout_seconds: float = Field(default=30.0, alias="REQUEST_TIMEOUT")
    max_cv_file_size_mb: int = Field(default=10, alias="MAX_CV_FILE_SIZE_MB")
    cv_session_ttl_minutes: int = Field(default=120, alias="CV_SESSION_TTL_MINUTES")

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Return cached application settings."""

    return Settings()
