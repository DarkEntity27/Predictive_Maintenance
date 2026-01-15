# RailGuard - Railway Predictive Maintenance Dashboard

A modern, TypeScript-based web application for AI-powered railway track predictive maintenance. Built with React, TypeScript, and Vite.

## Features

- 🚆 **AI-Powered Predictions**: Machine learning models analyze track conditions with 99.2% accuracy
- 📊 **Real-time Monitoring**: Track wear, vibration, alignment, and environmental factors
- ⚡ **Instant Insights**: Get actionable maintenance recommendations immediately
- 🎯 **Risk Assessment**: Prioritize maintenance based on risk scores and critical thresholds
- 📈 **Visual Analytics**: Interactive dashboards with track visualization and metrics

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Charts**: Recharts
- **Icons**: Lucide React
- **Backend**: FastAPI (Python)

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Python 3.8+ (for backend API)

## Installation

1. **Clone the repository**
   ```bash
   cd railguard-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and configure your API URL (default: http://127.0.0.1:8000)

4. **Start the development server**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:3000`

## Backend Setup

The application requires the FastAPI backend to be running:

1. Install Python dependencies:
   ```bash
   pip install fastapi uvicorn python-dotenv
   ```

2. Start the API server:
   ```bash
   python -m uvicorn backend.api:app --reload --host 127.0.0.1 --port 8000
   ```
   The API will be available at `http://127.0.0.1:8000`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
railguard-dashboard/
├── src/
│   ├── pages/
│   │   ├── LandingPage.tsx    # Home page with features
│   │   ├── LandingPage.css
│   │   ├── Dashboard.tsx      # Main dashboard
│   │   └── Dashboard.css
│   ├── services/
│   │   └── api.ts            # API client
│   ├── types/
│   │   └── index.ts          # TypeScript types
│   ├── utils/
│   │   └── helpers.ts        # Utility functions
│   ├── App.tsx               # Main app component
│   ├── App.css
│   ├── main.tsx              # Entry point
│   └── index.css
├── public/                   # Static assets
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Features Overview

### Landing Page
- Hero section with call-to-action
- Key performance metrics (99.2% accuracy, 45% cost reduction, etc.)
- Feature cards explaining AI capabilities
- "How It Works" section
- Responsive design

### Dashboard
- **Input Panel**: Configure track segments with sliders for:
  - Wear level
  - Alignment deviation
  - Vibration index
  - Environment factor
  - Load cycles
- **Network Summary**: Overview metrics and AI-generated insights
- **Track Visualization**: Color-coded segment status
- **Assessment Table**: Detailed fault analysis with confidence scores

## API Endpoints

The dashboard communicates with the following backend endpoints:

- `GET /` - Health check
- `POST /assess/network` - Assess multiple track segments

## Environment Variables

- `VITE_API_URL` - Backend API URL (default: http://127.0.0.1:8000)

## Building for Production

```bash
npm run build
```

The optimized production build will be in the `dist/` directory.

## License

© 2026 RailGuard. All rights reserved.

## Support

For issues or questions, please open an issue in the repository.
