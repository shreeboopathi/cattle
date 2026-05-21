import os
import random
from datetime import datetime, timedelta
from PIL import Image, ImageDraw, ImageFont
from app.database import engine, SessionLocal
from app import models, auth
from app.breed_details import BREED_DETAILS

# Setup paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

def create_placeholder_image(filename, text, color):
    filepath = os.path.join(UPLOAD_DIR, filename)
    if os.path.exists(filepath):
        return
    
    # Create image
    img = Image.new("RGB", (400, 300), color=color)
    draw = ImageDraw.Draw(img)
    
    # Draw simple design
    draw.rectangle([10, 10, 390, 290], outline=(255, 255, 255), width=2)
    draw.text((20, 20), "Indian Livestock Breed Recognition", fill=(255, 255, 255))
    draw.text((20, 140), text, fill=(255, 255, 255))
    draw.text((20, 260), "DEMO PROTOTYPE FILE", fill=(200, 200, 200))
    
    img.save(filepath)

def seed_database():
    print("Initializing database tables...")
    models.Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    # 1. Create Admin and User accounts
    admin_user = db.query(models.User).filter(models.User.username == "admin").first()
    if not admin_user:
        print("Creating admin account (username: admin, password: admin123)...")
        admin_user = models.User(
            username="admin",
            email="admin@agriculture.gov.in",
            hashed_password=auth.get_password_hash("admin123"),
            role="admin"
        )
        db.add(admin_user)
        
    demo_user = db.query(models.User).filter(models.User.username == "farmer").first()
    if not demo_user:
        print("Creating standard user account (username: farmer, password: farmer123)...")
        demo_user = models.User(
            username="farmer",
            email="farmer@kisanmail.in",
            hashed_password=auth.get_password_hash("farmer123"),
            role="user"
        )
        db.add(demo_user)
    
    db.commit()
    db.refresh(admin_user)
    db.refresh(demo_user)
    
    # 2. Seed Dataset Info with realistic image counts
    print("Seeding dataset counts...")
    breed_counts = {
        # Cattle
        "Gir": 220, "Sahiwal": 240, "Red Sindhi": 180, "Ongole": 210, 
        "Tharparkar": 190, "Hallikar": 150, "Kangayam": 160, "Deoni": 170,
        # Buffalo
        "Murrah": 250, "Jaffarabadi": 200, "Surti": 180, "Mehsana": 210,
        "Pandharpuri": 160, "Bhadawari": 140
    }
    
    for breed, count in breed_counts.items():
        dataset = db.query(models.DatasetInfo).filter(models.DatasetInfo.breed_name == breed).first()
        if not dataset:
            dataset = models.DatasetInfo(
                breed_name=breed,
                animal_type=BREED_DETAILS[breed]["animal_type"],
                image_count=count,
                last_updated=datetime.utcnow()
            )
            db.add(dataset)
        else:
            dataset.image_count = count
    db.commit()

    # 3. Create mock prediction history spanning 7 days
    print("Checking prediction history...")
    pred_count = db.query(models.Prediction).count()
    if pred_count == 0:
        print("Seeding mock prediction history...")
        
        # Colors for placeholder images
        colors = {
            "Cattle": (41, 128, 185), # Blue
            "Buffalo": (39, 174, 96)  # Green
        }
        
        today = datetime.utcnow()
        breeds_list = list(BREED_DETAILS.keys())
        
        for i in range(25):
            days_ago = random.randint(0, 6)
            pred_time = today - timedelta(days=days_ago, hours=random.randint(0, 23), minutes=random.randint(0, 59))
            
            breed = random.choice(breeds_list)
            details = BREED_DETAILS[breed]
            animal_type = details["animal_type"]
            confidence = round(random.uniform(88.5, 99.2), 1)
            
            # Generate placeholder image name
            img_filename = f"mock_{i+1}_{breed.lower()}.png"
            color = colors[animal_type]
            create_placeholder_image(img_filename, f"Breed: {breed}\nType: {animal_type}\nConf: {confidence}%", color)
            
            # Save prediction
            new_pred = models.Prediction(
                user_id=demo_user.id if random.random() > 0.3 else admin_user.id,
                image_path=f"uploads/{img_filename}",
                animal_type=animal_type,
                predicted_breed=breed,
                confidence=confidence,
                created_at=pred_time
            )
            db.add(new_pred)
            
        db.commit()
        print("Successfully seeded prediction history with images.")
        
    print("Database seeding completed successfully.")
    db.close()

if __name__ == "__main__":
    seed_database()
