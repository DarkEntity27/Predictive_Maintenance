from fastapi import FastAPI, HTTPException
import numpy as np
import pickle
import tensorflow as tf
from fastapi.middleware.cors import CORSMiddleware


# ---------------- LOAD MODEL ----------------
model = tf.keras.models.load_model("gru_model.keras")

with open("scaler.pkl", "rb") as f:
    scaler = pickle.load(f)

SEQUENCE_LENGTH = 180
N_FEATURES = model.input_shape[-1]

app = FastAPI(title="Metro APU Predictive Maintenance API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],      # allow frontend on localhost:5500
    allow_credentials=True,
    allow_methods=["*"],      # allow POST, OPTIONS, etc.
    allow_headers=["*"],
)


# ---------------- LOGIC ----------------
def severity_from_rul(rul):
    if rul <= 24:
        return 3, "CRITICAL"
    elif rul <= 72:
        return 2, "WARNING"
    else:
        return 1, "NORMAL"

def confidence_from_rul(rul):
    """
    Simple, defensible confidence heuristic:
    lower RUL → higher confidence
    """
    if rul <= 24:
        return 0.9
    elif rul <= 72:
        return 0.7
    return 0.5

def decide_location(car_id):
    return {
        "car_id": car_id,
        "zone": "UNDERFLOOR",
        "system": "Air Production Unit"
    }

# ---------------- API ----------------
@app.post("/predict/apu")
def predict(payload: dict):
    sensor_window = payload.get("sensor_window")
    car_id = payload.get("car_id", 1)

    if sensor_window is None or len(sensor_window) != SEQUENCE_LENGTH:
        raise HTTPException(
            status_code=400,
            detail="sensor_window must contain exactly 180 timesteps"
        )

    X = np.array(sensor_window)

    if X.shape[1] != N_FEATURES:
        raise HTTPException(
            status_code=400,
            detail=f"Expected {N_FEATURES} features, got {X.shape[1]}"
        )

    X_scaled = scaler.transform(X)
    X_scaled = X_scaled.reshape(1, SEQUENCE_LENGTH, N_FEATURES)

    rul = float(model.predict(X_scaled)[0][0])

    priority, severity = severity_from_rul(rul)
    confidence = confidence_from_rul(rul)
    location = decide_location(car_id)

    return {
        "rul_hours": round(rul, 2),
        "priority": priority,
        "severity": severity,
        "confidence": confidence,
        "location": location,
        "action": "Schedule maintenance" if priority >= 2 else "Monitor"
    }
