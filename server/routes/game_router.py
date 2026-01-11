from fastapi import APIRouter, HTTPException
from database import get_database
from models import GameSession, GameStats
from datetime import datetime
from typing import Optional
from fastapi import Depends
from oauth2 import get_current_user

router = APIRouter()

@router.post("/session")
@router.post("/session")
async def save_game_session(session: GameSession, current_user: dict = Depends(get_current_user)):
    db = get_database()
    game_sessions_collection = db["game_sessions"]
    
    session_data = session.dict()
    session_data["user_id"] = current_user["email"]
    
    await game_sessions_collection.insert_one(session_data)
    return {"message": "Game session saved successfully"}

@router.get("/stats", response_model=GameStats)
@router.get("/stats", response_model=GameStats)
async def get_game_stats(year: Optional[int] = None, current_user: dict = Depends(get_current_user)):
    db = get_database()
    game_sessions_collection = db["game_sessions"]
    
    query = {"user_id": current_user["email"]}
    if year:
        # Match timestamp starting with the year (ISO format: YYYY-MM-DD...)
        query["timestamp"] = {"$regex": f"^{year}"}
        
    cursor = game_sessions_collection.find(query)
    sessions = await cursor.to_list(length=1000)
    
    total_points = sum(s.get("points_earned", 0) for s in sessions)
    max_seconds_focused = max((s.get("seconds_focused", 0) for s in sessions), default=0)
    
    return {
        "total_points": total_points,
        "max_seconds_focused": max_seconds_focused
    }
