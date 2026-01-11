from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import date

class SmokeLog(BaseModel):
    user_id: Optional[str] = None
    date: str  # YYYY-MM-DD
    cigarettes: int
    triggers: List[str] = []

class UrgeLog(BaseModel):
    user_id: Optional[str] = None
    trigger: str
    timestamp: str

class GameSession(BaseModel):
    user_id: Optional[str] = None
    seconds_focused: int
    points_earned: int
    timestamp: str

class UrgeStats(BaseModel):
    trigger_counts: dict[str, int]
    total_urges: int
    total_days: int

class GameStats(BaseModel):
    total_points: int
    max_seconds_focused: int

class CalendarDay(BaseModel):
    date: str
    status: str  # "future", "smoked", "smoke_free"
    cigarettes: int = 0

class CalendarStats(BaseModel):
    smoke_free_days: int
    days_smoked: int
    longest_streak: int
    money_spent: int = 0
    total_cigarettes: int = 0
    monthly_counts: list[int] = []
    first_log_month: int = -1 # 0-indexed, -1 if no logs
    min_year: int = 2024 # Default fallback

class CalendarResponse(BaseModel):
    calendar_days: List[CalendarDay]
    stats: CalendarStats

class LifetimeStats(BaseModel):
    current_streak: int
    longest_streak: int
    total_cigarettes: int


class ChatMessage(BaseModel):
    user_id: str
    role: str # "user" or "assistant"
    content: str
    timestamp: str

class UserProfile(BaseModel):
    age_range: str
    gender: str
    smoking_frequency: str
    smoking_duration: str
    triggers: List[str]
    reasons: List[str]
    stress_smoking: str
    quit_attempts: str
    current_goal: str
    summary: Optional[str] = None

class User(BaseModel):
    id: Optional[str] = Field(alias="_id", default=None)
    name: str
    email: str
    password_hash: Optional[str] = None
    auth_provider: str
    created_at: str
    last_login: str
    user_profile: Optional[UserProfile] = None
    smoke_free_goal: int = 7
    goal_start_date: Optional[str] = None
    notifications_enabled: bool = False

class UserSignup(BaseModel):
    name: str
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class GoogleLoginRequest(BaseModel):
    token: str
    is_signup: bool = False

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

