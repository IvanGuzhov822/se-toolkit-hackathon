from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://covey:coveypass@localhost:5432/coveyweek_db"
    OPENAI_API_KEY: str = ""
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000"
    JWT_SECRET_KEY: str = "coveyweek-dev-secret-change-in-production-2026"
    QWEN_PROXY_URL: str = ""
    QWEN_API_KEY: str = ""
    USE_LLM: bool = False
    BOT_TOKEN: str = ""
    API_BASE_URL: str = "http://localhost:8000"

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
