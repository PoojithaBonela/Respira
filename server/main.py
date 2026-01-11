from dotenv import load_dotenv
import os

# Explicitly load .env from the server directory
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import (
    calendar_router, 
    log_router, 
    urge_router, 
    game_router, 
    insights_router, 
    user_router,
    chat_router,
    auth_router,
)
from database import init_db

app = FastAPI(title="Respira API")

from notification_service import start_notification_service

@app.on_event("startup")
async def on_startup():
    await init_db()
    start_notification_service()

# Configure CORS for the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Standardized Routing with Prefixes
app.include_router(auth_router.router, prefix="/auth", tags=["Auth"])
app.include_router(calendar_router.router, prefix="/calendar", tags=["Calendar"])
app.include_router(log_router.router, prefix="/log", tags=["Logs"])
app.include_router(urge_router.router, prefix="/urge", tags=["Urge"])
app.include_router(game_router.router, prefix="/game", tags=["Game"])
app.include_router(insights_router.router, prefix="/insights", tags=["Insights"])
app.include_router(user_router.router, prefix="/user", tags=["User"])
app.include_router(chat_router.router, prefix="/chat", tags=["Chat"])

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": "now"}

@app.get("/")
async def root():
    return {"message": "Welcome to Respira API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
