from fastapi import APIRouter, HTTPException
from database import get_database
from models import UrgeLog, UrgeStats
from datetime import datetime
from typing import Optional
from fastapi import Depends
from oauth2 import get_current_user

router = APIRouter()

@router.post("/log")
async def save_urge_log(log: UrgeLog, current_user: dict = Depends(get_current_user)):
    db = get_database()
    urge_logs_collection = db["urge_logs"]
    
    # Force user_id to match authenticated user
    log_dict = log.dict()
    log_dict["user_id"] = current_user["email"]
    
    await urge_logs_collection.insert_one(log_dict)
    return {"message": "Urge log saved successfully"}

@router.get("/stats", response_model=UrgeStats)
async def get_urge_stats(year: Optional[int] = None, current_user: dict = Depends(get_current_user)):
    db = get_database()
    urge_logs_collection = db["urge_logs"]
    
    query = {"user_id": current_user["email"]}
    if year:
        # Match timestamp starting with the year (ISO format: YYYY-MM-DD...)
        query["timestamp"] = {"$regex": f"^{year}"}
    
    cursor = urge_logs_collection.find(query)
    logs = await cursor.to_list(length=1000)
    
    unique_days = set()
    trigger_counts = {}
    total_urges = len(logs)
    
    for log in logs:
        trigger = log.get("trigger", "Unknown")
        trigger_counts[trigger] = trigger_counts.get(trigger, 0) + 1
        
        # Extract date from timestamps (ISO format assumed or consistent string)
        # Assuming log["timestamp"] is ISO like "2023-10-27T..."
        ts = log.get("timestamp")
        if ts:
            # Take only the date part YYYY-MM-DD
            day = ts.split('T')[0]
            unique_days.add(day)
        
    return {
        "trigger_counts": trigger_counts,
        "total_urges": total_urges,
        "total_days": len(unique_days)
    }
