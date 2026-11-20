"""
EYESOFT - Experience The Live
Authentication & Security Middleware (FastAPI + PyJWT + Bcrypt)
"""

import os
from datetime import datetime, timedelta, timezone
from typing import Optional
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field
from dotenv import load_dotenv
from .database import get_user_by_username, verify_password

load_dotenv()

JWT_SECRET = os.getenv("JWT_SECRET", "eyesoft_enterprise_secret_jwt_key_2026_experience_the_live")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_EXPIRATION_HOURS = int(os.getenv("JWT_EXPIRATION_HOURS", "24"))

security = HTTPBearer(auto_error=False)

class LoginRequest(BaseModel):
    username: str = Field(..., min_length=3)
    password: str = Field(..., min_length=4)

class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=6)

class ReviewSubmission(BaseModel):
    customer_name: str = Field(..., min_length=2, max_length=100)
    rating: int = Field(..., ge=1, le=5)
    review_text: str = Field(..., min_length=10, max_length=1500)
    company_or_designation: Optional[str] = Field(None, max_length=150)

class ReviewStatusUpdate(BaseModel):
    status: str = Field(..., pattern="^(approved|rejected|pending)$")

class ClientCreate(BaseModel):
    name: str = Field(..., min_length=2)
    sector: Optional[str] = "Corporate / Academic / Public"
    display_order: Optional[int] = 0

class NewsCreate(BaseModel):
    title: str = Field(..., min_length=5)
    slug: Optional[str] = None
    summary: str = Field(..., min_length=10)
    content: str = Field(..., min_length=20)
    featured_image: str
    published_date: str
    author: Optional[str] = "EYESOFT Editorial Team"

class ProductCreate(BaseModel):
    id: str
    slug: str
    name: str
    category_id: str
    category_name: str
    tagline: Optional[str] = ""
    image: str
    description: Optional[str] = ""
    key_features: Optional[list] = []
    specifications: Optional[dict] = {}
    applications: Optional[list] = []
    is_featured: Optional[int] = 1
    display_order: Optional[int] = 0

class ContactUpdate(BaseModel):
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None
    whatsapp: Optional[str] = None
    map_embed_url: Optional[str] = None

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    to_encode.update({"exp": expire, "iat": datetime.now(timezone.utc)})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired. Please log in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

def get_current_admin(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)):
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please log in.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = credentials.credentials
    payload = decode_access_token(token)
    username = payload.get("sub")
    if not username:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user = get_user_by_username(username)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Admin user not found.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user
