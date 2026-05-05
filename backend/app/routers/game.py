from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class GameLevelData(BaseModel):
    child_id: int
    game_name: str
    level: int

@router.post("/game-progress")
def receive_game_data(data: GameLevelData):
    print("Level received:", data)
    return {"message": "Level saved"}
