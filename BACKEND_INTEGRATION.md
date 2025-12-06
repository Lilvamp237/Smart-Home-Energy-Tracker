# Backend Integration Guide

## Overview

The frontend now automatically detects and connects to the Flask backend API. When the backend is unavailable, it seamlessly falls back to mock data for development.

## Backend Status

The frontend displays real-time connection status on each page:
- 🟢 **Backend Connected** - Using live data from Flask API
- 🔴 **Using Mock Data** - Backend unavailable, displaying demo data

## Running Both Frontend and Backend

### 1. Start the Backend (Terminal 1)

```bash
cd backend
python app.py
```

The backend will:
- Initialize the SQLite database
- Load the RDF ontology for optimization rules
- Load the ML prediction model (if available)
- Start Flask server on http://localhost:5000

### 2. Start the Frontend (Terminal 2)

```bash
cd frontend
npm start
```

The frontend will:
- Auto-detect backend availability
- Connect to http://localhost:5000/api
- Open browser at http://localhost:3000

## API Endpoints Used

### Energy Data
- `GET /api/energy/current` - Current power consumption
- `GET /api/energy/usage?range={24h|7d|30d}` - Historical usage data

### Appliances
- `GET /api/appliances` - List of monitored appliances/households
- `GET /api/appliances/{id}/usage?range={timeRange}` - Appliance-specific usage
- `GET /api/appliances/breakdown` - Energy breakdown by appliance

### Predictions
- `GET /api/predictions?hours=24` - ML-based 24-hour forecast
- Returns predictions with confidence levels and cost estimates

### Optimization
- `GET /api/optimization/suggestions` - Rule-based energy-saving recommendations
- `GET /api/v1/optimization/timeslot` - Current time-of-use pricing slot
- `PATCH /api/optimization/suggestions/{id}` - Update suggestion status

### Historical Data
- `GET /api/v1/usage/historical?household_id={id}&start_date={date}&end_date={date}`

## Backend Features Integrated

### 1. Real-Time Energy Monitoring
- **Dashboard**: Displays live consumption data from SQLite database
- Updates every refresh with latest readings
- Calculates current power (kW) from kWh readings

### 2. ML Predictions
- **Prediction Model**: Uses trained model from `model_training.ipynb`
- 24-hour forecast with hourly granularity
- Features: hour, day of week, time category, lagged values
- **Dashboard**: Shows predicted vs actual cost comparison

### 3. RDF Ontology Optimization
- **Ontology File**: `smart_home_ontology.ttl`
- **Rules Engine**: Time-of-use pricing (Peak/Shoulder/Off-Peak)
- **Suggestions**: Automatically generated based on:
  - Current consumption patterns
  - Time slot pricing
  - Appliance usage levels
- **Optimization Page**: Displays live recommendations with:
  - Priority levels (High/Medium/Low)
  - Energy & cost savings
  - Impact scores
  - Time slot information

### 4. Appliance Monitoring
- Maps household IDs to appliances
- Real power ratings calculated from consumption
- Status detection (active/idle based on usage)
- Historical usage tracking per appliance

## Data Flow

```
Backend (Flask)
├── SQLite Database (refit_energy_data.db)
│   └── energy_readings table
├── ML Model (energy_predictor_model.joblib)
├── RDF Ontology (smart_home_ontology.ttl)
└── API Endpoints
    ↓
Frontend (React)
├── Auto-detect backend
├── Fetch real-time data
├── Display in charts/dashboards
└── Fallback to mock data if needed
```

## Configuration

### Frontend (.env)

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENV=development
```

### Backend (app.py)

```python
# Default settings
PORT = 5000
DATABASE = 'sqlite:///refit_energy_data.db'
CORS_ENABLED = True
```

## Development Modes

### Mode 1: Full Stack (Recommended)
- Backend running: Real data, ML predictions, RDF suggestions
- Frontend auto-connects
- Best for testing complete features

### Mode 2: Frontend Only
- Backend stopped: Mock data automatically used
- Good for UI development
- No backend dependency

### Mode 3: Backend Only
- Test API endpoints directly
- Use Postman/curl for testing
- Verify data and predictions

## Troubleshooting

### Backend Not Detected

1. **Check Backend Is Running**
   ```bash
   curl http://localhost:5000/
   # Should return: {"message": "Smart Home Energy Tracker API"}
   ```

2. **Check CORS Settings**
   - Backend has `CORS(app)` enabled
   - Frontend uses `http://localhost:5000` (not https)

3. **Check Port Conflicts**
   - Backend default: 5000
   - Frontend default: 3000
   - Change if ports are in use

### No Data Showing

1. **Check Database**
   ```bash
   cd backend
   python check_db.py
   ```

2. **Load Sample Data**
   - Backend auto-loads `energy_data.csv` on first run
   - Check console for "Loading data..." messages

3. **Check Console Errors**
   - Open browser DevTools (F12)
   - Look for API errors in Console/Network tabs

### Predictions Not Working

1. **Train Model First**
   ```bash
   cd backend
   jupyter notebook model_training.ipynb
   # Run all cells to generate energy_predictor_model.joblib
   ```

2. **Check Model File**
   - File should exist: `backend/energy_predictor_model.joblib`
   - Backend logs "Prediction model loaded successfully"

### Optimization Suggestions Empty

1. **Check Ontology**
   - File exists: `backend/smart_home_ontology.ttl`
   - Console shows "✓ Ontology loaded successfully"

2. **Check Database Has Recent Data**
   - Suggestions based on last 60 minutes
   - Historical data may not trigger time-based rules

## API Response Formats

### Energy Usage
```json
[
  {
    "time": "14:00",
    "consumption": 0.245,
    "cost": 0.029
  }
]
```

### Predictions
```json
{
  "next24Hours": [
    {
      "time": "15:00",
      "predicted": 2.4,
      "confidence": 0.85
    }
  ],
  "summary": {
    "predictedCost": 12.45,
    "actualCostToday": 11.80,
    "difference": 0.65,
    "trend": "increasing"
  }
}
```

### Optimization Suggestions
```json
[
  {
    "id": 1,
    "title": "Shift high-power appliance usage to off-peak hours",
    "description": "Time slot: OffPeakHours",
    "impact": {
      "energySaving": "2.5 kWh/day",
      "costSaving": "$0.85/day",
      "score": 8.5
    },
    "priority": "high",
    "status": "pending",
    "category": "TimeShifting",
    "timeSlot": "OffPeakHours",
    "householdId": 1
  }
]
```

## Testing Checklist

- [ ] Backend starts without errors
- [ ] Frontend shows "🟢 Backend Connected"
- [ ] Dashboard displays real consumption data
- [ ] Charts update with backend data
- [ ] Predictions load within 30 seconds
- [ ] Optimization suggestions appear
- [ ] Appliance list matches households
- [ ] Backend status updates on page refresh
- [ ] Mock data loads when backend stopped
- [ ] No console errors in browser

## Next Steps

1. **Generate ML Model**: Run `model_training.ipynb` to create predictions
2. **Customize Ontology**: Edit `smart_home_ontology.ttl` for custom rules
3. **Add Real Sensors**: Replace simulated data with IoT device readings
4. **Deploy**: Configure for production environment

## Support

- Backend logs: Check Flask console output
- Frontend logs: Open browser DevTools → Console
- Database: Use `check_db.py` to verify data
- API testing: Use browser Network tab or Postman
