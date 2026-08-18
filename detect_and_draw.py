import os
import cv2
import torch
import numpy as np

# --- Settings ---
WEIGHTS = "runs/train/custom_run/weights/best.pt"  # path to your trained .pt
IMG_PATH = "input.jpg"                             # input image path
OUT_PATH = "output_detected.jpg"                   # output image path
CONF_THRESH = 0.25
IOU_THRESH = 0.45
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

# Colors for classes (one color per class index) in BGR format
COLORS = [
    (0, 255, 255),   # yellow
    (0, 0, 255),     # red
    (0, 255, 0),     # green
    (255, 0, 0),     # blue
    (255, 0, 255),   # magenta
    (0, 165, 255),   # orange
]

def load_model(weights_path, device):
    """
    Load a custom YOLOv5 model from a .pt file using torch.hub.
    """
    model = torch.hub.load('ultralytics/yolov5', 'custom', path=weights_path, force_reload=False)
    model.to(device)
    return model

def draw_boxes(image, detections, class_names):
    """
    Draw bounding boxes and labels on the image.
    detections: array of [xmin, ymin, xmax, ymax, confidence, class]
    class_names: dict or list mapping class index to name
    """
    h, w = image.shape[:2]
    for det in detections:
        xmin, ymin, xmax, ymax, conf, cls = det
        cls = int(cls)
        color = COLORS[cls % len(COLORS)]
        label = f"{class_names[cls]} {conf:.2f}"
        # draw rectangle
        cv2.rectangle(image, (int(xmin), int(ymin)), (int(xmax), int(ymax)), color, 2)
        # label background
        (text_w, text_h), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1)
        cv2.rectangle(image, (int(xmin), int(ymin) - text_h - 6), (int(xmin) + text_w, int(ymin)), color, -1)
        cv2.putText(image, label, (int(xmin), int(ymin) - 4), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1, cv2.LINE_AA)
    return image

def run_detection(image_path, out_path, model, conf_thresh=0.25, iou_thresh=0.45):
    """
    Run detection on a single image and save the result with drawn boxes.
    """
    # load image
    img = cv2.imread(image_path)
    if img is None:
        raise FileNotFoundError(f"Image not found: {image_path}")
    # inference using the yolov5 model API
    results = model(img, size=640)
    # extract predictions: [xmin, ymin, xmax, ymax, conf, cls]
    preds = results.xyxy[0].cpu().numpy()
    preds = preds[preds[:, 4] >= conf_thresh]
    class_names = results.names  # mapping index -> name
    # draw boxes and save
    output_img = draw_boxes(img.copy(), preds, class_names)
    cv2.imwrite(out_path, output_img)
    print(f"Result saved to {out_path}")

if __name__ == "__main__":
    model = load_model(WEIGHTS, DEVICE)
    # adjust thresholds if desired
    model.conf = CONF_THRESH
    model.iou = IOU_THRESH
    run_detection(IMG_PATH, OUT_PATH, model, CONF_THRESH, IOU_THRESH)
