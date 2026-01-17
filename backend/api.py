from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
import os

# Optional imports for APU model
try:
    import keras
    import numpy as np
    import pickle
    KERAS_AVAILABLE = True
except ImportError:
    KERAS_AVAILABLE = False
    print("⚠ Keras not available. APU prediction endpoint will be disabled.")

from .services.maintenance_service import MaintenanceService
from fastapi.middleware.cors import CORSMiddleware

from dotenv import load_dotenv
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="Multi-Agent Predictive Maintenance API",
    description="Backend service for railway track maintenance assessment and metro APU prediction",
    version="1.0"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # OK for local dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
service = MaintenanceService()

# ---------------- LOAD APU MODEL ----------------
MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")
apu_model = None
apu_scaler = None
SEQUENCE_LENGTH = 180
N_FEATURES = None

if KERAS_AVAILABLE:
    try:
        apu_model = keras.models.load_model(os.path.join(MODEL_DIR, "gru_model.keras"))
        with open(os.path.join(MODEL_DIR, "scaler.pkl"), "rb") as f:
            apu_scaler = pickle.load(f)
        N_FEATURES = apu_model.input_shape[-1]
        print(f"✓ APU GRU model loaded successfully. Expected features: {N_FEATURES}")
    except Exception as e:
        print(f"⚠ APU model not loaded: {e}")


# -----------------------------
# Request Models
# -----------------------------

class SegmentInput(BaseModel):
    segment_id: int
    features: List[float]


class BatchRequest(BaseModel):
    segments: List[SegmentInput]

class NetworkRequest(BaseModel):
    segments: List[SegmentInput]
# -----------------------------
# Static feature importance
# (from trained RF model)
# -----------------------------
FEATURE_IMPORTANCE = {
    "wear_level": 0.45,
    "vibration_index": 0.37,
    "alignment_deviation": 0.17,
    "load_cycles": 0.005,
    "environment_factor": 0.004
}

# -----------------------------
# API Endpoints
# -----------------------------

@app.get("/")
def health_check():
    return {"status": "API is running"}


@app.post("/assess/batch")
def assess_batch(request: BatchRequest):
    segments = [
        {
            "segment_id": s.segment_id,
            "features": s.features
        }
        for s in request.segments
    ]

    results = service.assess_segments_batch(
        segments,
        FEATURE_IMPORTANCE
    )

    return {
        "count": len(results),
        "results": results
    }
@app.post("/assess/network")
def assess_network(request: NetworkRequest):
    segments = [
        {
            "segment_id": s.segment_id,
            "features": s.features
        }
        for s in request.segments
    ]

    result = service.assess_network(
        segments,
        FEATURE_IMPORTANCE
    )

    return result


# -----------------------------
# APU Prediction Models & Logic
# -----------------------------

class APUPredictRequest(BaseModel):
    sensor_window: List[List[float]]
    car_id: int = 1


def severity_from_rul(rul):
    """Determine severity level based on Remaining Useful Life (hours)"""
    if rul <= 24:
        return 3, "CRITICAL"
    elif rul <= 72:
        return 2, "WARNING"
    else:
        return 1, "NORMAL"


def confidence_from_rul(rul):
    """Calculate confidence score based on RUL"""
    if rul <= 24:
        return 0.9
    elif rul <= 72:
        return 0.7
    return 0.5


def decide_location(car_id):
    """Determine fault location for given car"""
    return {
        "car_id": car_id,
        "zone": "UNDERFLOOR",
        "system": "Air Production Unit"
    }


# -----------------------------
# APU Prediction Endpoint
# -----------------------------

@app.post("/predict/apu")
def predict_apu(payload: APUPredictRequest):
    """
    Predict Remaining Useful Life (RUL) for Metro APU system
    
    Expects:
    - sensor_window: 180 timesteps of sensor data
    - car_id: Metro car identifier
    """
    if not KERAS_AVAILABLE:
        raise HTTPException(
            status_code=503,
            detail="APU prediction service not available (Keras not loaded)"
        )
    
    if apu_model is None or apu_scaler is None:
        raise HTTPException(
            status_code=503,
            detail="APU prediction model not available"
        )
    
    sensor_window = payload.sensor_window
    car_id = payload.car_id

    if len(sensor_window) != SEQUENCE_LENGTH:
        raise HTTPException(
            status_code=400,
            detail=f"sensor_window must contain exactly {SEQUENCE_LENGTH} timesteps, got {len(sensor_window)}"
        )

    X = np.array(sensor_window)

    if X.shape[1] != N_FEATURES:
        raise HTTPException(
            status_code=400,
            detail=f"Expected {N_FEATURES} features per timestep, got {X.shape[1]}"
        )

    # Scale and predict
    X_scaled = apu_scaler.transform(X)
    X_scaled = X_scaled.reshape(1, SEQUENCE_LENGTH, N_FEATURES)

    rul = float(apu_model.predict(X_scaled)[0][0])

    # Determine severity and confidence
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
