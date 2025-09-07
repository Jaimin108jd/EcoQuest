import os
import shutil

# Destination folder
dest_folder = r"E:\TACO\images\all_images"
os.makedirs(dest_folder, exist_ok=True)

# Loop through all 7 batch folders
for i in range(1, 8):
    src_folder = rf"E:\TACO\data\batch_{i}"  # remove \images
    if os.path.exists(src_folder):
        for file_name in os.listdir(src_folder):
            if file_name.lower().endswith((".jpg", ".jpeg", ".png")):
                src_file = os.path.join(src_folder, file_name)
                dest_file = os.path.join(dest_folder, file_name)
                shutil.copy2(src_file, dest_file)
    else:
        print(f"Folder not found: {src_folder}")

print("All images copied successfully!")
