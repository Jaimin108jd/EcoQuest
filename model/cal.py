import os

train_dir = r"E:\TACO\dataset\images\train"
val_dir = r"E:\TACO\dataset\images\val"

train_count = len([f for f in os.listdir(train_dir) if f.lower().endswith(('.jpg','.jpeg','.png'))])
val_count = len([f for f in os.listdir(val_dir) if f.lower().endswith(('.jpg','.jpeg','.png'))])

print("Train images:", train_count)
print("Val images:", val_count)
