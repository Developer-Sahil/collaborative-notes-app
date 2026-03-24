from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from core.firebase import firebase_manager
from typing import Optional

security = HTTPBearer()


async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """Verify Firebase token from request headers"""
    token = credentials.credentials
    
    decoded = firebase_manager.verify_token(token)
    if not decoded:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )
    
    return decoded


def get_current_user(decoded: dict = Depends(verify_token)) -> dict:
    """Extract current user from decoded token"""
    return {
        "uid": decoded.get("uid"),
        "email": decoded.get("email"),
    }