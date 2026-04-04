"""
Application configuration loaded from environment variables.
Copy .env.example to .env and fill in your values before running.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
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


settings = Settings()
