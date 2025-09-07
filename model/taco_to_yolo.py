import json
import os
import shutil
from collections import defaultdict
from tqdm import tqdm

# ---------------- Paths ----------------
TACO_ANNOTATIONS = r'E:\TACO\data\annotations.json'
TACO_IMAGES_DIR = r'E:\TACO\data'
YOLO_IMAGES_DIR = r'E:\TACO\dataset\images\train'
YOLO_LABELS_DIR = r'E:\TACO\dataset\labels\train'
LABEL_MAP_FILE = r'E:\TACO\label_map.json'

# ---------------- Broad Class Mapping ----------------
broad_classes = ['plastic', 'paper', 'metal', 'glass', 'organic']

# Save the label map if not exists
if not os.path.exists(LABEL_MAP_FILE):
    label_map_data = {
        "Aluminium foil": "metal",
        "Battery": "metal",
        "Aluminium blister pack": "metal",
        "Carded blister pack": "plastic",
        "Other plastic bottle": "plastic",
        "Plastic drink bottle": "plastic",
        "Glass bottle": "glass",
        "Plastic bottle cap": "plastic",
        "Metal bottle cap": "metal",
        "Broken glass": "glass",
        "Food Can": "metal",
        "Aerosol": "metal",
        "Drink can": "metal",
        "Toilet tube": "plastic",
        "Other carton": "paper",
        "Egg carton": "paper",
        "Drink carton": "paper",
        "Corrugated carton": "paper",
        "Meal carton": "paper",
        "Pizza box": "paper",
        "Paper cup": "paper",
        "Disposable plastic cup": "plastic",
        "Foam cup": "plastic",
        "Glass cup": "glass",
        "Other plastic cup": "plastic",
        "Food waste": "organic",
        "Glass jar": "glass",
        "Plastic lid": "plastic",
        "Metal lid": "metal",
        "Other plastic": "plastic",
        "Magazine paper": "paper",
        "Tissues": "paper",
        "Wrapping paper": "paper",
        "Normal paper": "paper",
        "Paper bag": "paper",
        "Plastified paper bag": "paper",
        "Plastic Film": "plastic",
        "Six pack rings": "plastic",
        "Garbage bag": "plastic",
        "Other plastic wrapper": "plastic",
        "Single-use carrier bag": "plastic",
        "Polypropylene bag": "plastic",
        "Crisp packet": "plastic",
        "Spread tub": "plastic",
        "Tupperware": "plastic",
        "Disposable food container": "plastic",
        "Foam food container": "plastic",
        "Other plastic container": "plastic",
        "Plastic glooves": "plastic",
        "Plastic utensils": "plastic",
        "Pop tab": "metal",
        "Rope & strings": "other",
        "Scrap metal": "metal",
        "Shoe": "other",
        "Squeezable tube": "plastic",
        "Plastic straw": "plastic",
        "Paper straw": "paper",
        "Styrofoam piece": "plastic",
        "Unlabeled litter": "other",
        "Cigarette": "organic"
    }
    with open(LABEL_MAP_FILE, 'w') as f:
        json.dump(label_map_data, f, indent=4)
    print("Created label_map.json")

# ---------------- Create YOLO directories ----------------
os.makedirs(YOLO_IMAGES_DIR, exist_ok=True)
os.makedirs(YOLO_LABELS_DIR, exist_ok=True)

# ---------------- Load JSONs ----------------
with open(TACO_ANNOTATIONS) as f:
    taco_data = json.load(f)
with open(LABEL_MAP_FILE) as f:
    label_map = json.load(f)

class_to_id = {cls: i for i, cls in enumerate(broad_classes)}

cat_id_to_name = {c["id"]: c["name"] for c in taco_data["categories"]}
image_to_annotations = defaultdict(list)
for ann in taco_data["annotations"]:
    image_to_annotations[ann["image_id"]].append(ann)

# ---------------- Process Images ----------------
for img_info in tqdm(taco_data["images"]):
    file_name = img_info["file_name"]
    image_id = img_info["id"]
    width, height = img_info["width"], img_info["height"]
    annotations = image_to_annotations[image_id]

    yolo_lines = []
    for ann in annotations:
        cat_name = cat_id_to_name[ann["category_id"]]
        if cat_name not in label_map:
            continue  # skip categories not mapped

        broad_class = label_map[cat_name]
        if broad_class not in class_to_id:
            continue  # skip "other" or unmapped classes

        class_id = class_to_id[broad_class]
        x, y, w, h = ann["bbox"]
        x_center = (x + w / 2) / width
        y_center = (y + h / 2) / height
        w /= width
        h /= height
        yolo_lines.append(f"{class_id} {x_center:.6f} {y_center:.6f} {w:.6f} {h:.6f}")

    if yolo_lines:
        # Copy image (handle .JPG)
        src_path = os.path.join(TACO_IMAGES_DIR, file_name.replace('/', os.sep))
        if not os.path.exists(src_path):
            src_path = src_path.replace('.jpg', '.JPG')
            if not os.path.exists(src_path):
                print(f"WARNING: Image not found: {file_name}")
                continue

        dst_path = os.path.join(YOLO_IMAGES_DIR, os.path.basename(file_name))
        shutil.copyfile(src_path, dst_path)

        # Write YOLO label
        label_file = os.path.join(YOLO_LABELS_DIR, os.path.basename(file_name).replace('.JPG', '.txt').replace('.jpg', '.txt'))
        with open(label_file, 'w') as f:
            f.write("\n".join(yolo_lines))
