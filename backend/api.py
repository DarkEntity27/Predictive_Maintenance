from fastapi import FastAPI
from pydantic import BaseModel
from typing import List

from .services.maintenance_service import MaintenanceService
from fastapi.middleware.cors import CORSMiddleware

from dotenv import load_dotenv
load_dotenv()

app = FastAPI(
    title="Multi-Agent Predictive Maintenance API",
    description="Backend service for railway track maintenance assessment",
    version="1.0"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # OK for local dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
service = MaintenanceService()

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