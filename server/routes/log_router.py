from fastapi import APIRouter, HTTPException
from database import get_database
from models import SmokeLog
from datetime import datetime
from fastapi import Depends
from oauth2 import get_current_user

router = APIRouter()

@router.post("/")
async def save_log(log: SmokeLog, current_user: dict = Depends(get_current_user)):
    db = get_database()
    logs_collection = db["smoke_logs"]

    # Check if a log already exists for this user and date
    user_id = current_user["email"]
    existing_log = await logs_collection.find_one({
        "user_id": user_id,
        "date": log.date
    })

    if existing_log:
        # Update existing log
        await logs_collection.update_one(
            {"_id": existing_log["_id"]},
            {"$set": {"cigarettes": log.cigarettes, "triggers": log.triggers}}
        )
        return {"message": "Log updated successfully"}
    else:
        # Insert new log
        log_data = log.dict()
        log_data["user_id"] = user_id
        await logs_collection.insert_one(log_data)
        return {"message": "Log created successfully"}

@router.get("/stats")
async def get_log_stats(date: str = None, current_user: dict = Depends(get_current_user)):
    db = get_database()
    logs_collection = db["smoke_logs"]

    if not date:
        date = datetime.now().strftime("%Y-%m-%d")

    # Fetch logs
    user_id = current_user["email"]
    today_log = await logs_collection.find_one({"user_id": user_id, "date": date})
    
    # Fetch LAST log (any date before today)
    last_log_cursor = logs_collection.find({
        "user_id": user_id, 
        "date": {"$lt": date}
    }).sort("date", -1).limit(1)
    
    last_logs = await last_log_cursor.to_list(length=1)
    last_log = last_logs[0] if last_logs else None

    today_count = today_log["cigarettes"] if today_log else 0
    last_log_count = last_log["cigarettes"] if last_log else 0
    last_log_date = last_log["date"] if last_log else None

    # Calculate percentage change
    if last_log_count == 0:
        if today_count > 0:
            percentage_change = 100 # Considered 100% increase if starting from 0
            is_increase = True
        else:
            percentage_change = 0
            is_increase = False # No change
    else:
        change = today_count - last_log_count
        percentage_change = round((abs(change) / last_log_count) * 100)
        is_increase = change > 0

    return {
        "today_count": today_count,
        "last_log_count": last_log_count,
        "last_log_date": last_log_date,
        "percentage_change": percentage_change,
        "is_increase": is_increase,
        "has_logged_today": today_log is not None,
        "today_triggers": today_log.get("triggers", []) if today_log else []
    }
