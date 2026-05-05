from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import GameProgress

router = APIRouter(prefix="/api/game", tags=["game"])

class LevelData(BaseModel):
    level: int
    user_id: int  # ← ترسليه من Unity مؤقتاً

@router.post("/progress")
def save_progress(
    data: LevelData,
    db: Session = Depends(get_db)
):
    new_progress = GameProgress(
        user_id=data.user_id,
        level=data.level
    )
    db.add(new_progress)
    db.commit()
    return {"message": "Level saved", "level": data.level}
