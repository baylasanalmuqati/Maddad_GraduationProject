from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

class GameData(BaseModel):
    accuracy: float
    response_time: float
    reward: float
    rl_state: str
    rl_action: str

@router.post("/game-progress")
def receive_game_data(data: GameData):
    print("Game data received:", data)
    return {"message": "Data saved"}
