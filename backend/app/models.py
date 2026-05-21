from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="user") # 'user' or 'admin'
    created_at = Column(DateTime, default=datetime.utcnow)

    predictions = relationship("Prediction", back_populates="user", cascade="all, delete-orphan")

class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    image_path = Column(String, nullable=False)
    animal_type = Column(String, nullable=False) # 'Cattle' or 'Buffalo'
    predicted_breed = Column(String, nullable=False)
    confidence = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="predictions")

class DatasetInfo(Base):
    __tablename__ = "dataset_info"

    id = Column(Integer, primary_key=True, index=True)
    breed_name = Column(String, unique=True, nullable=False)
    animal_type = Column(String, nullable=False) # 'Cattle' or 'Buffalo'
    image_count = Column(Integer, default=0)
    last_updated = Column(DateTime, default=datetime.utcnow)
