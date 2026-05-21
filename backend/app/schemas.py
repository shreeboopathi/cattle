from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List

# User Schemas
class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(UserBase):
    id: int
    role: str
    created_at: datetime

    class Config:
        from_attributes = True

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    role: str
    username: str

class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[str] = None

# Prediction Schemas
class PredictionResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    image_path: str
    animal_type: str
    predicted_breed: str
    confidence: float
    created_at: datetime

    class Config:
        from_attributes = True

class PredictResult(BaseModel):
    animal_type: str
    predicted_breed: str
    confidence: str
    breed_details: dict
    similar_suggestions: List[str]

# Dataset Schemas
class DatasetInfoBase(BaseModel):
    breed_name: str
    animal_type: str
    image_count: int

class DatasetInfoResponse(DatasetInfoBase):
    id: int
    last_updated: datetime

    class Config:
        from_attributes = True
