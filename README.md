# VedicLivestock AI: Breed Recognition & Diagnostic System
An AI-powered image recognition and decision support system for native Indian cattle and buffalo breeds. Designed as a working prototype for final-year college project showcases, research demos, and agricultural extensions.

---

## 📌 Project Abstract
Indian agriculture relies heavily on livestock, yet identifying native breeds and managing their health is traditionally done via subjective, expert-dependent visual reviews. This project presents **VedicLivestock AI**, an end-to-end web application that leverages a custom Convolutional Neural Network (CNN) in PyTorch to automate the classification of 14 key indigenous cattle and buffalo breeds. 

With a dark glassmorphic interface built using React, Vite, and Tailwind CSS v4, the system allows users to upload images or capture frames via a live camera, processes the image to clean noise and resize, and runs predictions. Beyond classification, the system acts as a veterinary decision assistant by displaying milk yield ranges, regional distribution maps, voice-readout summaries, and preventative action plans for breed-specific diseases (e.g., Mastitis, Foot and Mouth Disease). An integrated Admin Panel provides features to monitor user records, track live dataset statistics, synchronize directory counts, and export CSV audit sheets.

---

## 📂 Project Directory Structure

```
breed/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py             # FastAPI App containing REST endpoints
│   │   ├── database.py         # SQLAlchemy connection configuration
│   │   ├── models.py           # SQLAlchemy database schemas (User, Predictions, Datasets)
│   │   ├── schemas.py          # Pydantic schemas for data validation
│   │   ├── auth.py             # JWT & raw bcrypt password hashing module
│   │   ├── breed_details.py    # Native details and profiles for all 14 breeds
│   │   └── prediction.py       # Custom CNN definition & inference engine
│   ├── charts/                 # Saved training loss/accuracy graphs
│   ├── dataset/                # Train/Val/Test folders (arranged by breed name)
│   │   ├── Gir/
│   │   ├── Sahiwal/
│   │   └── ... (all 14 breeds)
│   ├── models/                 # Saved model weight binary files (*.pth)
│   ├── uploads/                # User uploaded images and captures
│   ├── requirements.txt        # Python backend requirements
│   ├── setup_db.py             # Database seeder (creates dummy users, logs, and mock pictures)
│   └── train.py                # PyTorch training, augmentation & validation script
├── frontend/
│   ├── dist/                   # Production-compiled bundle assets
│   ├── src/
│   │   ├── App.jsx             # Main React app (tabs, auth, charts, maps, speech, GPS)
│   │   ├── main.jsx            # DOM renderer entry point
│   │   └── index.css           # Tailwind v4 imports, glassmorphism CSS utilities
│   ├── package.json            # Frontend node packages
│   └── vite.config.js          # Vite config utilizing @tailwindcss/vite plugin
└── README.md                   # Complete documentation and presentation slides
```

---

## 🗄️ Database Schema (SQLite)

The backend utilizes SQLite via SQLAlchemy for modularity. Three tables manage system state:

### 1. `users` (User Authentication)
| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | Integer | Primary Key, Auto-increment | Unique identifier for accounts |
| `username` | String | Unique, Indexed, Not Null | Account username |
| `email` | String | Unique, Indexed, Not Null | Registration email address |
| `hashed_password` | String | Not Null | Hashed password via raw Bcrypt |
| `role` | String | Default: `'user'` | Role of account (`'user'` or `'admin'`) |
| `created_at` | DateTime | Default: `UTC Now` | Registration timestamp |

### 2. `predictions` (Prediction History Logs)
| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | Integer | Primary Key, Auto-increment | Prediction log identifier |
| `user_id` | Integer | Foreign Key -> `users.id` | User associated with the audit |
| `image_path` | String | Not Null | Path to the saved uploaded image |
| `animal_type` | String | Not Null | Livestock group (`'Cattle'` or `'Buffalo'`) |
| `predicted_breed` | String | Not Null | Predicted breed name |
| `confidence` | Float | Not Null | Confidence percentage |
| `created_at` | DateTime | Default: `UTC Now` | Prediction timestamp |

### 3. `dataset_info` (Admin Dataset Statistics)
| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | Integer | Primary Key, Auto-increment | Item identifier |
| `breed_name` | String | Unique, Not Null | Name of the breed |
| `animal_type` | String | Not Null | Livestock group |
| `image_count` | Integer | Default: `0` | Number of files in the directory |
| `last_updated` | DateTime | Default: `UTC Now` | Last synchronization timestamp |

---

## 🎯 Target Indian Breeds

The model classifies 14 core breeds, categorized as follows:

| Group | Breed Name | Origin State | Key Traits |
| :--- | :--- | :--- | :--- |
| **Cattle (Cow)** | **Gir** | Gujarat | Distinct dome forehead, leaf-shaped ears, high A2 milk yield |
| | **Sahiwal** | Punjab / Haryana | Reddish-brown skin, heavy dewlap, premium dairy index |
| | **Red Sindhi** | Northern India | Reddish-brown coat, heat-tolerant dairy breed |
| | **Ongole** | Andhra Pradesh | Majestic white coat, large hump, draft and dairy index |
| | **Tharparkar** | Rajasthan | White/Grey desert-hardy, dual-purpose breed |
| | **Hallikar** | Karnataka | Dark grey coat, sharp sweeping horns, famous draught breed |
| | **Kangayam** | Tamil Nadu | Strong build, dark markings, high endurance draft breed |
| | **Deoni** | Maharashtra | Spotted white coat, dual-purpose draft & dairy breed |
| **Buffalo** | **Murrah** | Haryana | Jet black, tightly curled spiral horns, premier dairy breed |
| | **Jaffarabadi** | Gujarat | Massive body, drooping horns, high butterfat content |
| | **Surti** | Gujarat | Sickle-shaped flat horns, double white collars on neck |
| | **Mehsana** | Gujarat | Long body, cross-breed (Murrah x Surti), long lactation |
| | **Pandharpuri** | Maharashtra | Extremely long, sword-like backward horns, drought-hardy |
| | **Bhadawari** | Uttar Pradesh | Copper coat, white neck chevrons, highest milk fat (~13%) |

---

## 🛠️ Step-by-Step Setup and Execution

Follow these instructions to run the project prototype locally:

### Prerequisites
- Python 3.10+ (Recommended, project fully tested on Python 3.13.1)
- Node.js v18+ (tested on Node v24.11)
- Google Chrome, Microsoft Edge, or Firefox browser

---

### Step 1: Backend Setup
1. Open a terminal and navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
   pip install email-validator
   ```
3. Initialize the database, create default accounts, and generate mock prediction data:
   ```bash
   python setup_db.py
   ```
   > **Note**: This will create a local `cattle_breed.db` database and seed it with dummy users, 25 log records, and mock thumbnail images inside the `uploads/` folder.
4. Run the model training script (optional, but seeds the training curves immediately):
   ```bash
   python train.py
   ```
   > **Note**: This script will automatically create a miniature dataset (10 images per breed) and train a custom 3-layer CNN on CPU for 5 epochs. It saves the model weights to `models/breed_classifier.pth` and plots curves to `charts/training_metrics.png`.
5. Start the FastAPI backend server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   The backend API will run at: `http://localhost:8000`. You can inspect the Swagger documentation at `http://localhost:8000/docs`.

---

### Step 2: Frontend Setup
1. Open a new terminal window and navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Launch the development server:
   ```bash
   npm run dev
   ```
   Open your browser and navigate to the local address displayed in the terminal (typically `http://localhost:5173`).

---

### Step 3: Running the Demo Login Credentials
- **Standard User**:
  - **Username**: `farmer`
  - **Password**: `farmer123`
- **Administrator**:
  - **Username**: `admin`
  - **Password**: `admin123`

---

## 📽️ PowerPoint Presentation (PPT) Script & Slides
Use this outline for your final-year college project presentation slides:

### Slide 1: Title Slide
- **Title**: VedicLivestock AI: Image-Based Indigenous Breed Recognition System
- **Subtitle**: Artificial Intelligence & Deep Learning in Livestock Management
- **Presenter Name**: [Your Name], Final Year B.Tech
- **Highlights**: Dark UI, PyTorch Convolutional Neural Networks, REST Backend API

### Slide 2: Problem Statement & Motivation
- **Bullet Points**:
  - Identifying native cattle and buffalo breeds is essential for breeding control, trading valuation, and yield predictions.
  - Traditional visual assessment is subjective, slow, and requires scarce veterinary specialists.
  - Lack of accessible digital records of past health diagnostics or distribution metrics for rural farmers.
- **Presenter Notes**: "Good morning panel. Today, our farming communities face challenges in verifying indigenous livestock pedigree. Our goal is to provide a digital solution accessible right on a phone."

### Slide 3: Main Objectives
- **Bullet Points**:
  - Build a responsive, dark glassmorphic web dashboard for livestock recognition.
  - Implement a Convolutional Neural Network (CNN) in PyTorch to classify 14 Indian breeds.
  - Integrate useful extras: Text-To-Speech audio readouts, Breed-specific Disease suggestions, and interactive GPS maps.
  - Provide secure Admin Controls to sync directories, delete accounts, and export CSV logs.

### Slide 4: System Architecture
- **Diagram Description / Content**:
  - **Front-End**: React.js, Tailwind CSS v4, Chart.js, Framer Motion
  - **Back-End**: FastAPI (Python), SQLAlchemy, SQLite
  - **Model Architecture**: 3-layer Convolutional Feature Extractor + Dense classification Head (Dropout 0.3, Adam Optimizer, Cross-Entropy Loss)
  - **File Storage**: Static folders for uploads and generated charts.

### Slide 5: Model Training & Preprocessing
- **Bullet Points**:
  - **Preprocessing**: Input resized to 224x224, Normalized to match ImageNet standard.
  - **Data Augmentation**: Rotations (15°), horizontal flips, color jitter (brightness, contrast), random resized cropping.
  - **Train Split**: 70% Training, 20% Validation, 10% Testing.
  - **Early Stopping**: Prevents overfitting by saving the weights with the lowest validation loss.

### Slide 6: Smart Features (Innovation Highlights)
- **Bullet Points**:
  - **Voice Assistant**: HTML5 Web Speech Synthesis reads details out loud in English, Hindi, or Tamil.
  - **Live Camera**: HTML5 Camera streaming allows immediate photo capture.
  - **Disease suggestions**: Provides preventive care instructions for breed liabilities (e.g., Mastitis, Tympany, LSD).
  - **GPS Maps**: Interactive map highlights native breeding states.

### Slide 7: Project Demo & Dashboard
- **Bullet Points**:
  - Live demo of user register/login flow.
  - Running prediction on cattle/buffalo images.
  - Displaying Line & Pie charts for audit counts.
  - Admin database controls.

### Slide 8: Future Extensions & Conclusion
- **Bullet Points**:
  - Deploy model onto low-resource mobile edge nodes (TensorFlow Lite / ONNX).
  - Integrate real-time object detection (YOLO) to isolate animals from background noise.
  - Expand training data to support small ruminants (Goats & Sheep).
  - **Conclusion**: The VedicLivestock AI prototype demonstrates the viability of deep learning in scaling agricultural support.
