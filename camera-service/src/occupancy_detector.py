import cv2
import numpy as np
from ultralytics import YOLO
from config import MODEL_SIZE, CONFIDENCE_THRESHOLD
import logging

logger = logging.getLogger(__name__)

class OccupancyDetector:
    def __init__(self):
        try:
            model_name = f'yolov8{MODEL_SIZE}.pt'
            logger.info(f'Loading model: {model_name}')
            self.model = YOLO(model_name)
            logger.info('Model loaded successfully')
        except Exception as e:
            logger.error(f'Failed to load model: {e}')
            self.model = None

    def detect_persons(self, frame):
        """Run YOLOv8 inference and count persons in frame"""
        if self.model is None:
            return 0, []

        try:
            results = self.model(frame, conf=CONFIDENCE_THRESHOLD, classes=0)  # class 0 = person

            detections = []
            person_count = 0

            for result in results:
                for box in result.boxes:
                    if int(box.cls) == 0:  # Person class
                        person_count += 1
                        x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                        conf = float(box.conf)
                        detections.append({
                            'box': (int(x1), int(y1), int(x2), int(y2)),
                            'confidence': conf
                        })

            return person_count, detections

        except Exception as e:
            logger.error(f'Detection error: {e}')
            return 0, []

    def draw_detections(self, frame, detections):
        """Draw bounding boxes on frame (for debugging)"""
        for det in detections:
            x1, y1, x2, y2 = det['box']
            cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
            cv2.putText(
                frame,
                f"{det['confidence']:.2f}",
                (x1, y1 - 10),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.5,
                (0, 255, 0),
                2
            )
        return frame
