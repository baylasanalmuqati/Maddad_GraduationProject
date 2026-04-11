"""
Application configuration loaded from environment variables.
Copy .env.example to .env and fill in your values before running.
"""

from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    ENVIRONMENT: str = "development"

    # SQLite database file (default – no installation needed).
    # The file maddad.db will be created automatically inside the backend/ folder.
    # To use PostgreSQL instead, set this to:
    # postgresql://user:password@localhost:5432/maddad
    DATABASE_URL: str = "sqlite:///./maddad.db"

    # Secret key used to sign JWT tokens – change this in production!
    SECRET_KEY: str = "change-me-in-production"

    # JWT algorithm
    ALGORITHM: str = "HS256"

    # Access-token lifetime in minutes
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    # CORS – comma-separated list of allowed origins (frontend URLs)
    # Example: "http://localhost:3000,https://your-frontend.netlify.app"
    CORS_ORIGINS: str = "*"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT.lower() == "production"

    @property
    def cors_origins_list(self) -> list[str]:
        if self.CORS_ORIGINS.strip() == "*":
            return ["*"]
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    @model_validator(mode="after")
    def validate_production_safety(self):
        if not self.is_production:
            return self

        default_secret_values = {"change-me-in-production", "change-me-to-a-long-random-string", "change-me"}
        if self.SECRET_KEY in default_secret_values or len(self.SECRET_KEY) < 32:
            raise ValueError("SECRET_KEY must be a strong random value in production (at least 32 characters).")

        if self.CORS_ORIGINS.strip() == "*" or not self.cors_origins_list:
            raise ValueError("CORS_ORIGINS must be explicitly set to frontend domains in production.")

        if not self.DATABASE_URL.startswith("postgresql"):
            raise ValueError("DATABASE_URL must use PostgreSQL in production.")

        return self


settings = Settings()
