from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database import get_database
from dotenv import load_dotenv
import os
import re
from typing import Optional
from datetime import datetime
from models import ChatMessage
from fastapi import Depends
from oauth2 import get_current_user

# Load environment variables
load_dotenv()

router = APIRouter()

# Request/Response Models
class ChatRequest(BaseModel):
    # user_id: str  <-- Removed, derived from token
    message: str

class ChatResponse(BaseModel):
    response: str
    filtered: bool

# Keywords that indicate out-of-scope or potentially harmful queries
MEDICAL_KEYWORDS = [
    'prescription', 'medication', 'medicine', 'drug', 'dosage', 'doctor',
    'diagnosis', 'treat', 'cure', 'nicotine patch', 'nicotine gum', 'varenicline',
    'bupropion', 'chantix', 'wellbutrin', 'side effect', 'withdrawal symptom',
    'cancer', 'lung disease', 'copd', 'asthma', 'heart disease'
]

HARMFUL_KEYWORDS = [
    'suicide', 'kill myself', 'self-harm', 'hurt myself', 'end my life',
    'overdose', 'poison', 'dangerous'
]

OFF_TOPIC_PATTERNS = [
    r'\b(weather|capital|president|prime minister|movie|music|sports|game|politics)\b',
    r'\b(recipe|cook|food|restaurant)\b',
    r'\b(code|programming|python|javascript|software)\b',
    r'\b(stock|crypto|bitcoin|investment)\b'
]

# Fallback responses
FALLBACK_RESPONSES = {
    'medical': "I appreciate you reaching out, but I'm not qualified to give medical advice. For questions about medications, treatments, or health concerns, please consult a healthcare professional. I'm here to help you reflect on your smoking patterns and motivations instead.",
    'harmful': "I'm concerned about what you shared. If you're going through a difficult time, please reach out to a crisis helpline or mental health professional. You're not alone, and support is available.",
    'off_topic': "I'm here specifically to help you with your smoking journey—understanding patterns, managing urges, and staying motivated. Is there something about your quit journey I can help with?",
    'empty': "I didn't catch that. What would you like to know about your smoking habits or progress?",
    'ok_neutral': [
        "I'm here whenever you need to talk or reflect on something.",
        "Take your time. I'll be here if another urge or thought comes up.",
        "Noted. We can just sit with that for a moment.",
        "I'm listening. Is there anything specific about your patterns you're noticing right now?"
    ]
}

def is_message_allowed(message: str) -> tuple[bool, str]:
    """
    Check if the message is within scope.
    Returns (is_allowed, fallback_key or None)
    """
    lower_msg = message.lower()
    
    # Check for empty
    if not message.strip():
        return False, 'empty'
    
    # Check for harmful content first (safety priority)
    for keyword in HARMFUL_KEYWORDS:
        if keyword in lower_msg:
            return False, 'harmful'
    
    # Check for medical queries
    for keyword in MEDICAL_KEYWORDS:
        if keyword in lower_msg:
            return False, 'medical'
    
    # Check for off-topic patterns
    for pattern in OFF_TOPIC_PATTERNS:
        if re.search(pattern, lower_msg, re.IGNORECASE):
            return False, 'off_topic'
    
    return True, None

from context_utils import get_user_context

def build_prompt(user_message: str, context: dict, history: list = []) -> str:
    """
    Build a controlled prompt for Gemini with system instructions and user context.
    """
    history_text = ""
    if history:
        history_items = []
        for msg in history[-6:]: # Last 3 pairs
            role = "Companion" if msg['role'] == 'assistant' else "User"
            history_items.append(f"{role}: {msg['content']}")
        history_text = "\nRECENT CONVERSATION:\n" + "\n".join(history_items)

    user_context_summary = f"""USER CONTEXT:
- Onboarding Profile: {context['profile_summary'] if context.get('profile_summary') else "Not provided (new user)"}
- Smoke-free goal: {context['smoke_free_goal']} days
- Current smoke-free days: {context['current_smoke_free_days']}
- Goal progress: {context['current_smoke_free_days']}/{context['smoke_free_goal']} days
- Current streak: {context['current_streak']} days
- Longest streak: {context['longest_streak']} days
- Trend: {context['trend']} ({context['reduction_percent']}% reduction)
- High-risk time: {context['high_risk_time']}
- Top triggers via Logs: {', '.join(context['top_triggers']) if context['top_triggers'] else 'Not identified yet'}"""

    full_prompt = f"""{user_context_summary}

{history_text}

USER MESSAGE: {user_message}

Respond following the conversation rules. Introduce a NEW angle or perspective that hasn't been discussed in the recent messages. IF the user's profile is available, use it to personalize your tone and advice (e.g. mention their specific triggers or reasons)."""
    
    return full_prompt

@router.post("", response_model=ChatResponse)
async def chat(request: ChatRequest, current_user: dict = Depends(get_current_user)):
    """
    Chat endpoint that processes user messages and returns AI-generated responses.
    """
    # Step 1: Validate input
    is_allowed, fallback_key = is_message_allowed(request.message)
    
    if not is_allowed:
        return ChatResponse(
            response=FALLBACK_RESPONSES[fallback_key],
            filtered=True
        )
    
    # Step 2: Get user context and history
    db = get_database()
    user_id = current_user["email"]
    context = await get_user_context(user_id)
    
    # Fetch last 6 messages (3 turns)
    history_docs = await db["chat_history"].find({"user_id": user_id}).sort("timestamp", -1).limit(6).to_list(length=6)
    history = sorted(history_docs, key=lambda x: x['timestamp'])
    
    # Save user message to history
    user_msg_doc = {
        "user_id": user_id,
        "role": "user",
        "content": request.message,
        "timestamp": datetime.now().isoformat()
    }
    await db["chat_history"].insert_one(user_msg_doc)

    # Step 3: Build prompt
    prompt = build_prompt(request.message, context, history)
    
    # Step 4: Call Groq API
    try:
        from groq import Groq
        
        api_key = os.getenv("GROQ_API_KEY")
        # print(f"[Chat] Groq API key loaded: {'Yes' if api_key else 'No'}")
        
        if not api_key or api_key.startswith("your_"):
            return ChatResponse(
                response="I'm having trouble connecting right now. Please add your Groq API key to the .env file.",
                filtered=False
            )
        
        client = Groq(api_key=api_key)
        
        # print(f"[Chat] Sending prompt to Groq...")
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": """You are a highly helpful, intelligent, and conversational wellness assistant (style: ChatGPT). Your primary goal is to help users quit smoking by providing specific insights based on their personal data.

CORE CONVERSATION RULES:
1. ONLY answer questions about smoking, habits, progress, urges, and the user's data. If asked about unrelated topics, politely redirect.
2. GROUND every response in the user's data (high-risk times, triggers, streaks, etc.).
3. BE CONVERSATIONAL. Use PLAIN TEXT ONLY. Never use asterisks (*), bolding, or italics.
4. DIRECT ANSWER. Answer the user's core question immediately.
5. NO GENERIC TALK. Avoid motivational clichés unless tied to data.
6. SHORT MESSAGES: If the user provides a short response, acknowledge it and ask a neutral follow-up question.
7. NO MEDICAL ADVICE.
8. LENGTH: Keep responses helpful but concise (3-5 sentences).

TONE: Professional, calm, insight-driven, and supportive.
"""
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            model="llama-3.1-8b-instant",
            temperature=0.7,
            max_tokens=300
        )
        
        response_text = chat_completion.choices[0].message.content
        print(f"[Chat] Response received from Groq")
        
        if response_text:
            cleaned_response = response_text.strip().replace('*', '')
            # Save assistant message to history
            assistant_msg_doc = {
                "user_id": user_id,
                "role": "assistant",
                "content": cleaned_response,
                "timestamp": datetime.now().isoformat()
            }
            await db["chat_history"].insert_one(assistant_msg_doc)
            
            return ChatResponse(
                response=cleaned_response,
                filtered=False
            )
        else:
            return ChatResponse(
                response="I'm here to support you. Could you tell me more about what's on your mind regarding your smoking journey?",
                filtered=False
            )
            
    except Exception as e:
        import traceback
        print(f"[Chat] Groq API error: {e}")
        # traceback.print_exc()
        
        error_msg = str(e).lower()
        if "429" in error_msg or "rate limit" in error_msg:
            return ChatResponse(
                response="I'm receiving a lot of messages right now. Please give me a moment to catch my breath and try again in a minute!",
                filtered=False
            )
        
        return ChatResponse(
            response="I encountered a bit of a technical hiccup. Could you try sending that again?",
            filtered=False
        )


# --- Daily Insight Endpoint ---
class DailyInsightResponse(BaseModel):
    insight: str
    has_data: bool
    focus_index: int

@router.get("/daily-insight", response_model=DailyInsightResponse)
async def get_daily_insight(exclude_index: Optional[int] = None, current_user: dict = Depends(get_current_user)):
    user_id = current_user["email"]
    """
    Generate a short, personalized daily insight using AI.
    """
    try:
        # Get user context
        try:
            context = await get_user_context(user_id)
        except Exception as e:
            import traceback
            error_trace = traceback.format_exc()
            try:
                with open("debug_log.txt", "w") as f:
                    f.write(error_trace)
            except:
                pass
            print(error_trace)
            return DailyInsightResponse(
                insight=f"Debug: Context error: {str(e)}",
                has_data=False,
                focus_index=-1
            )
        
        # Check if user has any data OR profile summary
        has_logs = context['current_smoke_free_days'] > 0 or context['top_triggers']
        has_profile = context.get('profile_summary') is not None
        
        if not has_logs and not has_profile:
            return DailyInsightResponse(
                insight="Start logging to unlock personalized insights!",
                has_data=False,
                focus_index=-1
            )
        
        from groq import Groq
        
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            return DailyInsightResponse(
                insight="Keep tracking your progress—every log counts!",
                has_data=True,
                focus_index=-1
            )
        
        client = Groq(api_key=api_key)
        
        # If no logs but we have profile, force focus on preparation/mindset
        if not has_logs and has_profile:
            primary_focus = f"PREPARATION & MINDSET: Focus on their motivation/triggers from profile: {context['profile_summary'][:100]}..."
            chosen_idx = -1 # Special index
        else:
            # Force variety by picking a random primary focus area
            import random
            triggers_text = ', '.join(context['top_triggers']) if context['top_triggers'] else 'not yet identified'
            
            focus_options = [
                f"WEEKLY TRENDS: Focus on whether they are improving, steady, or increasing compared to last week (Current Trend: {context['trend']}).",
                f"STREAKS & ACHIEVEMENTS: Focus on their longest streak of {context['longest_streak']} days and how it compares to their current streak of {context['current_streak']} days.",
                f"CURRENT PATH: Focus on their progress towards the {context['smoke_free_goal']}-day smoke-free goal (They have {context['current_smoke_free_days']} total smoke-free days).",
                f"REDUCTION RATE: Focus on their {context['reduction_percent']}% reduction rate compared to last week.",
                f"CONSISTENCY SCORE: Focus on their Consistency Score of {context['consistency_score']}/100 and a gentle word on what it means (higher is better).",
                f"FINANCIAL IMPACT: Focus on the ${context['money_spent']} spent on cigarettes so far and a gentle reflection on potential savings.",
                f"LOGGING PROGRESS: Focus on the {context['days_smoked']} days they have smoked out of {context['days_logged']} total days logged.",
                f"REWARDS & UNLOCKS: Focus on the {context['unlocked_rewards_count']} rewards they have unlocked and mention the next reward: {context['next_reward_name'] or 'Elite Status'}.",
                f"HIGH-RISK TIMES: Focus on {context['high_risk_time']} and suggest a specific small routine to try then.",
                f"TRIGGER ANALYSIS: Focus on their top triggers ({triggers_text}) and a gentle suggestion for one of them.",
                f"SUPPORT TOOL SUCCESS: Focus on their use of urge support ({context['urge_support_uses']} times) or game sessions ({context['game_sessions']} times).",
                "HEALTH MILESTONES: Focus on a positive recovery sign like lungs starting to clear, circulation improving, or energy levels rising (be gentle and non-medical)."
            ]
            
            # Select an index that is NOT the exclude_index
            available_indices = [i for i in range(len(focus_options)) if i != exclude_index]
            chosen_idx = random.choice(available_indices)
            primary_focus = focus_options[chosen_idx]
        
        # Build trend message
        trend_msg = ""
        if context['trend'] == 'improving':
            trend_msg = f"IMPROVING: Down {context['reduction_percent']}% from last week"
        elif context['trend'] == 'increasing':
            trend_msg = "SLIGHTLY UP from last week"
        else:
            trend_msg = "STEADY week over week"
        
        prompt = f"""Generate ONE unique insight based ONLY on the PRIMARY FOCUS.
Ignore all other data points in your response unless they relate to the focus.

=== PRIMARY FOCUS ===
{primary_focus}

=== DATA REFERENCE ===
👤 PROFILE: {context.get('profile_summary', 'None')}
📊 STATS: {context['days_logged']} logs, {context['total_cigarettes']} total cigs, {context['days_smoked']} smoked days, {context['current_smoke_free_days']} smoke-free days. Goal: {context['smoke_free_goal']} days.
🔥 STREAKS: Current: {context['current_streak']}, Longest: {context['longest_streak']}.
📈 TREND: Average {context['weekly_avg']} vs {context['last_week_avg']} last week ({trend_msg}). Reduction: {context['reduction_percent']}%.
⚠️ PATTERNS: Worst day: {context['worst_day']}, High-risk: {context['high_risk_time']}, Triggers: {triggers_text}.
💪 TOOLS: Urge Support used {context['urge_support_uses']}x, Games played {context['game_sessions']}x, {context['total_focus_points']} focus pts.
🏆 REWARDS: {context['unlocked_rewards_count']} unlocked. Next: {context['next_reward_name'] or 'Elite'}.
💰 MONEY: ${context['money_spent']} spent on cigarettes.
🎯 CONSISTENCY: {context['consistency_score']}/100 score.

=== YOUR TASK ===
Based EXCLUSIVELY on the PRIMARY FOCUS:
1. Acknowledge ONE specific number or pattern from that focus area.
2. Offer ONE gentle suggestion or health reflection.

STRICT RULES:
- MAX 25 WORDS.
- EXACTLY 1 SHORT SENTENCE.
- ONLY talk about the PRIMARY FOCUS. Do not mention other stats.
- NO Command language. NO shaming. NO medical advice.
- Refer to money as something that "could become savings" rather than just a loss.

Insight:"""

        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are a concise wellness assistant. You give 1-2 line insights about smoking patterns. You NEVER mix topics. You ONLY discuss the requested focus area."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            model="llama-3.1-8b-instant",
            temperature=1.0,
            max_tokens=80
        )
        
        insight_text = chat_completion.choices[0].message.content.strip()
        # Clean up any quotes
        insight_text = insight_text.strip('"\'')
        
        return DailyInsightResponse(
            insight=insight_text,
            has_data=True,
            focus_index=chosen_idx
        )
        
    except Exception as e:
        import traceback
        # traceback.print_exc()
        
        error_msg = str(e).lower()
        if "429" in error_msg or "rate limit" in error_msg:
             return DailyInsightResponse(
                insight="I'm a bit overwhelmed with insights today! Take a deep breath and I'll have a new one for you in a moment.",
                has_data=True,
                focus_index=-1
            )
            
        return DailyInsightResponse(
            insight="Keep tracking your progress—every log counts toward your smoke-free goals!",
            has_data=True,
            focus_index=-1
        )
