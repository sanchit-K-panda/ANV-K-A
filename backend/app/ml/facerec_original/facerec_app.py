"""
FaceRec — Encrypted Face Registration & Verification (dlib backend)
====================================================================
Minimal PyQt5 GUI using face_recognition (dlib) for detection + encoding.
No manual model downloads needed — everything is bundled with pip install.

Run:
    python facerec_app.py

Requirements:
    pip install face_recognition opencv-python-headless numpy PyQt5 cryptography
"""

import sys
import os
import json
import base64
import time
from datetime import datetime

import cv2
import numpy as np
import face_recognition
from cryptography.fernet import Fernet, InvalidToken

from PyQt5.QtCore import Qt, QTimer, pyqtSignal
from PyQt5.QtGui import QImage, QPixmap, QFont
from PyQt5.QtWidgets import (
    QApplication, QMainWindow, QWidget, QLabel, QPushButton, QLineEdit,
    QVBoxLayout, QHBoxLayout, QFormLayout, QGroupBox, QTabWidget,
    QMessageBox, QProgressBar, QTableWidget, QTableWidgetItem,
    QHeaderView, QSplitter, QTextEdit
)

# --------------------------------------------------------------------------
# Config
# --------------------------------------------------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
KEY_FILE = os.path.join(BASE_DIR, "facerec_secret.key")
DB_FILE = os.path.join(BASE_DIR, "facerec_data.json")

CAMERA_INDEX = 0
FACE_DETECT_MODEL = "hog"
TOLERANCE = 0.38
REGISTER_JITTERS = 1
VERIFY_JITTERS = 1
VERIFY_EVERY_N_FRAMES = 6
REGISTER_SAMPLES = 6

POSES = ["Front", "Left", "Right"]
POSE_INSTRUCTIONS = {
    "Front": "Look straight into the camera.",
    "Left": "Turn your head to show your LEFT profile.",
    "Right": "Turn your head to show your RIGHT profile.",
}

# --------------------------------------------------------------------------
# Crypto helpers
# --------------------------------------------------------------------------
def load_or_create_key() -> bytes:
    if os.path.exists(KEY_FILE):
        with open(KEY_FILE, "rb") as f:
            return f.read()
    key = Fernet.generate_key()
    with open(KEY_FILE, "wb") as f:
        f.write(key)
    os.chmod(KEY_FILE, 0o600)
    return key


FERNET = Fernet(load_or_create_key())


def encrypt_encoding(encoding: np.ndarray) -> str:
    raw = json.dumps(encoding.tolist()).encode("utf-8")
    return base64.urlsafe_b64encode(FERNET.encrypt(raw)).decode("utf-8")


def decrypt_encoding(token_str: str) -> np.ndarray:
    token = base64.urlsafe_b64decode(token_str.encode("utf-8"))
    raw = FERNET.decrypt(token)
    return np.array(json.loads(raw.decode("utf-8")), dtype=np.float64)


# --------------------------------------------------------------------------
# L2 normalization & cosine distance
# --------------------------------------------------------------------------
def l2_normalize(vector: np.ndarray) -> np.ndarray:
    vector = np.asarray(vector, dtype=np.float64)
    norm = np.linalg.norm(vector)
    return vector / norm if norm >= 1e-12 else vector


def cosine_distance(u: np.ndarray, v: np.ndarray) -> float:
    sim = float(np.clip(np.dot(l2_normalize(u), l2_normalize(v)), -1.0, 1.0))
    return 1.0 - sim


def compute_centroid(embeddings: list) -> np.ndarray:
    valid = [l2_normalize(e) for e in embeddings if e is not None and len(e) > 0]
    return l2_normalize(np.mean(valid, axis=0)) if valid else None


# --------------------------------------------------------------------------
# Database helpers
# --------------------------------------------------------------------------
def load_db() -> list:
    if not os.path.exists(DB_FILE):
        return []
    with open(DB_FILE, "r", encoding="utf-8") as f:
        try:
            return json.load(f)
        except json.JSONDecodeError:
            return []


def save_db(records: list) -> None:
    with open(DB_FILE, "w", encoding="utf-8") as f:
        json.dump(records, f, indent=2)


# --------------------------------------------------------------------------
# Face pipeline — detect + encode (dlib backend)
# --------------------------------------------------------------------------
def get_single_face_encoding(bgr_frame: np.ndarray, jitters: int = 1):
    """
    Returns (l2_normalized_encoding or None, status_message).
    Uses face_recognition library (dlib ResNet) — no model files needed.
    """
    rgb = cv2.cvtColor(bgr_frame, cv2.COLOR_BGR2RGB)
    boxes = face_recognition.face_locations(rgb, model=FACE_DETECT_MODEL)
    if len(boxes) == 0:
        return None, "No face detected."
    if len(boxes) > 1:
        return None, "Multiple faces — only one at a time."

    encodings = face_recognition.face_encodings(rgb, known_face_locations=[boxes[0]], num_jitters=jitters)
    if not encodings:
        return None, "Encoding failed — try better lighting."

    return l2_normalize(encodings[0]), "OK"


# --------------------------------------------------------------------------
# Camera widget
# --------------------------------------------------------------------------
class CameraWidget(QWidget):
    frame_ready = pyqtSignal(np.ndarray)

    def __init__(self, parent=None):
        super().__init__(parent)
        self.cap = None
        self.timer = QTimer(self)
        self.timer.timeout.connect(self._tick)

        self.video_label = QLabel("Camera off")
        self.video_label.setAlignment(Qt.AlignCenter)
        self.video_label.setMinimumSize(480, 360)
        self.video_label.setStyleSheet(
            "background-color: #111; color: #888; border-radius: 8px;"
        )
        self.custom_display = False

        layout = QVBoxLayout(self)
        layout.setContentsMargins(0, 0, 0, 0)
        layout.addWidget(self.video_label)

    def start(self):
        if self.cap is not None:
            return
        self.cap = cv2.VideoCapture(CAMERA_INDEX)
        if not self.cap.isOpened():
            self.video_label.setText("Camera not ready\n(Ensure Iriun or webcam is active)")
            self.cap = None
            return
        self.timer.start(30)

    def stop(self):
        self.timer.stop()
        if self.cap is not None:
            self.cap.release()
            self.cap = None
        self.video_label.setText("Camera off")
        self.video_label.setPixmap(QPixmap())

    def _tick(self):
        if self.cap is None:
            return
        ok, frame = self.cap.read()
        if not ok:
            return
        frame = cv2.flip(frame, 1)
        if not self.custom_display:
            self._display(frame)
        self.frame_ready.emit(frame)

    def update_display(self, bgr_frame: np.ndarray):
        self._display(bgr_frame)

    def _display(self, bgr_frame: np.ndarray):
        rgb = cv2.cvtColor(bgr_frame, cv2.COLOR_BGR2RGB)
        h, w, ch = rgb.shape
        qimg = QImage(rgb.data, w, h, ch * w, QImage.Format_RGB888)
        pix = QPixmap.fromImage(qimg).scaled(
            self.video_label.width(), self.video_label.height(),
            Qt.KeepAspectRatio, Qt.SmoothTransformation
        )
        self.video_label.setPixmap(pix)


# --------------------------------------------------------------------------
# REGISTER TAB
# --------------------------------------------------------------------------
class RegisterTab(QWidget):
    def __init__(self):
        super().__init__()
        self.camera = CameraWidget()
        self.captured_encodings = {}

        # Form
        self.name_edit = QLineEdit()
        self.age_edit = QLineEdit()
        self.height_edit = QLineEdit()
        self.height_edit.setPlaceholderText("e.g. 175 cm")
        self.weight_edit = QLineEdit()
        self.weight_edit.setPlaceholderText("e.g. 70 kg")

        form_box = QGroupBox("Your details")
        form = QFormLayout(form_box)
        form.addRow("Name:", self.name_edit)
        form.addRow("Age:", self.age_edit)
        form.addRow("Height:", self.height_edit)
        form.addRow("Weight:", self.weight_edit)

        # Pose capture
        self.pose_status = QLabel(POSE_INSTRUCTIONS["Front"])
        self.pose_status.setFont(QFont("", 11, QFont.Bold))
        self.pose_status.setAlignment(Qt.AlignCenter)

        self.pose_checks = {}
        pose_row = QHBoxLayout()
        for pose in POSES:
            col = QVBoxLayout()
            btn = QPushButton(f"Capture {pose}")
            btn.clicked.connect(lambda _, p=pose: self.capture_pose(p))
            check = QLabel("not captured")
            check.setAlignment(Qt.AlignCenter)
            check.setStyleSheet("color: #aa4444;")
            col.addWidget(btn)
            col.addWidget(check)
            pose_row.addLayout(col)
            self.pose_checks[pose] = check

        self.save_btn = QPushButton("Save Registration")
        self.save_btn.setStyleSheet(
            "background-color:#2e7d32; color:white; font-weight:bold; padding:8px;"
        )
        self.save_btn.clicked.connect(self.save_registration)

        self.status_label = QLabel("")
        self.status_label.setAlignment(Qt.AlignCenter)

        right_panel = QVBoxLayout()
        right_panel.addWidget(form_box)
        right_panel.addWidget(self.pose_status)
        right_panel.addLayout(pose_row)
        right_panel.addWidget(self.save_btn)
        right_panel.addWidget(self.status_label)
        right_panel.addStretch()

        root = QHBoxLayout(self)
        root.addWidget(self.camera, 2)
        right_container = QWidget()
        right_container.setLayout(right_panel)
        root.addWidget(right_container, 1)

    def capture_pose(self, pose: str):
        if self.camera.cap is None:
            QMessageBox.warning(self, "Camera off", "Camera isn't running.")
            return

        self.pose_status.setText(f"Burst capturing {pose}... hold steady")
        self.pose_checks[pose].setText("capturing...")
        self.pose_checks[pose].setStyleSheet("color: #d97706; font-weight:bold;")
        QApplication.processEvents()

        burst_encodings = []
        attempts = 0

        while len(burst_encodings) < REGISTER_SAMPLES and attempts < 50:
            attempts += 1
            ok, frame = self.camera.cap.read()
            if not ok:
                continue
            frame = cv2.flip(frame, 1)
            encoding, msg = get_single_face_encoding(frame, jitters=REGISTER_JITTERS)
            if encoding is not None:
                burst_encodings.append(encoding)
                self.pose_status.setText(f"Burst {pose}: {len(burst_encodings)}/{REGISTER_SAMPLES}")
            else:
                self.pose_status.setText(f"Burst {pose} [{len(burst_encodings)}/{REGISTER_SAMPLES}]: {msg}")
            QApplication.processEvents()
            time.sleep(0.03)

        if len(burst_encodings) < 3:
            self.pose_status.setText(f"{pose} capture failed: insufficient frames.")
            self.pose_checks[pose].setText("failed")
            self.pose_checks[pose].setStyleSheet("color:#aa4444;")
            return

        centroid = compute_centroid(burst_encodings)
        self.captured_encodings[pose] = centroid
        self.pose_checks[pose].setText(f"captured ({len(burst_encodings)} samples)")
        self.pose_checks[pose].setStyleSheet("color:#2e7d32; font-weight:bold;")
        next_pose = POSES[(POSES.index(pose) + 1) % len(POSES)]
        self.pose_status.setText(f"Saved {pose}! Next: {POSE_INSTRUCTIONS[next_pose]}")

    def save_registration(self):
        name = self.name_edit.text().strip()
        age = self.age_edit.text().strip()
        height = self.height_edit.text().strip()
        weight = self.weight_edit.text().strip()

        if not name:
            QMessageBox.warning(self, "Missing info", "Please enter a name.")
            return
        if len(self.captured_encodings) < len(POSES):
            missing = [p for p in POSES if p not in self.captured_encodings]
            QMessageBox.warning(self, "Missing captures", f"Please capture: {', '.join(missing)}")
            return

        encrypted_encodings = {
            pose: encrypt_encoding(enc)
            for pose, enc in self.captured_encodings.items()
        }

        record = {
            "name": name,
            "age": age,
            "height": height,
            "weight": weight,
            "registered_at": datetime.now().isoformat(timespec="seconds"),
            "encodings": encrypted_encodings,
        }

        db = load_db()
        db.append(record)
        save_db(db)

        self.status_label.setText(f"Saved '{name}' to {os.path.basename(DB_FILE)}")
        self.status_label.setStyleSheet("color:#2e7d32; font-weight:bold;")

        self.captured_encodings.clear()
        for pose in POSES:
            self.pose_checks[pose].setText("not captured")
            self.pose_checks[pose].setStyleSheet("color:#aa4444;")
        self.name_edit.clear()
        self.age_edit.clear()
        self.height_edit.clear()
        self.weight_edit.clear()
        self.pose_status.setText(POSE_INSTRUCTIONS["Front"])


# --------------------------------------------------------------------------
# VERIFY TAB
# --------------------------------------------------------------------------
class VerifyTab(QWidget):
    def __init__(self):
        super().__init__()
        self.camera = CameraWidget()
        self.camera.custom_display = True
        self.camera.frame_ready.connect(self.on_frame)
        self.frame_counter = 0
        self.scanning = False
        self.verified_person_locked = False

        self.toggle_btn = QPushButton("Start Scan")
        self.toggle_btn.clicked.connect(self.toggle_scan)

        self.result_box = QGroupBox("Verification Result")
        result_layout = QFormLayout(self.result_box)
        self.name_val = QLabel("—")
        self.age_val = QLabel("—")
        self.height_val = QLabel("—")
        self.weight_val = QLabel("—")
        self.confidence_val = QLabel("—")
        self.distance_val = QLabel("—")
        self.status_label = QLabel("Press Start Scan")
        self.status_label.setAlignment(Qt.AlignCenter)
        self.status_label.setFont(QFont("", 11, QFont.Bold))

        for lbl in (self.name_val, self.age_val, self.height_val,
                    self.weight_val, self.confidence_val, self.distance_val):
            lbl.setFont(QFont("", 11))

        result_layout.addRow("Name:", self.name_val)
        result_layout.addRow("Age:", self.age_val)
        result_layout.addRow("Height:", self.height_val)
        result_layout.addRow("Weight:", self.weight_val)
        result_layout.addRow("Match confidence:", self.confidence_val)
        result_layout.addRow("Distance:", self.distance_val)

        right_panel = QVBoxLayout()
        right_panel.addWidget(self.toggle_btn)
        right_panel.addWidget(self.status_label)
        right_panel.addWidget(self.result_box)
        right_panel.addStretch()

        root = QHBoxLayout(self)
        root.addWidget(self.camera, 2)
        right_container = QWidget()
        right_container.setLayout(right_panel)
        root.addWidget(right_container, 1)

    def toggle_scan(self):
        self.scanning = not self.scanning
        self.toggle_btn.setText("Stop Scan" if self.scanning else "Start Scan")
        self.status_label.setText("Scanning..." if self.scanning else "Paused")
        self.status_label.setStyleSheet("")
        if not self.scanning:
            self.clear_result()

    def clear_result(self):
        for lbl in (self.name_val, self.age_val, self.height_val,
                    self.weight_val, self.confidence_val, self.distance_val):
            lbl.setText("—")
        self.verified_person_locked = False

    def on_frame(self, frame: np.ndarray):
        if not self.scanning or self.verified_person_locked:
            return

        self.frame_counter += 1
        if self.frame_counter % VERIFY_EVERY_N_FRAMES != 0:
            return

        encoding, msg = get_single_face_encoding(frame, jitters=VERIFY_JITTERS)
        if encoding is None:
            self.status_label.setText(msg)
            self.status_label.setStyleSheet("color:#d97706;")
            cv2.putText(frame, msg, (20, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 165, 255), 2)
            self.camera.update_display(frame)
            return

        db = load_db()
        if not db:
            self.status_label.setText("No registered faces in database.")
            self.status_label.setStyleSheet("color:#888;")
            self.camera.update_display(frame)
            return

        best_name = None
        best_distance = None
        best_record = None

        for record in db:
            for pose, token in record.get("encodings", {}).items():
                try:
                    stored = decrypt_encoding(token)
                except (InvalidToken, Exception):
                    continue
                dist = cosine_distance(stored, encoding)
                if best_distance is None or dist < best_distance:
                    best_distance = dist
                    best_name = record["name"]
                    best_record = record

        if best_distance is not None and best_distance <= TOLERANCE:
            confidence = max(0.0, (1.0 - best_distance / TOLERANCE)) * 100
            self.status_label.setText(f"ACCESS GRANTED: {best_name}")
            self.status_label.setStyleSheet("color:#2e7d32; font-weight:bold;")
            self.name_val.setText(best_record["name"])
            self.age_val.setText(best_record.get("age", "—"))
            self.height_val.setText(best_record.get("height", "—"))
            self.weight_val.setText(best_record.get("weight", "—"))
            self.confidence_val.setText(f"{confidence:.1f}%")
            self.distance_val.setText(f"{best_distance:.4f}")
            cv2.putText(frame, f"GRANTED: {best_name}", (20, 40),
                        cv2.FONT_HERSHEY_SIMPLEX, 1.0, (0, 255, 0), 2)
            self.verified_person_locked = True
        else:
            dist_str = f" (dist={best_distance:.3f})" if best_distance else ""
            self.status_label.setText(f"Unknown — not registered{dist_str}")
            self.status_label.setStyleSheet("color:#aa4444;")
            self.clear_result()
            cv2.putText(frame, "UNKNOWN", (20, 40),
                        cv2.FONT_HERSHEY_SIMPLEX, 1.0, (0, 0, 255), 2)

        self.camera.update_display(frame)


# --------------------------------------------------------------------------
# MAIN WINDOW
# --------------------------------------------------------------------------
class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("FaceRec — Encrypted Face Registration & Verification")
        self.resize(1060, 680)

        self.register_tab = RegisterTab()
        self.verify_tab = VerifyTab()

        self.tabs = QTabWidget()
        self.tabs.addTab(self.register_tab, "Register")
        self.tabs.addTab(self.verify_tab, "Verify")
        self.tabs.currentChanged.connect(self.on_tab_changed)
        self.setCentralWidget(self.tabs)

        self.on_tab_changed(self.tabs.currentIndex())

    def on_tab_changed(self, index: int):
        self.register_tab.camera.stop()
        self.verify_tab.camera.stop()
        self.verify_tab.scanning = False
        self.verify_tab.toggle_btn.setText("Start Scan")
        widget = self.tabs.widget(index)
        if isinstance(widget, RegisterTab):
            widget.camera.start()
        elif isinstance(widget, VerifyTab):
            widget.camera.start()

    def closeEvent(self, event):
        self.register_tab.camera.stop()
        self.verify_tab.camera.stop()
        event.accept()


# --------------------------------------------------------------------------
# Entry point
# --------------------------------------------------------------------------
def main():
    app = QApplication(sys.argv)
    window = MainWindow()
    window.show()
    sys.exit(app.exec_())


if __name__ == "__main__":
    main()
