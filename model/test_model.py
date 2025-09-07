from ultralytics import YOLO
from pathlib import Path


MODEL_PATH = r"E:/TACO/runs/detect/train2/weights/best.pt"
CONF_THRESHOLD = 0.02                            


model = YOLO(MODEL_PATH)
print(f"✅ Loaded model from: {MODEL_PATH}")

while True:
    img_input = input("\nEnter image path (or 'exit' to quit): ").strip()
    if img_input.lower() == "exit":
        print("Exiting...")
        break

    img_path = Path(img_input)
    if not img_path.exists():
        print(" File not found. Try again.")
        continue

    # Run prediction
    results = model.predict(str(img_path), conf=CONF_THRESHOLD)
    result = results[0]

    # Show annotated image
    result.show()

    result.save()  # default: runs/detect

    # Print detections in terminal
    print(f"\nDetections for {img_path.name}:")
    if len(result.boxes) == 0:
        print("No detections found.")
    else:
        for box in result.boxes:
            cls_name = model.names[int(box.cls)]
            confidence = float(box.conf)
            bbox = box.xyxy.tolist()
            print(f"Class: {cls_name}, Confidence: {confidence:.2f}, BBox: {bbox}")

    print("\n Detection complete! Annotated image saved in runs/detect/")
