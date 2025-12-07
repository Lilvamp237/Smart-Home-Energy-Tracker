# Quick Start Guide

## Start Backend (Terminal 1)
```powershell
cd backend
.\venv\Scripts\Activate.ps1
python app.py
```

## Start Frontend (Terminal 2)
```powershell
cd frontend
npm start
```

## Verify Everything Works

1. **Backend**: http://localhost:5000
   - Should show: `{"message":"Smart Home Energy Tracker API"}`

2. **Frontend**: http://localhost:3000
   - Should show the dashboard without errors

## Common Issues & Fixes

### "Failed to load dashboard data"
- **Cause**: Backend not running or CORS issue
- **Fix**: Restart backend, check console for errors

### Port 3000 already in use
- **Fix**: Kill existing process
  ```powershell
  npx kill-port 3000
  ```

### Port 5000 already in use
- **Fix**: Kill Python processes
  ```powershell
  Stop-Process -Name python* -Force
  ```

## API Endpoints to Test

```powershell
# Health check
curl http://localhost:5000/

# Energy usage
curl http://localhost:5000/api/energy/usage?range=24h

# Predictions
curl http://localhost:5000/api/predictions?hours=24

# Optimization suggestions
curl http://localhost:5000/api/optimization/suggestions

# Time slot info
curl http://localhost:5000/api/v1/optimization/timeslot
```

## Files Fixed (December 7, 2025)

1. ✅ `frontend/src/pages/Dashboard.js` - Removed undefined variables
2. ✅ `frontend/src/pages/Optimization.js` - Fixed useMockData reference
3. ✅ Backend routes all verified and working
