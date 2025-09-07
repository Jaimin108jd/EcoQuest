import os
import shutil
import random

images_dir = r"E:\TACO\dataset\images\train"
labels_dir = r"E:\TACO\dataset\labels\train"

val_images_dir = r"E:\TACO\dataset\images\val"
val_labels_dir = r"E:\TACO\dataset\labels\val"

os.makedirs(val_images_dir, exist_ok=True)
os.makedirs(val_labels_dir, exist_ok=True)

all_images = [f for f in os.listdir(images_dir) if f.endswith('.JPG')]
val_count = int(0.1 * len(all_images))  # 10% for validation
val_images = random.sample(all_images, val_count)

for img in val_images:
    shutil.move(os.path.join(images_dir, img), os.path.join(val_images_dir, img))
    lbl = img.replace('.JPG', '.txt')
    shutil.move(os.path.join(labels_dir, lbl), os.path.join(val_labels_dir, lbl))
