import json
import base64
import cv2
import numpy as np
import face_recognition
from cryptography.fernet import Fernet, InvalidToken
from typing import Tuple, Optional

from app.core.config import settings

# Initialize Fernet with the secure key
fernet_key = settings.BIOMETRIC_FERNET_KEY.encode('utf-8')
FERNET = Fernet(fernet_key)

FACE_DETECT_MODEL = "hog"
TOLERANCE = 0.38

def decrypt_encoding(token_str: str) -> np.ndarray:
    """Decrypt a base64 encoded Fernet token back into a numpy array."""
    try:
        token = base64.urlsafe_b64decode(token_str.encode("utf-8"))
        raw = FERNET.decrypt(token)
        return np.array(json.loads(raw.decode("utf-8")), dtype=np.float64)
    except (InvalidToken, Exception) as e:
        raise ValueError("Invalid biometric token") from e

def l2_normalize(vector: np.ndarray) -> np.ndarray:
    vector = np.asarray(vector, dtype=np.float64)
    norm = np.linalg.norm(vector)
    return vector / norm if norm >= 1e-12 else vector

def cosine_distance(u: np.ndarray, v: np.ndarray) -> float:
    sim = float(np.clip(np.dot(l2_normalize(u), l2_normalize(v)), -1.0, 1.0))
    return 1.0 - sim

def get_single_face_encoding(image_bytes: bytes) -> Tuple[Optional[np.ndarray], str]:
    """
    Decodes an image from bytes, detects a single face, and returns its encoding.
    Returns (encoding, status_message).
    """
    # Convert bytes to numpy array for OpenCV
    nparr = np.frombuffer(image_bytes, np.uint8)
    bgr_frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if bgr_frame is None:
        return None, "Failed to decode image."

    rgb = cv2.cvtColor(bgr_frame, cv2.COLOR_BGR2RGB)
    boxes = face_recognition.face_locations(rgb, model=FACE_DETECT_MODEL)
    
    if len(boxes) == 0:
        return None, "No face detected."
    if len(boxes) > 1:
        return None, "Multiple faces detected — only one at a time."

    encodings = face_recognition.face_encodings(rgb, known_face_locations=[boxes[0]], num_jitters=1)
    if not encodings:
        return None, "Encoding failed — try better lighting."

    return l2_normalize(encodings[0]), "OK"

def encrypt_encoding(encoding: np.ndarray) -> str:
    """Helper function to encrypt a numpy array to a Fernet token (useful for seeding)."""
    raw = json.dumps(encoding.tolist()).encode("utf-8")
    return base64.urlsafe_b64encode(FERNET.encrypt(raw)).decode("utf-8")
