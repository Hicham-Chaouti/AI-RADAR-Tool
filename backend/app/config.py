"""Application configuration from environment variables."""

from pathlib import Path

from pydantic_settings import BaseSettings

# .env lives at project root (one level above backend/)
_ENV_FILE = Path(__file__).resolve().parent.parent.parent / ".env"


class Settings(BaseSettings):
    """All configuration via environment variables. Zero hardcoded values."""

    # ─── LLM API Keys ──────────────────────────────────────
    OPENAI_API_KEY: str = ""
    ANTHROPIC_API_KEY: str = ""
    MISTRAL_API_KEY: str = ""

    # ─── PostgreSQL ─────────────────────────────────────────
    DATABASE_URL: str = "postgresql+asyncpg://ai_radar:ai_radar@postgres:5432/ai_radar_db"
    POSTGRES_USER: str = "ai_radar"
    POSTGRES_PASSWORD: str = "ai_radar"
    POSTGRES_DB: str = "ai_radar_db"

    # ─── Qdrant ─────────────────────────────────────────────
    QDRANT_HOST: str = "qdrant"
    QDRANT_PORT: int = 6333
    QDRANT_COLLECTION: str = "use_cases"

    # ─── Redis ──────────────────────────────────────────────
    REDIS_URL: str = "redis://redis:6379/0"
    CACHE_TTL_SECONDS: int = 3600

    # ─── Application ────────────────────────────────────────
    SECRET_KEY: str = "change-me-in-production"
    ENVIRONMENT: str = "development"
    CORS_ORIGINS: str = "*"
    LOG_LEVEL: str = "INFO"

    # ─── Scraping ───────────────────────────────────────────
    SCRAPING_RATE_LIMIT_RPS: int = 1

    model_config = {
        "env_file": str(_ENV_FILE),
        "env_file_encoding": "utf-8",
        "extra": "ignore",
    }


settings = Settings()
