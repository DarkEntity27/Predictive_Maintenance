# Unified Backend API

This unified backend combines Railway Track Predictive Maintenance and Metro APU (Air Production Unit) prediction systems into a single FastAPI application.

## Features

### 1. Railway Track Maintenance Assessment
- **Batch Assessment** (`/assess/batch`): Analyze multiple railway segments
- **Network Assessment** (`/assess/network`): Comprehensive network-wide analysis with AI-generated summaries
- ML Model: Random Forest Classifier
- Detects faults: Surface_Crack, Joint_Failure, Rail_Buckling, Normal

### 2. Metro APU Prediction
- **APU Prediction** (`/predict/apu`): Predict Remaining Useful Life (RUL) for metro car APU systems
- ML Model: GRU (Gated Recurrent Unit) Deep Learning Model  
- Predicts: RUL in hours, severity level, confidence score, recommended action

## Installation

```bash
cd backend
pip install -r requirements.txt
```

## Running the Server

```bash
cd ..
python -m uvicorn backend.api:app --reload --port 8000
```

The server will start at `http://127.0.0.1:8000`

## API Endpoints

### Health Check
```bash
GET /
```

### Railway Track - Batch Assessment
```bash
POST /assess/batch
Content-Type: application/json

{
  "segments": [
    {
      "segment_id": 101,
      "features": [0.65, 0.42, 0.28, 150000, 0.75]
    }
  ]
}
```

**Features (in order)**:
1. wear_level (0-1)
2. vibration_index (0-1)
3. alignment_deviation (0-1)
4. load_cycles (integer)
5. environment_factor (0-1)

### Railway Track - Network Assessment
```bash
POST /assess/network
Content-Type: application/json

{
  "segments": [
    {
      "segment_id": 101,
      "features": [0.65, 0.42, 0.28, 150000, 0.75]
    },
    {
      "segment_id": 102,
      "features": [0.85, 0.68, 0.45, 280000, 0.82]
    }
  ]
}
```

### Metro APU - RUL Prediction
```bash
POST /predict/apu
Content-Type: application/json

{
  "sensor_window": [[...180 timesteps x 15 features...]],
  "car_id": 2501
}
```

**Sensor Data**: 
- 180 timesteps (sequential sensor readings)
- 15 features per timestep (sensor values)

## Testing

Run the test suite:

```bash
python backend/test_unified_api.py
```

This will test all endpoints and display results.

## Architecture

```
backend/
├── api.py                      # Main FastAPI application
├── requirements.txt            # Python dependencies
├── test_unified_api.py         # API test suite
├── agents/                     # Multi-agent system for railway
│   ├── prediction_agent.py
│   ├── explanation_agent.py
│   ├── decision_agent.py
│   └── summary_agent.py
├── services/                   # Business logic
│   ├── maintenance_service.py
│   ├── llm_service.py
│   ├── json_exporter.py
│   └── notification_service.py
└── models/                     # ML models
    ├── rf_fault_predictor.pkl  # Railway Random Forest model
    ├── gru_model.keras          # Metro APU GRU model
    └── scaler.pkl              # Feature scaler for APU
```

## Model Details

### Railway Track Model
- **Type**: Random Forest Classifier
- **Input**: 5 features (wear, vibration, alignment, load cycles, environment)
- **Output**: Fault classification + confidence + maintenance recommendation

### Metro APU Model  
- **Type**: GRU Neural Network
- **Input**: 180 timesteps × 15 sensor features
- **Output**: Remaining Useful Life (hours)

## RUL Severity Levels

- **CRITICAL**: RUL ≤ 24 hours (Priority 3, Confidence 0.9)
- **WARNING**: 24 < RUL ≤ 72 hours (Priority 2, Confidence 0.7)
- **NORMAL**: RUL > 72 hours (Priority 1, Confidence 0.5)

## Environment Variables

Create a `.env` file in the backend directory:

```env
OPENAI_API_KEY=your_key_here  # Optional, for AI summaries
EMAIL_API_KEY=your_key_here   # Optional, for notifications
```

## Dependencies

- FastAPI: Web framework
- Uvicorn: ASGI server
- Scikit-learn: Railway ML model
- TensorFlow/Keras: Metro APU deep learning
- NumPy: Numerical computations
- Pydantic: Data validation

## Notes

- The APU model requires TensorFlow 2.20.0+ with compatible Keras
- Railway model uses sklearn 1.5.2 (some warnings about version compatibility are expected)
- Both systems can run independently; if APU model fails to load, railway endpoints remain functional

## Testing Results

All endpoints have been tested and verified:
- ✓ Health Check
- ✓ Railway Batch Assessment
- ✓ Railway Network Assessment  
- ✓ Metro APU Prediction

---

**Last Updated**: January 15, 2026
