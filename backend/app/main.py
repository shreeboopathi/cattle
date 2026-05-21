import os
import shutil
import csv
from io import StringIO
from typing import List, Optional
from datetime import datetime, timedelta
from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import StreamingResponse, FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import func

from . import models, schemas, database, auth, prediction
from .breed_details import BREED_DETAILS

# Setup directories
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
CHARTS_DIR = os.path.join(BASE_DIR, "charts")
DATASET_DIR = os.path.join(BASE_DIR, "dataset")

for path in [UPLOAD_DIR, CHARTS_DIR, DATASET_DIR]:
    os.makedirs(path, exist_ok=True)

# Create database tables
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(
    title="Indian Cattle & Buffalo Breed Recognition System API",
    description="Backend API supporting authentication, history, analytics, and AI prediction.",
    version="1.0.0"
)

@app.on_event("startup")
def startup_event():
    # Sync or seed database on startup
    db = database.SessionLocal()
    try:
        # Check if users exist, if not seed default ones
        user_count = db.query(models.User).count()
        if user_count == 0:
            print("No users found. Seeding default accounts (admin & farmer)...")
            admin_user = models.User(
                username="admin",
                email="admin@agriculture.gov.in",
                hashed_password=auth.get_password_hash("admin123"),
                role="admin"
            )
            db.add(admin_user)
            
            demo_user = models.User(
                username="farmer",
                email="farmer@kisanmail.in",
                hashed_password=auth.get_password_hash("farmer123"),
                role="user"
            )
            db.add(demo_user)
            db.commit()

        # Seed Dataset Info if empty
        dataset_count = db.query(models.DatasetInfo).count()
        if dataset_count == 0:
            print("Seeding dataset counts...")
            breed_counts = {
                "Gir": 220, "Sahiwal": 240, "Red Sindhi": 180, "Ongole": 210, 
                "Tharparkar": 190, "Hallikar": 150, "Kangayam": 160, "Deoni": 170,
                "Murrah": 250, "Jaffarabadi": 200, "Surti": 180, "Mehsana": 210,
                "Pandharpuri": 160, "Bhadawari": 140
            }
            for breed, count in breed_counts.items():
                dataset = models.DatasetInfo(
                    breed_name=breed,
                    animal_type=BREED_DETAILS[breed]["animal_type"],
                    image_count=count,
                    last_updated=datetime.utcnow()
                )
                db.add(dataset)
            db.commit()
    except Exception as e:
        print(f"Error seeding database on startup: {e}")
    finally:
        db.close()

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For prototype ease of use, open to all.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount uploaded images static folder
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")
app.mount("/charts", StaticFiles(directory=CHARTS_DIR), name="charts")

# --- AUTH ENDPOINTS ---

@app.post("/api/auth/register", response_model=schemas.UserResponse)
def register(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    db_email = db.query(models.User).filter(models.User.email == user.email).first()
    if db_email:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = auth.get_password_hash(user.password)
    # Check if first user, make them admin for convenience
    user_count = db.query(models.User).count()
    role = "admin" if user_count == 0 else "user"
    
    new_user = models.User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password,
        role=role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.post("/api/auth/login", response_model=schemas.Token)
def login(form_data: schemas.UserLogin, db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.username == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.username, "role": user.role},
        expires_delta=access_token_expires
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role,
        "username": user.username
    }

# --- PREDICTION ENDPOINT ---

@app.post("/api/predict", response_model=schemas.PredictResult)
async def predict(
    file: UploadFile = File(...),
    username: Optional[str] = Form(None),
    db: Session = Depends(database.get_db)
):
    # Validate extension
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in [".jpg", ".jpeg", ".png"]:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file extension. Only JPG, JPEG, and PNG are allowed."
        )
        
    # Save the file
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S%f")
    safe_filename = f"{timestamp}_{file.filename.replace(' ', '_')}"
    file_path = os.path.join(UPLOAD_DIR, safe_filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # Run prediction
    prediction_result = prediction.predict_breed_from_image(file_path)
    
    # Associate user if logged in
    user_id = None
    if username:
        user = db.query(models.User).filter(models.User.username == username).first()
        if user:
            user_id = user.id
            
    # Convert confidence string (e.g. "95.5%") to float (95.5)
    conf_float = float(prediction_result["confidence"].replace("%", ""))
    
    # Store prediction history
    relative_path = f"uploads/{safe_filename}"
    new_prediction = models.Prediction(
        user_id=user_id,
        image_path=relative_path,
        animal_type=prediction_result["animal_type"],
        predicted_breed=prediction_result["predicted_breed"],
        confidence=conf_float
    )
    db.add(new_prediction)
    db.commit()
    
    return prediction_result

# --- HISTORY ENDPOINTS ---

@app.get("/api/history", response_model=List[schemas.PredictionResponse])
def get_user_history(username: str, db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # User can see their predictions, Admin sees all
    if user.role == "admin":
        return db.query(models.Prediction).order_by(models.Prediction.created_at.desc()).all()
    else:
        return db.query(models.Prediction).filter(models.Prediction.user_id == user.id).order_by(models.Prediction.created_at.desc()).all()

# --- DASHBOARD STATS ---

@app.get("/api/dashboard/stats")
def get_dashboard_stats(username: Optional[str] = None, db: Session = Depends(database.get_db)):
    user = None
    if username:
        user = db.query(models.User).filter(models.User.username == username).first()
        
    # Query base
    query = db.query(models.Prediction)
    if user and user.role != "admin":
        query = query.filter(models.Prediction.user_id == user.id)
        
    total_predictions = query.count()
    
    # Most detected breed
    most_detected = query.values(models.Prediction.predicted_breed)\
                         .group_by(models.Prediction.predicted_breed)\
                         .order_by(func.count(models.Prediction.predicted_breed).desc())\
                         .first()
    most_breed = most_detected[0] if most_detected else "None"
    
    # Average accuracy (confidence)
    avg_conf = db.query(func.avg(models.Prediction.confidence))
    if user and user.role != "admin":
        avg_conf = avg_conf.filter(models.Prediction.user_id == user.id)
    avg_accuracy = round(avg_conf.scalar() or 0.0, 1)
    
    # Cattle vs Buffalo count
    cattle_count = query.filter(models.Prediction.animal_type == "Cattle").count()
    buffalo_count = query.filter(models.Prediction.animal_type == "Buffalo").count()
    
    # Last 7 days history
    today = datetime.utcnow().date()
    history_days = []
    prediction_counts = []
    
    for i in range(6, -1, -1):
        day = today - timedelta(days=i)
        day_str = day.strftime("%b %d")
        history_days.append(day_str)
        
        # Count predictions in that day
        day_start = datetime.combine(day, datetime.min.time())
        day_end = datetime.combine(day, datetime.max.time())
        
        day_query = query.filter(models.Prediction.created_at >= day_start, models.Prediction.created_at <= day_end)
        prediction_counts.append(day_query.count())
        
    # Breed distribution data for pie chart
    breed_counts_raw = db.query(models.Prediction.predicted_breed, func.count(models.Prediction.predicted_breed))
    if user and user.role != "admin":
        breed_counts_raw = breed_counts_raw.filter(models.Prediction.user_id == user.id)
    breed_counts = breed_counts_raw.group_by(models.Prediction.predicted_breed).all()
    
    breed_labels = [b[0] for b in breed_counts]
    breed_values = [b[1] for b in breed_counts]
    
    return {
        "total_predictions": total_predictions,
        "most_detected_breed": most_breed,
        "average_accuracy": avg_accuracy,
        "cattle_count": cattle_count,
        "buffalo_count": buffalo_count,
        "history_timeline": {
            "labels": history_days,
            "values": prediction_counts
        },
        "breed_distribution": {
            "labels": breed_labels,
            "values": breed_values
        }
    }

# --- ADMIN ENDPOINTS ---

@app.get("/api/admin/users", response_model=List[schemas.UserResponse])
def get_users(admin: models.User = Depends(auth.get_current_admin), db: Session = Depends(database.get_db)):
    return db.query(models.User).order_by(models.User.created_at.desc()).all()

@app.delete("/api/admin/users/{user_id}")
def delete_user(user_id: int, admin: models.User = Depends(auth.get_current_admin), db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.role == "admin":
        raise HTTPException(status_code=400, detail="Cannot delete admin user")
    db.delete(user)
    db.commit()
    return {"message": "User deleted successfully"}

@app.get("/api/admin/datasets", response_model=List[schemas.DatasetInfoResponse])
def get_datasets(admin: models.User = Depends(auth.get_current_admin), db: Session = Depends(database.get_db)):
    return db.query(models.DatasetInfo).all()

@app.post("/api/admin/datasets/refresh")
def refresh_datasets(admin: models.User = Depends(auth.get_current_admin), db: Session = Depends(database.get_db)):
    # Scan dataset directory and synchronize database image counts
    for breed in BREED_DETAILS.keys():
        breed_path = os.path.join(DATASET_DIR, breed)
        count = 0
        if os.path.exists(breed_path):
            count = len([f for f in os.listdir(breed_path) if f.lower().endswith(('.png', '.jpg', '.jpeg'))])
            
        dataset = db.query(models.DatasetInfo).filter(models.DatasetInfo.breed_name == breed).first()
        if dataset:
            dataset.image_count = count
            dataset.last_updated = datetime.utcnow()
        else:
            new_info = models.DatasetInfo(
                breed_name=breed,
                animal_type=BREED_DETAILS[breed]["animal_type"],
                image_count=count
            )
            db.add(new_info)
    db.commit()
    return {"message": "Dataset counts updated successfully"}

@app.get("/api/admin/export")
def export_predictions(admin: models.User = Depends(auth.get_current_admin), db: Session = Depends(database.get_db)):
    predictions = db.query(models.Prediction).order_by(models.Prediction.created_at.desc()).all()
    
    output = StringIO()
    writer = csv.writer(output)
    
    # Write header
    writer.writerow(["Prediction ID", "User ID", "Animal Type", "Predicted Breed", "Confidence", "Timestamp", "Image Path"])
    
    # Write rows
    for p in predictions:
        writer.writerow([
            p.id, 
            p.user_id or "Anonymous", 
            p.animal_type, 
            p.predicted_breed, 
            f"{p.confidence}%", 
            p.created_at.strftime("%Y-%m-%d %H:%M:%S"),
            p.image_path
        ])
        
    output.seek(0)
    
    headers = {
        'Content-Disposition': 'attachment; filename="breed_predictions_report.csv"'
    }
    return StreamingResponse(output, media_type="text/csv", headers=headers)

@app.get("/api/charts/training-exists")
def check_training_charts():
    chart_path = os.path.join(CHARTS_DIR, "training_metrics.png")
    return {"exists": os.path.exists(chart_path)}
