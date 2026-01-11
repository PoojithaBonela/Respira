from fastapi import APIRouter, HTTPException, Depends
from database import get_database
from pydantic import BaseModel
from oauth2 import get_current_user
from typing import Optional
from models import UserProfile

router = APIRouter()

class UserGoal(BaseModel):
    smoke_free_goal: int # Target cumulative smoke-free days

class UserProfileUpdate(BaseModel):
    name: str

class UserNotificationsUpdate(BaseModel):
    enabled: bool

@router.post("/profile")
async def save_onboarding_profile(profile: UserProfile, current_user: dict = Depends(get_current_user)):
    db = get_database()
    users_collection = db["users"]
    
    # Generate AI Summary
    summary_text = (
        f"Age: {profile.age_range}, Gender: {profile.gender}. "
        f"Smokes {profile.smoking_frequency} cigs/day for {profile.smoking_duration}. "
        f"Triggers: {', '.join(profile.triggers)}. "
        f"Reasons: {', '.join(profile.reasons)}. "
        f"Stress Smoker: {profile.stress_smoking}. "
        f"Quit Attempts: {profile.quit_attempts}. "
        f"Goal: {profile.current_goal}."
    )
    profile.summary = summary_text
    
    # Update user document with nested profile object
    await users_collection.update_one(
        {"email": current_user["email"]},
        {"$set": {"user_profile": profile.dict()}}
    )
    
    return {"status": "success", "message": "Profile saved", "summary": summary_text}

@router.post("/goal")
async def save_user_goal(goal: UserGoal, current_user: dict = Depends(get_current_user)):
    db = get_database()
    users_collection = db["users"]
    
    # Update or insert user goal
    from datetime import datetime
    today_str = datetime.now().strftime("%Y-%m-%d")
    
    await users_collection.update_one(
        {"email": current_user["email"]}, # Strictly use authenticated user email
        {"$set": {
            "smoke_free_goal": goal.smoke_free_goal,
            "goal_start_date": today_str
        }},
        upsert=True
    )
    return {"status": "success", "goal": goal.smoke_free_goal}

@router.get("/settings") # Removed {user_id}
async def get_user_settings(current_user: dict = Depends(get_current_user)):
    db = get_database()
    users_collection = db["users"]
    
    user = await users_collection.find_one({"email": current_user["email"]})
    if not user:
        return {"smoke_free_goal": 7} # Default to 1 week
    
    return {
        "smoke_free_goal": user.get("smoke_free_goal", 7),
        "cigarette_cost": user.get("cigarette_cost", ""),
        "currency": user.get("currency", "INR"),
        "notifications_enabled": user.get("notifications_enabled", False)
    }

@router.get("/profile") # Removed {user_id}
async def get_user_profile(current_user: dict = Depends(get_current_user)):
    # Simply return current user data from token/db context
    return {
        "name": current_user.get("name", "User"),
        "email": current_user.get("email", ""),
        "auth_provider": current_user.get("auth_provider", "email")
    }

@router.put("/profile")
async def update_user_profile(profile: UserProfileUpdate, current_user: dict = Depends(get_current_user)):
    db = get_database()
    users_collection = db["users"]
    
    # Update user profile
    result = await users_collection.update_one(
        {"email": current_user["email"]}, # Strict security
        {"$set": {"name": profile.name}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"status": "success", "message": "Profile updated"}

class UserCostUpdate(BaseModel):
    cigarette_cost: str
    currency: str

@router.put("/settings")
async def update_user_settings(settings: UserCostUpdate, current_user: dict = Depends(get_current_user)):
    db = get_database()
    users_collection = db["users"]
    
    await users_collection.update_one(
        {"email": current_user["email"]},
        {"$set": {
            "cigarette_cost": settings.cigarette_cost,
            "currency": settings.currency
        }}
    )
    return {"status": "success"}

@router.delete("/data")
async def delete_all_data(current_user: dict = Depends(get_current_user)):
    """
    Delete all user activity data while preserving the account and questionnaire answers.
    Preserves: email, name, password, user_profile, smoke_free_goal, cigarette_cost, currency
    Deletes: smoke_logs, game_sessions, urge_logs, chat_history
    """
    db = get_database()
    user_id = current_user["email"]
    
    # Delete all activity data from various collections
    await db["smoke_logs"].delete_many({"user_id": user_id})
    await db["game_sessions"].delete_many({"user_id": user_id})
    await db["urge_logs"].delete_many({"user_id": user_id})
    await db["chat_history"].delete_many({"user_id": user_id})
    
    return {
        "status": "success",
        "message": "All activity data has been deleted. Your account and questionnaire answers remain intact."
    }

@router.delete("/account")
async def delete_account(current_user: dict = Depends(get_current_user)):
    """
    Completely delete the user account and all associated data.
    This action is irreversible.
    """
    db = get_database()
    user_id = current_user["email"]
    
    # Delete all data from all collections
    await db["smoke_logs"].delete_many({"user_id": user_id})
    await db["game_sessions"].delete_many({"user_id": user_id})
    await db["urge_logs"].delete_many({"user_id": user_id})
    await db["chat_history"].delete_many({"user_id": user_id})
    
    # Delete the user account itself
    result = await db["users"].delete_one({"email": user_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "status": "success",
        "message": "Your account and all associated data have been permanently deleted."
    }

@router.put("/notifications")
async def update_notifications(data: UserNotificationsUpdate, current_user: dict = Depends(get_current_user)):
    db = get_database()
    users_collection = db["users"]
    
    await users_collection.update_one(
        {"email": current_user["email"]},
        {"$set": {"notifications_enabled": data.enabled}}
    )
    return {"status": "success", "notifications_enabled": data.enabled}

@router.post("/test-notification")
async def test_notification(current_user: dict = Depends(get_current_user)):
    """
    Manually trigger a daily insight email for the logged-in user to verify setup.
    """
    from notification_service import generate_insight_for_user
    from email_utils import send_daily_insight_email
    
    email = current_user["email"]
    insight = await generate_insight_for_user(email)
    send_daily_insight_email(email, insight)
    
    return {
        "status": "success", 
        "message": f"Test notification sent to {email}",
        "insight_sent": insight
    }

