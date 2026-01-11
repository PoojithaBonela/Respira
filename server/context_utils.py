from database import get_database
import pandas as pd
from datetime import datetime, timedelta
from collections import Counter

async def get_user_context(user_id: str) -> dict:
    """
    Fetch comprehensive user data to provide full context for AI insights.
    user_id: The user's EMAIL (since that's how we key users in auth).
    """
    db = get_database()
    
    context = {
        'smoke_free_goal': 7,
        'current_smoke_free_days': 0,
        'total_cigarettes': 0,
        'days_logged': 0,
        'days_smoked': 0,
        'current_streak': 0,
        'longest_streak': 0,
        'worst_day': None,
        'best_day': None,
        'high_risk_time': 'Unknown',
        'top_triggers': [],
        'weekly_avg': 0,
        'last_week_avg': 0,
        'trend': 'steady',
        'urge_support_uses': 0,
        'game_sessions': 0,
        'reduction_percent': 0,
        'money_spent': 0,
        'consistency_score': 0,
        'unlocked_rewards_count': 0,
        'next_reward_name': None,
        'total_focus_points': 0,
        'profile_summary': None
    }
    
    # Get user document (Query by EMAIL)
    # The user_id passed from tokens is the email
    user_doc = await db["users"].find_one({"email": user_id}) 
    if user_doc:
        if "smoke_free_goal" in user_doc:
            context['smoke_free_goal'] = user_doc["smoke_free_goal"]
            
        if "user_profile" in user_doc:
            p = user_doc["user_profile"]
            # Safe access to lists with defaults
            triggers_list = p.get("triggers", [])
            if triggers_list is None: triggers_list = []
            
            reasons_list = p.get("reasons", [])
            if reasons_list is None: reasons_list = []
            
            triggers_str = ", ".join(triggers_list)
            reasons_str = ", ".join(reasons_list)
            
            profile_summary = p.get("summary", "")
            if not profile_summary:
                profile_summary = (
                    f"User is {p.get('age_range', 'unknown age')}, {p.get('gender', 'unknown gender')}. "
                    f"Smokes {p.get('smoking_frequency', 'unknown freq')} for {p.get('smoking_duration', 'unknown time')}. "
                    f"Triggers: {triggers_str}. Reasons: {reasons_str}. "
                    f"Goal: {p.get('current_goal', 'Quit')}."
                )
            context['profile_summary'] = profile_summary
    
    # Get ALL smoke logs
    smoke_logs = await db["smoke_logs"].find({"user_id": user_id}).to_list(length=10000)
    if smoke_logs:
        df = pd.DataFrame(smoke_logs)
        df['date'] = pd.to_datetime(df['date'])
        df = df.sort_values('date')
        
        context['days_logged'] = len(df)
        context['total_cigarettes'] = int(df['cigarettes'].sum())
        context['current_smoke_free_days'] = int((df['cigarettes'] == 0).sum())
        context['days_smoked'] = int((df['cigarettes'] > 0).sum())
        context['money_spent'] = context['days_smoked'] * 20 # Replicate calendar_router logic
        
        # Find worst and best days
        if not df.empty:
            worst_idx = df['cigarettes'].idxmax()
            context['worst_day'] = df.loc[worst_idx, 'date'].strftime('%A') if pd.notna(worst_idx) else None
            
        # Calculate current streak
        streak = 0
        for cigs in df['cigarettes'][::-1]:
            if cigs == 0:
                streak += 1
            else:
                break
        context['current_streak'] = streak
        
        # Calculate longest streak
        max_streak = 0
        current = 0
        for cigs in df['cigarettes']:
            if cigs == 0:
                current += 1
                max_streak = max(max_streak, current)
            else:
                current = 0
        context['longest_streak'] = max_streak
        
        # Weekly comparison (Calendar weeks: Sunday to Saturday)
        now = datetime.now()
        # Find the start of the current week (Sunday)
        # weekday() is 0 for Monday, 6 for Sunday
        # To get Sunday: (now.weekday() + 1) % 7 days ago
        days_since_sunday = (now.weekday() + 1) % 7
        start_of_this_week = (now - timedelta(days=days_since_sunday)).replace(hour=0, minute=0, second=0, microsecond=0)
        start_of_last_week = start_of_this_week - timedelta(days=7)
        end_of_last_week = start_of_this_week - timedelta(seconds=1)

        # Current week: From this Sunday 00:00 to now
        this_week_df = df[df['date'] >= start_of_this_week]
        # Last week: From previous Sunday 00:00 to Saturday 23:59:59
        last_week_df = df[(df['date'] >= start_of_last_week) & (df['date'] <= end_of_last_week)]
        
        this_week = this_week_df['cigarettes'].mean() if len(this_week_df) > 0 else 0
        last_week = last_week_df['cigarettes'].mean() if len(last_week_df) > 0 else 0
        
        context['weekly_avg'] = round(this_week, 1) if pd.notna(this_week) else 0
        context['last_week_avg'] = round(last_week, 1) if pd.notna(last_week) else 0
        
        if last_week > 0 and this_week < last_week:
            context['trend'] = 'improving'
            context['reduction_percent'] = round(((last_week - this_week) / last_week) * 100)
        elif last_week > 0 and this_week > last_week:
            context['trend'] = 'increasing'
        else:
            context['trend'] = 'steady'
        
        # Get top triggers
        if 'triggers' in df.columns:
            all_triggers = []
            for triggers_list in df['triggers']:
                if isinstance(triggers_list, list):
                    all_triggers.extend(triggers_list)
            if all_triggers:
                counts = Counter(all_triggers)
                context['top_triggers'] = [f"{t} ({c}x)" for t, c in counts.most_common(3)]

    # Get urge logs
    urge_logs = await db["urge_logs"].find({"user_id": user_id}).to_list(length=1000)
    context['urge_support_uses'] = len(urge_logs)
    if urge_logs:
        df_urge = pd.DataFrame(urge_logs)
        if 'timestamp' in df_urge.columns:
            df_urge['timestamp'] = pd.to_datetime(df_urge['timestamp'])
            df_urge['hour'] = df_urge['timestamp'].dt.hour
            if not df_urge['hour'].empty:
                peak_hour = df_urge['hour'].mode().iloc[0]
                if peak_hour >= 18:
                    context['high_risk_time'] = f"Evening ({peak_hour-12 if peak_hour > 12 else 12}PM)"
                elif peak_hour >= 12:
                    context['high_risk_time'] = f"Afternoon ({peak_hour-12 if peak_hour > 12 else 12}PM)"
                else:
                    context['high_risk_time'] = f"Morning ({peak_hour}AM)"
    
    # Get game sessions
    game_sessions = await db["game_sessions"].find({"user_id": user_id}).to_list(length=1000)
    context['game_sessions'] = len(game_sessions)
    context['total_focus_points'] = sum(s.get('points_earned', 0) for s in game_sessions)
    
    # Calculate Consistency Score (replicate insights_router.py)
    # Base Score: Progress vs Goal (scales 0-80)
    base_score = 0
    if context['smoke_free_goal'] > 0:
        base_score = min(80, (context['current_smoke_free_days'] / context['smoke_free_goal']) * 80)
    
    streak_bonus = 0
    if context['current_streak'] >= 3: streak_bonus += 5
    if context['current_streak'] >= 7: streak_bonus += 5
    
    engagement_bonus = context['urge_support_uses'] + context['game_sessions']
    
    score = int(base_score + streak_bonus + engagement_bonus)
    # Cap at 100
    context['consistency_score'] = min(max(0, score), 100)

    # Rewards calculation
    milestones = [
        {"name": "First Step", "value": 3, "tag": "streak"},
        {"name": "One Week Strong", "value": 7, "tag": "streak"},
        {"name": "Consistency", "value": 14, "tag": "streak"},
        {"name": "One Month Clear", "value": 30, "tag": "streak"},
        {"name": "Paused Instead", "value": 5, "tag": "support"},
        {"name": "Choosing Better", "value": 10, "tag": "support"},
        {"name": "Focused Starter", "value": 1000, "tag": "points"}
    ]
    
    earned = 0
    next_r = None
    for m in milestones:
        is_earned = False
        if m["tag"] == "streak" and context['current_streak'] >= m["value"]: is_earned = True
        elif m["tag"] == "support" and context['urge_support_uses'] >= m["value"]: is_earned = True
        elif m["tag"] == "points" and context['total_focus_points'] >= m["value"]: is_earned = True
        
        if is_earned:
            earned += 1
        elif next_r is None:
            next_r = m["name"]
    
    context['unlocked_rewards_count'] = earned
    context['next_reward_name'] = next_r
    
    return context
