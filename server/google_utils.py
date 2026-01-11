from google.oauth2 import id_token
from google.auth.transport import requests
import os

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")

def verify_google_token(token: str):
    if not GOOGLE_CLIENT_ID:
        # In a real scenario we might fail, but for dev we might log warning.
        # But verification requires client ID.
        raise ValueError("GOOGLE_CLIENT_ID not configured")

    try:
        idinfo = id_token.verify_oauth2_token(token, requests.Request(), GOOGLE_CLIENT_ID)
        
        # ID token is valid. Get the user's Google Account ID from the decoded token.
        return {
            "sub": idinfo['sub'],
            "email": idinfo['email'],
            "name": idinfo.get('name', ''),
            "picture": idinfo.get('picture', '')
        }
    except ValueError as e:
        # Invalid token
        print(f"Google token verification failed: {e}")
        return None
