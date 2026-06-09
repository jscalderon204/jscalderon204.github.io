"""Training code for the DSC 140B SoCalGuessr project.

Trains the 4-layer CNN described in the project report and saves the best-generalization
checkpoint to `16-32-32-64_best_model.pt`. "Best" is defined as the earliest epoch whose
validation accuracy falls within 1% of the maximum validation accuracy seen across all
epochs, which reduces the risk of selecting an overfit checkpoint.

Paired with `predict.py`, which loads the saved weights and runs inference.
"""

import copy
import json
import pathlib
import random

import numpy as np
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, Dataset, random_split, Subset
from torchvision import transforms
from PIL import Image


# configuration ------------------------------------------------------------------------

# Global seed. Seeding Python, NumPy, and Torch makes the entire run (weight
# initialization, batch shuffling, and the train/validation split) deterministic, so a
# fresh clone of this repository reproduces the reported numbers exactly.
SEED = 42

TRAIN_DIR = pathlib.Path("./data")

CLASSES = sorted(
    [
        "Anaheim",
        "Bakersfield",
        "Los_Angeles",
        "Riverside",
        "SLO",
        "San_Diego",
    ]
)

CLASS_TO_NUMBER = {name: i for i, name in enumerate(CLASSES)}

IMAGE_WIDTH = 64
IMAGE_HEIGHT = 32

MODEL_PATH = "16-32-32-64_best_model.pt"

BATCH_SIZE = 64
LEARNING_RATE = 3e-4
EPOCHS = 80

VALIDATION_FRACTION = 0.2


# dataset ------------------------------------------------------------------------------

class SoCalDataset(Dataset):
    """Loads images from the training set."""

    def __init__(self, root, transform=None):
        self.root = pathlib.Path(root)
        self.transform = transform
        self.samples = []

        for path in sorted(self.root.glob("*.jpg")):
            label = path.name.rsplit("-", 1)[0]
            self.samples.append((path, CLASS_TO_NUMBER[label]))

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, idx):
        path, label = self.samples[idx]
        image = Image.open(path).convert("RGB")
        if self.transform:
            image = self.transform(image)
        return image, label


# training -----------------------------------------------------------------------------

def main():
    random.seed(SEED)
    np.random.seed(SEED)
    torch.manual_seed(SEED)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    model = nn.Sequential(
        nn.Conv2d(3, 16, 3, padding=1),
        nn.BatchNorm2d(16),
        nn.ReLU(),
        nn.MaxPool2d(2),

        nn.Conv2d(16, 32, 3, padding=1),
        nn.BatchNorm2d(32),
        nn.ReLU(),

        nn.Conv2d(32, 32, 3, padding=1),
        nn.BatchNorm2d(32),
        nn.ReLU(),

        nn.Conv2d(32, 64, 3, padding=1),
        nn.BatchNorm2d(64),
        nn.ReLU(),

        nn.AdaptiveAvgPool2d((1, 1)),
        nn.Flatten(),

        nn.Linear(64, 6),
    )
    model = model.to(device)

    transform = transforms.Compose([
        transforms.Resize((IMAGE_WIDTH, IMAGE_HEIGHT)),
        transforms.ToTensor(),
    ])

    full_dataset = SoCalDataset(TRAIN_DIR, transform=None)
    val_size = int(len(full_dataset) * VALIDATION_FRACTION)
    train_size = len(full_dataset) - val_size

    train_subset, val_subset = random_split(
        full_dataset, [train_size, val_size], generator=torch.Generator().manual_seed(SEED)
    )

    train_dataset_full = SoCalDataset(TRAIN_DIR, transform=transform)
    val_dataset_full = SoCalDataset(TRAIN_DIR, transform=transform)

    train_dataset = Subset(train_dataset_full, train_subset.indices)
    val_dataset = Subset(val_dataset_full, val_subset.indices)

    train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=BATCH_SIZE, shuffle=False)

    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=LEARNING_RATE)

    losses = []
    train_accuracies = []
    val_accuracies = []
    all_states = []

    for epoch in range(EPOCHS):
        model.train()
        total_loss = 0.0
        correct = 0
        total = 0

        for images, labels in train_loader:
            images, labels = images.to(device), labels.to(device)

            outputs = model(images)
            loss = criterion(outputs, labels)

            optimizer.zero_grad()
            loss.backward()
            optimizer.step()

            total_loss += loss.item() * labels.size(0)
            preds = outputs.argmax(dim=1)
            correct += (preds == labels).sum().item()
            total += labels.size(0)

        avg_loss = total_loss / total
        accuracy = correct / total
        losses.append(avg_loss)
        train_accuracies.append(accuracy)

        model.eval()
        val_correct = 0
        val_total = 0
        with torch.no_grad():
            for images, labels in val_loader:
                images, labels = images.to(device), labels.to(device)
                outputs = model(images)
                preds = outputs.argmax(dim=1)
                val_correct += (preds == labels).sum().item()
                val_total += labels.size(0)

        val_accuracy = val_correct / val_total
        val_accuracies.append(val_accuracy)
        all_states.append(copy.deepcopy(model.state_dict()))

        print(
            f"Epoch {epoch + 1}/{EPOCHS}  "
            f"loss: {avg_loss:.4f}  "
            f"accuracy: {accuracy:.4f}  "
            f"val_accuracy: {val_accuracy:.4f}",
            flush=True,
        )

    # Select the first epoch within 1% of the best validation accuracy to reduce
    # the risk of saving an overfit checkpoint.
    max_val_acc = max(val_accuracies)
    threshold = max_val_acc - 0.01
    selected_epoch = next(i for i, va in enumerate(val_accuracies) if va >= threshold)

    torch.save(all_states[selected_epoch], MODEL_PATH)

    info = {
        "epoch": selected_epoch + 1,
        "val_accuracy": round(val_accuracies[selected_epoch], 4),
    }
    with open("model_info.json", "w") as f:
        json.dump(info, f, indent=2)

    print(
        f"\nSelected epoch {selected_epoch + 1} "
        f"(val_acc={val_accuracies[selected_epoch]:.4f}, max={max_val_acc:.4f})"
    )
    # Save the full per-epoch history so the training curves can be regenerated by
    # visualize.py without re-running training.
    history = {
        "epochs": list(range(1, EPOCHS + 1)),
        "train_loss": [round(x, 6) for x in losses],
        "train_accuracy": [round(x, 6) for x in train_accuracies],
        "val_accuracy": [round(x, 6) for x in val_accuracies],
        "selected_epoch": selected_epoch + 1,
    }
    with open("history.json", "w") as f:
        json.dump(history, f, indent=2)

    print(f"Saved model to {MODEL_PATH}")
    print("Saved metadata to model_info.json and history.json")


if __name__ == "__main__":
    main()
