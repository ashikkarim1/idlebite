import cv2
import logging
from config import CAMERA_RTSP_URL, DETECTION_INTERVAL

logger = logging.getLogger(__name__)

class CameraCapture:
    def __init__(self, rtsp_url=CAMERA_RTSP_URL):
        self.rtsp_url = rtsp_url
        self.cap = None
        self.frame_count = 0
        self.is_connected = False

    def connect(self):
        """Connect to RTSP stream"""
        try:
            logger.info(f'Connecting to {self.rtsp_url}')
            self.cap = cv2.VideoCapture(self.rtsp_url)

            if not self.cap.isOpened():
                logger.error('Failed to open camera stream')
                return False

            self.is_connected = True
            logger.info('Camera connected successfully')
            return True
        except Exception as e:
            logger.error(f'Connection error: {e}')
            return False

    def get_frame(self):
        """Get next frame from stream"""
        if not self.is_connected or self.cap is None:
            return None

        try:
            ret, frame = self.cap.read()
            if ret:
                self.frame_count += 1
                return frame
            else:
                logger.warning('Failed to read frame')
                self.is_connected = False
                return None
        except Exception as e:
            logger.error(f'Frame capture error: {e}')
            self.is_connected = False
            return None

    def should_process(self):
        """Check if this frame should be processed (based on interval)"""
        return self.frame_count % DETECTION_INTERVAL == 0

    def disconnect(self):
        """Close camera stream"""
        if self.cap is not None:
            self.cap.release()
            self.is_connected = False
            logger.info('Camera disconnected')
