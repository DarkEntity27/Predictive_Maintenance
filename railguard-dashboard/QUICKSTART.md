# 🚀 Quick Start Guide - RailGuard Dashboard

## Prerequisites Checklist
- ✅ Node.js 18+ installed
- ✅ Python 3.8+ installed
- ✅ Backend API running

## Step-by-Step Setup

### 1. Install Dependencies
```bash
cd railguard-dashboard
npm install
```

### 2. Configure Environment
```bash
# Copy the example environment file
copy .env.example .env

# The default API URL is already set to http://127.0.0.1:8000
# Edit .env if your backend runs on a different port
```

### 3. Start Backend API (in a separate terminal)
```bash
# Navigate to backend directory
cd ..\backend

# Start the FastAPI server
uvicorn api:app --reload
```

The API should start at `http://127.0.0.1:8000`

### 4. Start Frontend Development Server
```bash
# In the railguard-dashboard directory
npm run dev
```

The app will start at `http://localhost:3000`

### 5. Open Your Browser
Navigate to `http://localhost:3000` to see the landing page.

## Testing the Application

1. **Landing Page** (`/`)
   - View the hero section with RailGuard branding
   - Check the metrics (99.2% accuracy, etc.)
   - Explore the features and "How It Works" sections
   - Click "Open Dashboard" or "Launch Dashboard" button

2. **Dashboard** (`/dashboard`)
   - Use the sidebar to configure 1-10 track segments
   - Adjust sliders for each parameter:
     - Wear Level (0.0 - 1.0)
     - Alignment Deviation (0.0 - 10.0)
     - Vibration Index (0.0 - 100.0)
     - Environment Factor (0.8 - 1.2)
     - Load Cycles (100 - 1000)
   - Click "Run Assessment" to analyze the segments
   - View the results:
     - Network-level summary with metrics
     - AI-generated maintenance summary
     - Track visualization with color-coded segments
     - Detailed assessment table

## Troubleshooting

### Backend Not Running
**Error**: API requests fail with connection errors

**Solution**:
```bash
cd backend
uvicorn api:app --reload
```

### Port Already in Use
**Error**: Port 3000 or 8000 already in use

**Solution**:
```bash
# For frontend, Vite will automatically use the next available port
# Or specify a different port in vite.config.ts

# For backend, use a different port:
uvicorn api:app --reload --port 8001
# Then update VITE_API_URL in .env to http://127.0.0.1:8001
```

### Dependencies Not Installing
**Error**: npm install fails

**Solution**:
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

## Building for Production

```bash
# Build the application
npm run build

# Preview the production build
npm run preview
```

The optimized build will be in the `dist/` directory.

## Key Features

✨ **Landing Page**
- Modern hero section with animations
- Performance metrics display
- Feature cards
- Call-to-action buttons

✨ **Dashboard**
- Interactive segment configuration
- Real-time AI analysis
- Visual track representation
- Detailed fault assessment

## Technology Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Lucide React** - Icons
- **FastAPI** - Backend API (Python)

## Next Steps

1. Customize the theme colors in CSS files
2. Add more visualizations using Recharts
3. Implement user authentication
4. Add historical data tracking
5. Export reports functionality

## Support

For questions or issues:
- Check the README.md file
- Review the API documentation
- Check backend logs for API errors
- Check browser console for frontend errors

---

**Happy Coding! 🚆💨**
