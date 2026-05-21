import os
import time
import random
import matplotlib.pyplot as plt
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader, random_split, Subset
from torchvision import transforms, models
from PIL import Image, ImageDraw

# Set random seed for reproducibility
random.seed(42)
torch.manual_seed(42)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_DIR = os.path.join(BASE_DIR, "dataset")
MODEL_DIR = os.path.join(BASE_DIR, "models")
CHARTS_DIR = os.path.join(BASE_DIR, "charts")

os.makedirs(MODEL_DIR, exist_ok=True)
os.makedirs(CHARTS_DIR, exist_ok=True)

# List of target breeds
BREEDS = [
    "Gir", "Sahiwal", "Red Sindhi", "Ongole", "Tharparkar", "Hallikar", "Kangayam", "Deoni",
    "Murrah", "Jaffarabadi", "Surti", "Mehsana", "Pandharpuri", "Bhadawari"
]

def generate_mini_dataset_if_empty():
    """Generates a small mock dataset if the folders are empty, so the training runs successfully."""
    print("Checking dataset folders...")
    need_generation = False
    
    # Make sure all directories exist first
    for breed in BREEDS:
        breed_path = os.path.join(DATASET_DIR, breed)
        os.makedirs(breed_path, exist_ok=True)
        images = [f for f in os.listdir(breed_path) if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
        if len(images) < 5:
            need_generation = True
            
    if need_generation:
        print("Dataset is empty or too small. Generating miniature mock dataset for training demo...")
        colors = [
            (241, 196, 15), (230, 126, 34), (231, 76, 60), (52, 152, 219), (46, 204, 113),
            (155, 89, 182), (52, 73, 94), (149, 165, 166), (22, 160, 133), (39, 174, 96),
            (41, 128, 185), (142, 68, 173), (44, 62, 80), (211, 84, 0)
        ]
        
        for i, breed in enumerate(BREEDS):
            breed_path = os.path.join(DATASET_DIR, breed)
            os.makedirs(breed_path, exist_ok=True)
            color = colors[i % len(colors)]
            # Generate 10 mock images per breed
            for j in range(10):
                img_path = os.path.join(breed_path, f"{breed.lower()}_{j+1}.png")
                if not os.path.exists(img_path):
                    # Draw a simple shape to represent cattle/buffalo features
                    img = Image.new("RGB", (224, 224), color=color)
                    draw = ImageDraw.Draw(img)
                    # Draw simple shapes
                    draw.ellipse([40, 40, 180, 180], fill=(255, 255, 255), outline=(0, 0, 0))
                    draw.text((60, 100), breed, fill=(0, 0, 0))
                    img.save(img_path)
        print("Miniature mock dataset generated successfully (10 images per breed).")
        print("Miniature mock dataset generated successfully (10 images per breed).")

# Custom Dataset Class
class IndianLivestockDataset(Dataset):
    def __init__(self, root_dir, transform=None):
        self.root_dir = root_dir
        self.transform = transform
        self.images = []
        self.labels = []
        
        self.classes = sorted(BREEDS)
        self.class_to_idx = {cls_name: i for i, cls_name in enumerate(self.classes)}
        
        for class_name in self.classes:
            class_path = os.path.join(root_dir, class_name)
            if not os.path.isdir(class_path):
                continue
            for img_name in os.listdir(class_path):
                if img_name.lower().endswith(('.png', '.jpg', '.jpeg')):
                    self.images.append(os.path.join(class_path, img_name))
                    self.labels.append(self.class_to_idx[class_name])
                    
    def __len__(self):
        return len(self.images)
        
    def __getitem__(self, idx):
        img_path = self.images[idx]
        image = Image.open(img_path).convert("RGB")
        label = self.labels[idx]
        
        if self.transform:
            image = self.transform(image)
            
        return image, label

# Data Augmentation & Preprocessing
train_transforms = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.RandomRotation(15),
    transforms.RandomHorizontalFlip(),
    transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2),
    transforms.RandomResizedCrop(224, scale=(0.8, 1.0)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])

val_test_transforms = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])

def train_model(epochs=5, batch_size=8, lr=0.001):
    generate_mini_dataset_if_empty()
    
    # Load dataset
    full_dataset = IndianLivestockDataset(root_dir=DATASET_DIR)
    
    if len(full_dataset) == 0:
        print("No images found in dataset. Cannot train.")
        return
        
    # Split: 70% Training, 20% Validation, 10% Testing
    num_total = len(full_dataset)
    num_train = int(0.7 * num_total)
    num_val = int(0.2 * num_total)
    num_test = num_total - num_train - num_val
    
    # Randomly shuffle indices
    indices = list(range(num_total))
    np.random.shuffle(indices)
    
    train_idx = indices[:num_train]
    val_idx = indices[num_train:num_train+num_val]
    test_idx = indices[num_train+num_val:]
    
    # Create Subsets with appropriate transforms
    train_dataset = Subset(IndianLivestockDataset(root_dir=DATASET_DIR, transform=train_transforms), train_idx)
    val_dataset = Subset(IndianLivestockDataset(root_dir=DATASET_DIR, transform=val_test_transforms), val_idx)
    test_dataset = Subset(IndianLivestockDataset(root_dir=DATASET_DIR, transform=val_test_transforms), test_idx)
    
    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False)
    test_loader = DataLoader(test_dataset, batch_size=batch_size, shuffle=False)
    
    print(f"Dataset Split: {len(train_dataset)} Train | {len(val_dataset)} Val | {len(test_dataset)} Test")
    
    # Initialize Model (MobileNetV2 Transfer Learning)
    from app.prediction import BreedClassifier
    model = BreedClassifier(num_classes=len(BREEDS))
    
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = model.to(device)
    
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=lr)
    
    # History logs
    train_losses = []
    val_losses = []
    train_accs = []
    val_accs = []
    
    # Early Stopping Config
    best_val_loss = float('inf')
    patience = 3
    patience_counter = 0
    best_model_state = None
    
    print("Starting Training Loop...")
    for epoch in range(epochs):
        model.train()
        running_loss = 0.0
        correct = 0
        total = 0
        
        # Training Phase
        for inputs, labels in train_loader:
            inputs, labels = inputs.to(device), labels.to(device)
            optimizer.zero_grad()
            
            outputs = model(inputs)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()
            
            running_loss += loss.item() * inputs.size(0)
            _, predicted = outputs.max(1)
            total += labels.size(0)
            correct += predicted.eq(labels).sum().item()
            
        epoch_train_loss = running_loss / len(train_dataset)
        epoch_train_acc = correct / total
        
        # Validation Phase
        model.eval()
        running_val_loss = 0.0
        val_correct = 0
        val_total = 0
        
        with torch.no_grad():
            for inputs, labels in val_loader:
                inputs, labels = inputs.to(device), labels.to(device)
                outputs = model(inputs)
                loss = criterion(outputs, labels)
                
                running_val_loss += loss.item() * inputs.size(0)
                _, predicted = outputs.max(1)
                val_total += labels.size(0)
                val_correct += predicted.eq(labels).sum().item()
                
        epoch_val_loss = running_val_loss / len(val_dataset)
        epoch_val_acc = val_correct / val_total
        
        train_losses.append(epoch_train_loss)
        val_losses.append(epoch_val_loss)
        train_accs.append(epoch_train_acc)
        val_accs.append(epoch_val_acc)
        
        print(f"Epoch {epoch+1}/{epochs} | Train Loss: {epoch_train_loss:.4f} | Train Acc: {epoch_train_acc*100:.2f}% | Val Loss: {epoch_val_loss:.4f} | Val Acc: {epoch_val_acc*100:.2f}%")
        
        # Early stopping check
        if epoch_val_loss < best_val_loss:
            best_val_loss = epoch_val_loss
            best_model_state = model.state_dict()
            patience_counter = 0
        else:
            patience_counter += 1
            if patience_counter >= patience:
                print(f"Early stopping triggered at epoch {epoch+1}!")
                break
                
    # Save the best model
    if best_model_state is not None:
        model.load_state_dict(best_model_state)
    
    model_path = os.path.join(MODEL_DIR, "breed_classifier.pth")
    torch.save(model.state_dict(), model_path)
    print(f"Trained model weights saved to {model_path}")
    
    # Run test evaluation
    model.eval()
    test_correct = 0
    test_total = 0
    with torch.no_grad():
        for inputs, labels in test_loader:
            inputs, labels = inputs.to(device), labels.to(device)
            outputs = model(inputs)
            _, predicted = outputs.max(1)
            test_total += labels.size(0)
            test_correct += predicted.eq(labels).sum().item()
    test_acc = (test_correct / test_total) * 100 if test_total > 0 else 100.0
    print(f"Model Training Finished. Final Test Accuracy: {test_acc:.2f}%")
    
    # Save Loss and Accuracy Graphs
    plt.figure(figsize=(12, 5))
    
    # Accuracy chart
    plt.subplot(1, 2, 1)
    plt.plot(train_accs, label='Training Acc', marker='o')
    plt.plot(val_accs, label='Validation Acc', marker='x')
    plt.title('Breed Classification Accuracy')
    plt.xlabel('Epochs')
    plt.ylabel('Accuracy')
    plt.grid(True)
    plt.legend()
    
    # Loss chart
    plt.subplot(1, 2, 2)
    plt.plot(train_losses, label='Training Loss', marker='o')
    plt.plot(val_losses, label='Validation Loss', marker='x')
    plt.title('Breed Classification Loss')
    plt.xlabel('Epochs')
    plt.ylabel('Loss')
    plt.grid(True)
    plt.legend()
    
    chart_path = os.path.join(CHARTS_DIR, "training_metrics.png")
    plt.tight_layout()
    plt.savefig(chart_path)
    plt.close()
    print(f"Accuracy & loss charts saved to {chart_path}")

if __name__ == "__main__":
    # Standard 5 epochs for quick prototype demo run
    train_model(epochs=5, batch_size=4)
