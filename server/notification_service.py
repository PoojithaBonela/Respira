import asyncio
from datetime import datetime, time
import os
from database import get_database
from email_utils import send_daily_insight_email
from context_utils import get_user_context

# We need a way to generate insights outside of the HTTP request context
# I'll create a helper here that mimics the chat_router logic

async def generate_insight_for_user(user_id: str):
    """
    Generate a daily insight for a specific user.
    This logic is adapted from chat_router.py get_daily_insight.
    """
    try:
        context = await get_user_context(user_id)
        
        # Check if user has any data OR profile summary
        has_logs = context['current_smoke_free_days'] > 0 or context['top_triggers']
        has_profile = context.get('profile_summary') is not None
        
        if not has_logs and not has_profile:
            return "Start logging to unlock personalized insights!"

        from groq import Groq
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            return "Keep tracking your progress—every log counts!"
            
        client = Groq(api_key=api_key)
        
        # Decide focus
        import random
        triggers_text = ', '.join(context['top_triggers']) if context['top_triggers'] else 'not yet identified'
        
        focus_options = [
            f"WEEKLY TRENDS: Focus on whether they are improving, steady, or increasing (Current Trend: {context['trend']}).",
            f"STREAKS: Focus on their longest streak of {context['longest_streak']} days.",
            f"PROGRESS: Focus on their progress towards the {context['smoke_free_goal']}-day goal.",
            f"FINANCIAL: Focus on the ${context['money_spent']} spent so far and how it could be savings.",
            f"PATTERNS: Focus on high-risk time ({context['high_risk_time']}) and a small routine to try."
        ]
        
        primary_focus = random.choice(focus_options)
        
        prompt = f"""Generate ONE unique insight based ONLY on the PRIMARY FOCUS.
=== PRIMARY FOCUS ===
{primary_focus}
=== DATA ===
{context['current_smoke_free_days']} smoke-free days, Goal: {context['smoke_free_goal']} days.
Streak: {context['current_streak']}, Longest: {context['longest_streak']}.
Trend: {context['trend']}.
High-risk: {context['high_risk_time']}, Triggers: {triggers_text}.
Money: ${context['money_spent']} spent.

RULES: MAX 20 WORDS. EXACTLY 1 SHORT SENTENCE. Professional and soft tone.
Insight:"""

        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": "You are a concise wellness assistant."},
                {"role": "user", "content": prompt}
            ],
            model="llama-3.1-8b-instant",
            temperature=0.8,
            max_tokens=50
        )
        
        return chat_completion.choices[0].message.content.strip().strip('"\'')
        
    except Exception as e:
        print(f"Error generating insight for {user_id}: {e}")
        return "Keep tracking your progress—every log counts toward your smoke-free goals!"

async def send_daily_notifications():
    """
    Background task that runs once a day to send insights.
    """
    while True:
        try:
            now = datetime.now()
            # "Starting of the day" - let's say 8:00 AM
            # For testing/demo purposes, we might want to trigger it differently,
            # but for a production-like feel, we'll check if we already sent today.
            
            db = get_database()
            users_collection = db["users"]
            
            # Find all users with notifications enabled
            async for user in users_collection.find({"notifications_enabled": True}):
                email = user["email"]
                last_sent = user.get("last_notification_sent_at") # YYYY-MM-DD
                
                today_str = now.strftime("%Y-%m-%d")
                
                if last_sent != today_str:
                    print(f"Sending daily notification to {email}...")
                    insight = await generate_insight_for_user(email)
                    send_daily_insight_email(email, insight)
                    
                    # Update last sent date
                    await users_collection.update_one(
                        {"email": email},
                        {"$set": {"last_notification_sent_at": today_str}}
                    )
            
        except Exception as e:
            print(f"Error in notification background task: {e}")
            
        # Wait for 1 hour before checking again
        # In a real app, you'd use a proper scheduler, but this is a simple robust loop.
        await asyncio.sleep(3600)

def start_notification_service():
    """
    Entry point to start the background task.
    """
    asyncio.create_task(send_daily_notifications())
