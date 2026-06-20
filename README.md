# 🚆 RailGuard: Unified Predictive Maintenance System

![React](https://img.shields.io/badge/React-18-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue) ![FastAPI](https://img.shields.io/badge/FastAPI-Modern-009688) ![TensorFlow](https://img.shields.io/badge/TensorFlow-2.20+-FF6F00) ![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-1.5+-F7931E)

RailGuard is a comprehensive, AI-powered predictive maintenance platform designed for public infrastructure. This repository houses a unified system featuring a modern web dashboard and a robust multi-model machine learning backend. 

It handles two primary domains:
1. **Railway Track Maintenance:** Assesses track degradation and recommends maintenance using a Random Forest model and a multi-agent system.
2. **Metro APU (Air Production Unit):** Predicts the Remaining Useful Life (RUL) of APUs using deep learning (GRU) for continuous time-series sensor data.

---

## ✨ Key Features

### Frontend (Dashboard)
- 📊 **Real-time Monitoring & Configuration:** Interactive UI to configure track segments (wear, vibration, alignment, load cycles).
- ⚡ **Instant AI Insights:** Actionable maintenance recommendations generated with 99.2% accuracy.
- 🎯 **Visual Risk Assessment:** Color-coded track visualization and detailed fault assessment tables.

### Backend (Unified API & ML)
- 🧠 **Multi-Model Architecture:** - **Railway Track:** Random Forest Classifier (detects Surface_Crack, Joint_Failure, Rail_Buckling, Normal).
  - **Metro APU:** GRU Neural Network analyzing 180 timesteps × 15 sensor features to predict RUL.
- 🤖 **Agentic Summaries:** Integrated multi-agent system (Prediction, Explanation, Decision, and Summary agents) for network-wide natural language analysis.
- 🔔 **RUL Severity System:** Automatically flags Critical (≤ 24h), Warning (24-72h), and Normal (> 72h) component statuses.

---

## 🛠️ Technology Stack

| Frontend | Backend | Machine Learning |
| :--- | :--- | :--- |
| React 18 & TypeScript | FastAPI (Python 3.8+) | Scikit-Learn |
| Vite | Uvicorn | TensorFlow / Keras |
| React Router v6 | Pydantic | Pandas & NumPy |
| Recharts & Lucide | Multi-Agent System | LLM Integration |

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js 18+
- Python 3.8+

### 1. Backend Setup
Navigate to the backend directory, install dependencies, and start the FastAPI server:

```bash
cd backend
pip install -r requirements.txt

# Start the API server
python -m uvicorn api:app --reload --port 8000
python -m uvicorn backend.api:app --reload --port 8000
```

*The API will be available at `http://127.0.0.1:8000*`

### 2. Environment Variables

Create a `.env` file in the `backend` directory:

```env
OPENAI_API_KEY=your_key_here  # Optional: For AI multi-agent summaries
EMAIL_API_KEY=your_key_here   # Optional: For automated notifications

```

Create a `.env` file in the `railguard-dashboard` directory:

```env
VITE_API_URL=[http://127.0.0.1:8000](http://127.0.0.1:8000)

```

### 3. Frontend Setup

In a new terminal window, navigate to the dashboard directory and start the Vite development server:

```bash
cd railguard-dashboard
npm install
npm run dev

```

*The web app will be available at `http://localhost:3000*`

---

## 📡 Core API Endpoints

The FastAPI backend exposes the following primary routes:

| Endpoint | Method | Description |
| --- | --- | --- |
| `/` | `GET` | Health check |
| `/assess/batch` | `POST` | Analyze multiple railway segments instantly |
| `/assess/network` | `POST` | Comprehensive analysis with AI-generated text summaries |
| `/predict/apu` | `POST` | Predict RUL in hours for metro car APU systems |

**Example APU Request:**

```json
{
  "sensor_window": [[...180 timesteps x 15 features...]],
  "car_id": 2501
}

```

---

## 🧪 Testing

To run the unified test suite and verify all API endpoints and ML model connections:

```bash
cd backend
python test_unified_api.py

```

*Tests Health Checks, Railway Batch Assessment, Railway Network Assessment, and Metro APU Prediction.*

---

## 📁 Repository Structure

```text
Predictive_Maintenance/
├── backend/                      # Python FastAPI Backend
│   ├── api.py                    # Main application entry point
│   ├── agents/                   # LLM Multi-agent analysis system
│   ├── models/                   # Serialized ML models (.pkl, .keras)
│   ├── services/                 # Business logic & integrations
│   └── test_unified_api.py       # Comprehensive test suite
│
└── railguard-dashboard/          # React/Vite Frontend
    ├── src/
    │   ├── components/           # Reusable UI elements & charts
    │   ├── pages/                # Landing and Dashboard views
    │   ├── services/             # Axios API client
    │   └── types/                # TypeScript interfaces
    └── public/                   # Static assets (3D models, images)

```

## 🛡️ License

© 2026 RailGuard. All rights reserved.

```

```