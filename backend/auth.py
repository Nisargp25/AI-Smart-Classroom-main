import os
import jwt
from datetime import datetime, timezone, timedelta
from fastapi import HTTPException, Request, Response
from typing import Optional
import uuid
from dotenv import load_dotenv

load_dotenv()

JWT_SECRET = os.environ.get("JWT_SECRET", "fallback_secret_key")
JWT_ALGORITHM = "HS256"
SESSION_EXPIRY_DAYS = 7
COOKIE_SECURE = os.environ.get("COOKIE_SECURE", "false").lower() == "true"
COOKIE_SAMESITE = os.environ.get("COOKIE_SAMESITE", "lax")

def create_session_token(user_id: str) -> str:
    """Create a JWT session token"""
    expiry = datetime.now(timezone.utc) + timedelta(days=SESSION_EXPIRY_DAYS)
    payload = {
        "user_id": user_id,
        "exp": expiry.timestamp()
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_session_token(token: str) -> Optional[str]:
    """Verify JWT session token and return user_id"""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload.get("user_id")
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

async def get_current_user(request: Request, db) -> dict:
    """Get current user from cookie or Authorization header"""
    # Try cookie first
    token = request.cookies.get("session_token")
    
    # Fallback to Authorization header
    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
    
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Verify token
    user_id = verify_session_token(token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    # Get user from database
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0, "password_hash": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    return user

def set_session_cookie(response: Response, token: str):
    """Set the session token cookie"""
    response.set_cookie(
        key="session_token",
        value=token,
        httponly=True,
        secure=COOKIE_SECURE,
        samesite=COOKIE_SAMESITE,
        path="/",
        max_age=SESSION_EXPIRY_DAYS * 24 * 60 * 60
    )

def clear_session_cookie(response: Response):
    """Clear the session token cookie"""
    response.delete_cookie(
        key="session_token",
        path="/",
        secure=COOKIE_SECURE,
        samesite=COOKIE_SAMESITE
    )
