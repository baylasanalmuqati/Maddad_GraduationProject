"""
FastAPI application entry point.
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.config import settings
from app.database import Base, engine
from app.ml.predictor import ml_assets_ready, validate_ml_assets
from app.routers import auth, followup, profile, questionnaire

# Import all models so SQLAlchemy registers them with Base.metadata
import app.models  # noqa: F401


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Run startup readiness checks and initialize dev schema."""
    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))

    validate_ml_assets()

    if not settings.is_production:
        Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="Maddad API",
    description="Backend API for the Maddad ASD screening and child-development platform.",
    version="1.0.0",
    lifespan=lifespan,
)

# ---------------------------------------------------------------------------
# CORS
# ---------------------------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------

app.include_router(auth.router)
app.include_router(profile.router)
app.include_router(questionnaire.router)
app.include_router(followup.router)


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------

@app.get("/health", tags=["health"])
def health_check():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="database_unavailable",
        )

    if not ml_assets_ready():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="ml_assets_unavailable",
        )

    return {"status": "ok", "database": "ok", "ml_assets": "ok"}
