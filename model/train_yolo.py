from ultralytics import YOLO

# Load YOLOv8n (nano) model
model = YOLO("yolov8n.pt")

# Train
model.train(
    data="E:/TACO/data.yaml",
    epochs=50,
    imgsz=640,
    batch=16,
    project="runs/train",
    name="taco_yolov8"
)
