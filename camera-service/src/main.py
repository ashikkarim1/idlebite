#!/usr/bin/env python3
import time
import logging
import requests
import random
from camera_capture import CameraCapture
from occupancy_detector import OccupancyDetector
from config import (
    API_URL,
    CAMERA_NAME,
    CAMERA_ZONE,
    RESTAURANT_ID,
    DEMO_MODE
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(name)s] %(levelname)s: %(message)s'
)
logger = logging.getLogger(__name__)

def send_event(event_type, data, camera_id=None):
    """Send event to backend API"""
    try:
        payload = {
            'restaurant_id': RESTAURANT_ID,
            'event_type': event_type,
            'data': data,
            'camera_id': camera_id
        }
        response = requests.post(
            f'{API_URL}/api/events',
            json=payload,
            timeout=5
        )
        if response.status_code == 201:
            logger.debug(f'Event sent: {event_type}')
        else:
            logger.warning(f'Event send failed: {response.status_code}')
    except Exception as e:
        logger.error(f'Failed to send event: {e}')

def demo_mode():
    """Generate fake occupancy data for testing"""
    logger.info('Running in DEMO MODE')
    base_occupancy = 45
    trend = 0

    while True:
        try:
            # Simulate occupancy trending
            change = random.randint(-5, 5)
            base_occupancy = max(0, min(100, base_occupancy + change))

            send_event(
                'occupancy',
                {'count': int(base_occupancy), 'zone': CAMERA_ZONE}
            )

            logger.info(f'Occupancy: {int(base_occupancy)}')
            time.sleep(5)

        except KeyboardInterrupt:
            logger.info('Demo mode stopped')
            break
        except Exception as e:
            logger.error(f'Error in demo mode: {e}')
            time.sleep(5)

def real_mode():
    """Real camera processing"""
    logger.info('Running in REAL MODE')

    camera = CameraCapture()
    detector = OccupancyDetector()

    if not camera.connect():
        logger.error('Failed to connect to camera, falling back to demo mode')
        demo_mode()
        return

    try:
        last_send_time = 0
        send_interval = 5  # Send event every 5 seconds max

        while True:
            frame = camera.get_frame()
            if frame is None:
                logger.warning('Lost camera connection, attempting reconnect...')
                if not camera.connect():
                    time.sleep(5)
                    continue

            if camera.should_process():
                person_count, detections = detector.detect_persons(frame)

                current_time = time.time()
                if current_time - last_send_time >= send_interval:
                    send_event(
                        'occupancy',
                        {'count': person_count, 'zone': CAMERA_ZONE, 'confidence': 0.95}
                    )
                    logger.info(f'Occupancy: {person_count} persons detected')
                    last_send_time = current_time

            time.sleep(0.033)  # ~30 FPS

    except KeyboardInterrupt:
        logger.info('Shutting down')
    finally:
        camera.disconnect()

if __name__ == '__main__':
    logger.info(f'Camera Service starting - {CAMERA_NAME} ({CAMERA_ZONE})')

    if DEMO_MODE:
        demo_mode()
    else:
        real_mode()
