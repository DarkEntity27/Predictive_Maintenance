from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
import os
from pathlib import Path

# Optional imports for APU model
try:
    import keras
    import numpy as np
    import pickle
    import pandas as pd
    KERAS_AVAILABLE = True
except ImportError:
    KERAS_AVAILABLE = False
    print("⚠ Keras not available. APU prediction endpoint will be disabled.")

from .services.maintenance_service import MaintenanceService
from fastapi.middleware.cors import CORSMiddleware

from dotenv import load_dotenv
# Load .env from backend directory
env_path = Path(__file__).parent.parent / '.env'
load_dotenv(dotenv_path=env_path)

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
FEATURE_NAMES = [
    'Unnamed: 0', 'TP2', 'TP3', 'H1', 'DV_pressure', 'Reservoirs',
    'Oil_temperature', 'Motor_current', 'COMP', 'DV_eletric', 'Towers',
    'MPG', 'LPS', 'Pressure_switch', 'Oil_level'
]

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
    if rul < 60:
        return 3, "CRITICAL"
    elif rul <= 120:
        return 2, "WARNING"
    else:
        return 1, "NORMAL"


def confidence_from_rul(rul):
    """Calculate confidence score based on RUL"""
    if rul < 60:
        return 0.9
    elif rul <= 120:
        return 0.7
    else:
        return 0.5


def decide_location(car_id):
    """Determine fault location for given car"""
    return {
        "car_id": car_id,
        "zone": "UNDERFLOOR",
        "system": "Air Production Unit"
    }


def calculate_rul_from_sensors(sensor_window):
    """
    Calculate RUL based on sensor values analysis
    Since the ML model is not performing well, use rule-based logic:
    - Low sensor values (0-0.5): Good condition -> High RUL (>120h)
    - Medium sensor values (0.5-0.7): Moderate wear -> Medium RUL (60-120h)
    - High sensor values (0.7-1.0): High wear -> Low RUL (<60h)
    """
    # Get the last timestep (most recent sensor readings)
    latest_sensors = sensor_window[-1]
    
    # Calculate average sensor value
    avg_sensor = np.mean(latest_sensors)
    
    # Count sensors in different ranges
    critical_count = sum(1 for s in latest_sensors if s > 0.7)
    high_count = sum(1 for s in latest_sensors if 0.5 < s <= 0.7)
    normal_count = sum(1 for s in latest_sensors if s <= 0.5)
    
    total_sensors = len(latest_sensors)
    critical_ratio = critical_count / total_sensors
    high_ratio = high_count / total_sensors
    normal_ratio = normal_count / total_sensors
    
    # Determine RUL based on sensor distribution
    if critical_ratio > 0.5:
        # Most sensors critical -> Low RUL (20-60h)
        rul = 20 + (1 - avg_sensor) * 40
    elif critical_ratio > 0.3 or high_ratio > 0.5:
        # Significant critical or mostly high -> Warning range (60-120h)
        rul = 60 + (1 - avg_sensor) * 60
    elif normal_ratio > 0.6:
        # Most sensors normal -> High RUL (120-250h)
        rul = 120 + (1 - avg_sensor) * 130
    else:
        # Mixed conditions -> Lower normal to warning range (90-140h)
        rul = 90 + (1 - avg_sensor) * 50
    
    return max(10, min(300, rul))  # Clamp between 10 and 300 hours


# -----------------------------
# APU Prediction Endpoint
# -----------------------------

@app.post("/predict/apu")
def predict_apu(payload: APUPredictRequest):
    """
    Predict Remaining Useful Life (RUL) for Metro APU system
    WITH OpenAI summaries and email alerts.
    
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

    # Convert to DataFrame with feature names to avoid sklearn warning
    X_df = pd.DataFrame(X, columns=FEATURE_NAMES[:N_FEATURES])
    
    # Calculate RUL from sensor analysis (rule-based logic)
    rul = calculate_rul_from_sensors(X)
    
    # Optionally, you can still use the model but blend it with rule-based
    # X_scaled = apu_scaler.transform(X_df)
    # X_scaled = X_scaled.reshape(1, SEQUENCE_LENGTH, N_FEATURES)
    # model_rul = float(apu_model.predict(X_scaled)[0][0])
    # rul = (rul * 0.7) + (model_rul * 0.3)  # 70% rule-based, 30% model

    # Determine severity and confidence
    priority, severity = severity_from_rul(rul)
    confidence = confidence_from_rul(rul)
    location = decide_location(car_id)

    # ✅ NEW: Integrate with maintenance service for alerts + explanations
    apu_assessment = service.assess_apu(
        severity=priority,
        confidence=confidence,
        car_id=car_id,
        rul_hours=round(rul, 2)
    )

    return {
        "rul_hours": round(rul, 2),
        "priority": priority,
        "severity": severity,
        "confidence": confidence,
        "location": location,
        "action": "Schedule maintenance" if priority >= 2 else "Monitor",
        "explanation": apu_assessment["explanation"],
        "alert_sent": priority >= 2
    }
