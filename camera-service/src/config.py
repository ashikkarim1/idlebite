import os
from dotenv import load_dotenv

load_dotenv()

# Backend API
API_URL = os.getenv('API_URL', 'http://backend:3001')
API_KEY = os.getenv('API_KEY', 'demo-key')

# Camera settings
CAMERA_RTSP_URL = os.getenv('CAMERA_RTSP_URL', 'rtsp://localhost:8554/stream')
CAMERA_NAME = os.getenv('CAMERA_NAME', 'dining_room')
CAMERA_ZONE = os.getenv('CAMERA_ZONE', 'dining_room')
RESTAURANT_ID = os.getenv('RESTAURANT_ID', 'f47ac10b-58cc-4372-a567-0e02b2c3d479')

# Processing
DETECTION_INTERVAL = int(os.getenv('DETECTION_INTERVAL', '2'))  # Process every N frames
MODEL_SIZE = os.getenv('MODEL_SIZE', 'nano')  # nano, small, medium
CONFIDENCE_THRESHOLD = float(os.getenv('CONFIDENCE_THRESHOLD', '0.5'))

# Demo mode (generate fake data instead of real CV)
DEMO_MODE = os.getenv('DEMO_MODE', 'true').lower() == 'true'

print(f'Camera Service Config:')
print(f'  API_URL: {API_URL}')
print(f'  Camera: {CAMERA_NAME} ({CAMERA_ZONE})')
print(f'  RTSP: {CAMERA_RTSP_URL}')
print(f'  Demo Mode: {DEMO_MODE}')
