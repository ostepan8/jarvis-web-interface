from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel, EmailStr
from typing import Dict
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta

SECRET_KEY = "supersecretkey"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Simple in-memory user "database"
users_db: Dict[str, str] = {}

class UserCredentials(BaseModel):
    email: EmailStr
    password: str

auth_router = APIRouter()

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

@auth_router.post("/signup")
async def signup(creds: UserCredentials):
    if creds.email in users_db:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User already exists")
    hashed = pwd_context.hash(creds.password)
    users_db[creds.email] = hashed
    token = create_access_token({"sub": creds.email}, timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    return {"token": token}

@auth_router.post("/login")
async def login(creds: UserCredentials):
    hashed = users_db.get(creds.email)
    if not hashed or not pwd_context.verify(creds.password, hashed):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication failed")
    token = create_access_token({"sub": creds.email}, timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    return {"token": token}

