from fastapi import APIRouter, HTTPException, Depends
from datetime import date, datetime, timedelta
from typing import List
from database import get_database
from models import CalendarResponse, CalendarDay, CalendarStats, LifetimeStats
from oauth2 import get_current_user
from fastapi import Depends

router = APIRouter()

@router.get("/{year}", response_model=CalendarResponse)
async def get_calendar(year: int, current_user: dict = Depends(get_current_user)):
    db = get_database()
    logs_collection = db["smoke_logs"]
    
    user_id = current_user["email"]

    # 1. Fetch all logs for the year for this user
    # 1. Fetch all logs for the year for this user
    start_date = f"{year}-01-01"
    end_date = f"{year}-12-31"
    
    cursor = logs_collection.find({
        "user_id": user_id,
        "date": {"$gte": start_date, "$lte": end_date}
    })
    
    logs = await cursor.to_list(length=366)
    logs_map = {log["date"]: log["cigarettes"] for log in logs}

    # Fetch the FIRST EVER log to determine start date of usage
    first_log = await logs_collection.find_one(
        {"user_id": user_id},
        sort=[("date", 1)]
    )
    first_log_date = first_log["date"] if first_log else None

    # 2. Generate all days in the year and determine status
    calendar_days = []
    today = datetime.now().date()
    today_str = today.strftime("%Y-%m-%d")
    
    # Determine Usage Start Date
    # STRICT RULE: Tracking starts ONLY from the first log date.
    # App installation date (created_at) is ignored for "smoke-free" calculations.
    effective_start_date = None
    if first_log_date:
        effective_start_date = datetime.strptime(first_log_date, "%Y-%m-%d").date()

    current_date = date(year, 1, 1)
    last_date = date(year, 12, 31)
    
    smoke_free_count = 0
    days_smoked_count = 0
    total_cigarettes = 0
    
    while current_date <= last_date:
        date_str = current_date.strftime("%Y-%m-%d")
        cigarettes_count = logs_map.get(date_str, 0)
        
        # Determine Status
        if current_date > today:
             status = "future"
        elif current_date == today:
            # Today: Red if smoked, otherwise grey (pending completion of day)
            if cigarettes_count > 0:
                status = "smoked"
                total_cigarettes += cigarettes_count
                days_smoked_count += 1
            else:
                status = "future"
        elif effective_start_date is None or current_date < effective_start_date:
            # Before first log (or no logs yet): Dark Grey
            status = "untracked"
        elif cigarettes_count > 0:
            status = "smoked"
            total_cigarettes += cigarettes_count
            days_smoked_count += 1
        else:
            # Past date, within usage period, NO cigarettes => Smoke Free (Green)
            status = "smoke-free"
            smoke_free_count += 1
            
        calendar_days.append(CalendarDay(date=date_str, status=status, cigarettes=cigarettes_count))
        current_date += timedelta(days=1)

    # 3. Calculate longest streak (consecutive smoke-free days)
    # Note: We should probably consider days before this year to get accurate streak if the year starts smoke-free
    # But the request says "calculate and return ... based on calendar data for the given year" (implied)
    # Let's calculate it based on the data points we have in the response list for simplicity/request scope
    
    longest_streak = 0
    current_streak = 0
    
    for day in calendar_days:
        if day.status == "smoke-free":
            current_streak += 1
            if current_streak > longest_streak:
                longest_streak = current_streak
        elif day.status == "smoked":
            current_streak = 0
        # future days don't break or add to streak in a past/current context, 
        # but for simplicity, we stop counting at today.
        if day.date == today_str:
            break

    # 4. Calculate monthly totals
    money_spent = days_smoked_count * 20  # Approx cost
    monthly_counts = [0] * 12
    first_log_month = -1
    
    min_year = datetime.now().year
    if first_log_date:
        first_log_dt = datetime.strptime(first_log_date, "%Y-%m-%d")
        min_year = first_log_dt.year
        if first_log_dt.year == year:
            first_log_month = first_log_dt.month - 1 # 0-indexed
        elif first_log_dt.year < year:
            first_log_month = 0 # Started previous year, so show all months
            
        for d_str, count in logs_map.items():
            d_obj = datetime.strptime(d_str, "%Y-%m-%d")
            monthly_counts[d_obj.month - 1] += count

    return CalendarResponse(
        calendar_days=calendar_days,
        stats=CalendarStats(
            smoke_free_days=smoke_free_count,
            days_smoked=days_smoked_count,
            longest_streak=longest_streak,
            money_spent=money_spent,
            total_cigarettes=total_cigarettes,
            monthly_counts=monthly_counts,
            first_log_month=first_log_month,
            min_year=min_year
        )
    )

@router.get("/stats/lifetime", response_model=LifetimeStats)
async def get_lifetime_stats(current_user: dict = Depends(get_current_user)):
    db = get_database()
    logs_collection = db["smoke_logs"]
    
    # Fetch ALL logs
    cursor = logs_collection.find({"user_id": current_user["email"]}).sort("date", 1)
    logs = await cursor.to_list(length=10000)
    
    if not logs:
        return LifetimeStats(current_streak=0, longest_streak=0, total_cigarettes=0)

    # 1. Identify Start Date and Smoked Set
    first_log_date = datetime.strptime(logs[0]["date"], "%Y-%m-%d").date()
    today = datetime.now().date()
    
    smoked_dates = set()
    total_cigarettes = 0
    for log in logs:
        if log["cigarettes"] > 0:
            smoked_dates.add(datetime.strptime(log["date"], "%Y-%m-%d").date())
            total_cigarettes += log["cigarettes"]
            
    # 2. Iterate day by day from Start Date to Yesterday (exclude Today from completed history)
    # If today is the start date, loop range is empty -> streak 0. Correct.
    
    longest_streak = 0
    current_iter_streak = 0
    
    # Calculate end_date (Yesterday)
    end_date = today - timedelta(days=1)
    
    # Standard Loop
    d = first_log_date
    while d <= end_date:
        if d in smoked_dates:
            current_iter_streak = 0
        else:
            current_iter_streak += 1
            if current_iter_streak > longest_streak:
                longest_streak = current_iter_streak
        d += timedelta(days=1)
        
    # 3. Calculate "Current Streak" (Streak ending yesterday)
    # It is effectively the value of current_iter_streak after the loop finishes.
    # UNLESS we want to be fancy about "broken today".
    # But usually current streak = consecutive days up to now.
    current_streak = current_iter_streak
    
    # If the user smoked TODAY, usually "current streak" is technically 0?
    # Or does it reset tomorrow?
    # Typically: You have a 5 day streak. You smoke today. Streak is broken -> 0.
    if today in smoked_dates:
        current_streak = 0
        
    return LifetimeStats(
        current_streak=current_streak, 
        longest_streak=longest_streak, 
        total_cigarettes=total_cigarettes
    )
