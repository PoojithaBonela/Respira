from fastapi import APIRouter, HTTPException
from database import get_database
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import List, Dict, Any
from fastapi import Depends
from oauth2 import get_current_user
from context_utils import get_user_context

router = APIRouter()

@router.get("/all")
async def get_all_insights(current_user: dict = Depends(get_current_user)):
    db = get_database()
    user_id = current_user["email"]
    logs_collection = db["smoke_logs"]
    urge_logs_collection = db["urge_logs"]
    game_sessions_collection = db["game_sessions"]
    
    try:
        # 1. Fetch Data
        smoke_logs = await logs_collection.find({"user_id": user_id}).to_list(length=10000)
        urge_logs = await urge_logs_collection.find({"user_id": user_id}).to_list(length=1000)
        game_sessions = await game_sessions_collection.find({"user_id": user_id}).to_list(length=1000)
        
        # DEBUG: Print counts
        print(f"[DEBUG] user_id: {user_id}")
        print(f"[DEBUG] urge_logs count: {len(urge_logs)}")
        print(f"[DEBUG] game_sessions count: {len(game_sessions)}")
        
        if not smoke_logs:
            return {
                "has_data": False,
                "message": "Start logging to see insights!"
            }

        # Prepare DataFrames
        df_smoke = pd.DataFrame(smoke_logs)
        df_smoke['date'] = pd.to_datetime(df_smoke['date'])
        df_smoke = df_smoke.sort_values('date')
        
        # --- FEATURE 1: TREND (Calendar Weekly Bins for Current Month) ---
        now = datetime.now()
        first_day_curr_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        
        import calendar
        last_day_num = calendar.monthrange(now.year, now.month)[1]
        last_day_curr_month = now.replace(day=last_day_num, hour=0, minute=0, second=0, microsecond=0)

        # Filter logs for current month
        df_curr_month = df_smoke[df_smoke['date'] >= first_day_curr_month].copy()
        
        # Determine number of calendar weeks in this month
        # %U: Week number of year (Sunday as first day of week, 00..53)
        first_week_id = int(first_day_curr_month.strftime('%U'))
        last_week_id = int(last_day_curr_month.strftime('%U'))
        
        # Handle year rollover if first_week_id is high and last_week_id is low (unlikely for a single month but safe)
        if last_week_id < first_week_id:
            num_weeks = (53 - first_week_id) + last_week_id + 1
        else:
            num_weeks = last_week_id - first_week_id + 1
            
        weekly_counts = [0] * num_weeks
        
        if not df_curr_month.empty:
            for _, row in df_curr_month.iterrows():
                curr_week_id = int(row['date'].strftime('%U'))
                if curr_week_id < first_week_id: # Year rollover
                    idx = (53 - first_week_id) + curr_week_id + 1
                else:
                    idx = curr_week_id - first_week_id
                
                if 0 <= idx < num_weeks:
                    weekly_counts[idx] += int(row['cigarettes'])

        smoothed_trend = weekly_counts
        month_labels = [f"Week {i + 1}" for i in range(num_weeks)]

        # --- FEATURE 2: REDUCTION ---
        try:
            monthly_avg = df_smoke.set_index('date')['cigarettes'].resample('ME').mean().fillna(0)
        except:
            monthly_avg = df_smoke.set_index('date')['cigarettes'].resample('M').mean().fillna(0)

        reduction_rate = 0
        status_text = "Keep logging—your monthly comparison will appear here soon!"
        if len(monthly_avg) >= 2:
            curr = monthly_avg.iloc[-1]
            prev = monthly_avg.iloc[-2]
            if prev > 0:
                reduction_rate = max(0, round(((prev - curr) / prev) * 100, 1))
                status_text = f"You're {reduction_rate}% lower than last month!" if reduction_rate > 0 else "Staying steady."
            elif curr == 0:
                reduction_rate = 100
                status_text = "Perfect reduction!"

        # --- FEATURE 3: SMOKE-FREE GOAL PREDICTION (Light ML) ---
        # 1. Get User Goal & Start Date
        user_doc = await db["users"].find_one({"email": user_id})
        target_goal = 7
        is_goal_set = False
        goal_start_date = None
        
        if user_doc:
            if "smoke_free_goal" in user_doc:
                target_goal = user_doc["smoke_free_goal"]
                is_goal_set = True
            if "goal_start_date" in user_doc:
                goal_start_date = user_doc["goal_start_date"]

        # 2. Current Progress (Current Streak of Smoke-Free Days SINCE goal_start_date)
        current_streak = 0
        
        # Filter df_smoke based on goal_start_date if it exists
        df_relevant = df_smoke
        if goal_start_date and not df_smoke.empty:
            # goal_start_date string to datetime
            start_dt = pd.to_datetime(goal_start_date)
            df_relevant = df_smoke[df_smoke['date'] >= start_dt]

        if not df_relevant.empty:
            for count in df_relevant['cigarettes'][::-1]:
                if count == 0:
                    current_streak += 1
                else:
                    break
                    
        # --- AUTO-INCREMENT GOAL LOGIC ---
        GOAL_LADDER = [7, 14, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330, 365]
        
        if is_goal_set and current_streak >= target_goal:
            next_goal = target_goal
            for g in GOAL_LADDER:
                if g > target_goal:
                    next_goal = g
                    break
            
            if next_goal > target_goal:
                # Update ONLY smoke_free_goal, keep goal_start_date to preserve cumulative progress
                await db["users"].update_one(
                    {"email": user_id},
                    {"$set": {"smoke_free_goal": next_goal}}
                )
                target_goal = next_goal
        
        remaining_days_needed = max(0, target_goal - current_streak)
        
        if not df_smoke.empty:
            recent_history = df_smoke.tail(21)
            # Use streak probability or general history? 
            # Let's use history for probability of a day being smoke-free
            prob_smoke_free = recent_history['cigarettes'].apply(lambda x: 1 if x == 0 else 0).mean()
            prob_smoke_free = max(0.1, prob_smoke_free)
            
            days_to_wait = remaining_days_needed / prob_smoke_free
            projected_date = datetime.now() + timedelta(days=int(days_to_wait))
            
            if remaining_days_needed == 0:
                goal_date_str = "Goal reached!"
                probability = 100
            else:
                goal_date_str = projected_date.strftime('%b %d, %Y')
                probability = int(prob_smoke_free * 100)
        else:
            goal_date_str = "Start logging"
            probability = 0

        path = {
            "current_progress": int(current_streak),
            "smoke_free_goal": int(target_goal),
            "goal_date": goal_date_str,
            "probability": probability,
            "is_goal_set": is_goal_set
        }
        
        # --- FEATURE 4 & 5 & 6...
        # (Assuming existing logic for others follows)
        # But for now let's just make sure we return the structure
        
        # Since I'm wrapping, I need to complete the function body for the tool to apply correctly
        # I'll request to view the rest of the file first to make sure I don't deleting anything important below.

        # --- FEATURE 4: HIGH-RISK MOMENTS ---
        high_risk_time = "Not enough data"
        high_risk_day = None
        
        # 1. Peak Urge TIME (from urge_logs - most accurate for timing)
        if urge_logs:
            df_urge = pd.DataFrame(urge_logs)
            df_urge['timestamp'] = pd.to_datetime(df_urge['timestamp'])
            df_urge['hour'] = df_urge['timestamp'].dt.hour
            peak_hour = df_urge['hour'].mode().iloc[0]
            
            if peak_hour >= 18:
                high_risk_time = f"After {peak_hour-12 if peak_hour > 12 else 12} PM"
            elif peak_hour >= 12:
                high_risk_time = f"Around {peak_hour-12 if peak_hour > 12 else 12} PM"
            else:
                high_risk_time = f"Around {peak_hour} AM"
        
        # 2. Peak Smoking DAY OF MONTH (from smoke_logs - which calendar day you smoke most)
        if not df_smoke.empty:
            df_smoked_days = df_smoke[df_smoke['cigarettes'] > 0].copy()
            if not df_smoked_days.empty:
                df_smoked_days['day_of_month'] = df_smoked_days['date'].dt.day
                # Group by day and sum cigarettes
                day_totals = df_smoked_days.groupby('day_of_month')['cigarettes'].sum()
                peak_day = day_totals.idxmax()
                high_risk_day = int(peak_day)

        # --- FEATURE 5: PATTERN AWARENESS (Triggers) ---
        top_triggers = []
        if not df_smoke.empty and 'triggers' in df_smoke.columns:
            # Flatten list of triggers (some rows might have NaN or empty lists)
            all_triggers = []
            for triggers_list in df_smoke['triggers']:
                if isinstance(triggers_list, list):
                    all_triggers.extend(triggers_list)
            
            if all_triggers:
                from collections import Counter
                counts = Counter(all_triggers)
                top_triggers = [t for t, _ in counts.most_common(3)]

        # --- FEATURE 6: CONSISTENCY SCORE ---
        # Total Smoke-Free Days (used for consistency score)
        current_smoke_free_days = (df_smoke['cigarettes'] == 0).sum()
        
        # 1. Base Score: Progress vs Goal (capped at 80 to leave room for bonuses)
        base_score = 0
        if target_goal > 0:
            base_score = min(80, (current_smoke_free_days / target_goal) * 80)  # Scales 0-80
        
        # 2. Adjustments
        streak_bonus = 0
        # current_streak is already calculated above
        
        if current_streak >= 3: streak_bonus += 5
        if current_streak >= 7: streak_bonus += 5
        
        engagement_bonus = 0
        # Make bonus dynamic: 1 point per use (UNCAPPED for debug)
        if urge_logs:
            engagement_bonus += len(urge_logs)  # No cap for now
        if game_sessions:
            engagement_bonus += len(game_sessions)  # No cap for now
        
        # DEBUG: Print BEFORE capping
        print(f"[DEBUG] RAW values: base={base_score}, streak={streak_bonus}, engage={engagement_bonus}, total={base_score + streak_bonus + engagement_bonus}")
        
        score = int(base_score + streak_bonus + engagement_bonus)
        score = min(max(0, score), 100)
        
        # DEBUG: Print score breakdown
        print(f"[DEBUG] base_score: {base_score}, streak_bonus: {streak_bonus}, engagement_bonus: {engagement_bonus}")
        print(f"[DEBUG] FINAL consistency score: {score}")
        
        # Supportive Milestone Labels (no comparison to others)
        standing = "Just Getting Started"
        if score > 80: standing = "Incredible Consistency! 🌟"
        elif score > 60: standing = "Strong Progress"
        elif score > 40: standing = "Building Momentum"
        elif score > 20: standing = "On the Right Track"

        # Return results
        return {
            "has_data": True,
            "trend": {
                "data": smoothed_trend,
                "labels": month_labels
            },
            "reduction": {
                "rate": reduction_rate,
                "status": status_text
            },
            "path": path, # Use the pre-constructed path object
            "patterns": {
                "high_risk_time": high_risk_time,
                "high_risk_day": high_risk_day,
                "top_triggers": top_triggers
            },
            "consistency": {
                "score": score,
                "standing": standing
            }
        }
    except Exception as e:
        import traceback
        print(f"Error in insights: {e}")
        traceback.print_exc()
        return {
            "error": str(e),
            "has_data": False
        }
