from fastapi import APIRouter, HTTPException, Depends
from database import get_database
from models import (
    User, UserSignup, UserLogin, 
    GoogleLoginRequest, ForgotPasswordRequest, ResetPasswordRequest
)
from auth_utils import get_password_hash, verify_password, generate_reset_token, validate_password_strength
from google_utils import verify_google_token
from email_utils import send_reset_email
from datetime import datetime, timedelta
import secrets
from oauth2 import create_access_token

router = APIRouter()

@router.post("/signup")
async def signup(user_data: UserSignup):
    db = get_database()
    users = db.users

    # Check if email exists
    existing_user = await users.find_one({"email": user_data.email.lower()})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    try:
        # Validate password strength
        is_valid, msg = validate_password_strength(user_data.password, user_data.email)
        if not is_valid:
            raise HTTPException(status_code=400, detail=msg)

        # Create new user
        hashed_password = get_password_hash(user_data.password)
        new_user = User(
            name=user_data.name,
            email=user_data.email.lower(),
            password_hash=hashed_password,
            auth_provider="email",
            created_at=datetime.utcnow().isoformat(),
            last_login=datetime.utcnow().isoformat()
        )

        await users.insert_one(new_user.dict(by_alias=True, exclude={"id"}))
        return {"status": "success", "message": "User created successfully"}
    except Exception as e:
        print(f"Signup Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/login")
async def login(login_data: UserLogin):
    db = get_database()
    users = db.users

    user = await users.find_one({"email": login_data.email.lower()})
    if not user or not user.get("password_hash") or user.get("auth_provider") != "email":
        # Specific error for strictly enforcing existence
        if not user:
            raise HTTPException(status_code=404, detail="Account does not exist")
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not verify_password(login_data.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Update last login
    await users.update_one(
        {"_id": user["_id"]},
        {"$set": {"last_login": datetime.utcnow().isoformat()}}
    )

    # Create access token
    access_token = create_access_token(
        data={"user_id": user["email"]} # Using email as user_id for simplicity as per current schema
    )

    return {
        "status": "success", 
        "token": access_token,
        "user": {
            "name": user["name"],
            "email": user["email"],
            "id": str(user["_id"])
        }
    }

@router.post("/google")
async def google_auth(request: GoogleLoginRequest):
    # Verify token
    google_user = verify_google_token(request.token)
    if not google_user:
        raise HTTPException(status_code=400, detail="Invalid Google token")

    db = get_database()
    users = db.users
    email = google_user["email"].lower()

    user = await users.find_one({"email": email})
    
    if user:
        # Login existing user
        await users.update_one(
            {"_id": user["_id"]},
            {"$set": {
                "last_login": datetime.utcnow().isoformat(),
                # Fix: If user previously signed up with email but now uses Google, update auth_provider or link?
                # For now, just logging them in is fine.
            }}
        )
        is_new_user = False
    else:
        # User does NOT exist
        if not request.is_signup:
            # If trying to LOGIN but account missing -> BLOCK
            raise HTTPException(status_code=404, detail="Account does not exist")

        # Create new user (Signup mode)
        new_user = User(
            name=google_user["name"],
            email=email,
            password_hash=None,
            auth_provider="google",
            created_at=datetime.utcnow().isoformat(),
            last_login=datetime.utcnow().isoformat()
        )
        result = await users.insert_one(new_user.dict(by_alias=True, exclude={"id"}))
        user = await users.find_one({"_id": result.inserted_id})
        is_new_user = True

    # Create access token
    access_token = create_access_token(
        data={"user_id": user["email"]}
    )

    return {
        "status": "success",
        "token": access_token,
        "is_new_user": is_new_user,
        "user": {
            "name": user["name"],
            "email": user["email"],
            "id": str(user["_id"])
        }
    }

@router.post("/forgot-password")
async def forgot_password(request: ForgotPasswordRequest):
    db = get_database()
    users = db.users
    email = request.email.lower()

    user = await users.find_one({"email": email})
    if not user:
        # User requested explicit feedback if account doesn't exist
        raise HTTPException(status_code=404, detail="Account does not exist. Please create an account.")

    # Generate token
    reset_token = generate_reset_token()
    expiry = datetime.utcnow() + timedelta(minutes=15)
    
    # Store token in user doc (simple approach) or separate collection
    await users.update_one(
        {"_id": user["_id"]},
        {"$set": {
            "reset_token": reset_token,
            "reset_token_expiry": expiry.isoformat()
        }}
    )

    # Send email
    send_reset_email(email, reset_token)

    return {"status": "success", "message": "Reset link sent to your email!"}

@router.post("/reset-password")
async def reset_password(request: ResetPasswordRequest):
    db = get_database()
    users = db.users

    # Find user with valid token
    # Note: In real app, consider atomic checks or finding by token
    token = request.token.strip()
    user = await users.find_one({"reset_token": token})
    
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired token")

    expiry_str = user.get("reset_token_expiry")
    if not expiry_str:
        raise HTTPException(status_code=400, detail="Invalid token")
        
    expiry = datetime.fromisoformat(expiry_str)
    if datetime.utcnow() > expiry:
        raise HTTPException(status_code=400, detail="Token expired")

    # Validate new password strength
    is_valid, msg = validate_password_strength(request.new_password, user["email"])
    if not is_valid:
        raise HTTPException(status_code=400, detail=msg)

    # Update password
    new_hash = get_password_hash(request.new_password)
    await users.update_one(
        {"_id": user["_id"]},
        {"$set": {
            "password_hash": new_hash,
            "reset_token": None,
            "reset_token_expiry": None
        }}
    )

    return {"status": "success", "message": "Password updated successfully"}
