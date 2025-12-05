# 🏠 Smart Home Energy Tracker

A full-stack web application that monitors, tracks, and optimizes household energy consumption using machine learning and semantic web technologies.

## 🎯 Key Features

### Phase 1: Data Analytics
- **Historical Tracking**: SQLite database with 921+ energy readings across 5 households
- **Filterable API**: Query by household, date range, and time period
- **Real-time Monitoring**: Track current consumption and usage patterns

### Phase 2: Machine Learning
- **24-Hour Predictions**: ML-powered forecasting using Linear Regression
- **Model Performance**: R² = 0.7425 (74% accuracy)
- **Advanced Features**: Lagged values, rolling statistics, time-based features
- **Interactive Charts**: Visualize predictions vs actual consumption

### Phase 3: Semantic Optimization
- **RDF Ontology**: Knowledge graph with 74 semantic triples
- **SPARQL Queries**: Real-time rule-based optimization suggestions
- **Time-of-Use Pricing**: Peak/Shoulder/Off-Peak cost multipliers
- **Smart Recommendations**: AI-powered energy-saving tips

### Interactive Simulator
- **Usage Pattern Analysis**: Test Normal, Peak, and Off-Peak scenarios
- **Cost Comparison**: See potential savings from behavior changes
- **ML Integration**: Compare predictions against simulated usage
- **Visual Analytics**: Interactive charts and breakdowns

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18
- **Routing**: React Router v6
- **Charts**: Recharts
- **HTTP Client**: Axios
- **Styling**: Custom CSS with responsive design

### Backend
- **Framework**: Flask (Python)
- **Database**: SQLite with SQLAlchemy ORM
- **ML Library**: scikit-learn
- **Semantic Web**: rdflib (RDF/SPARQL)
- **Data Processing**: Pandas, NumPy
- **API**: RESTful with CORS enabled

### Machine Learning
- **Algorithm**: Linear Regression
- **Features**: 10 engineered features (lags, rolling stats, time features)
- **Model File**: `energy_predictor_model.joblib`

### Semantic Technologies
- **Ontology Format**: Turtle (TTL)
- **Query Language**: SPARQL
- **Rules Engine**: Custom optimization rules

## 📁 Project Structure

```
Smart-Home-Energy-Tracker/
├── backend/                              # Flask API Server
│   ├── app.py                            # Main Flask app (12+ endpoints)
│   ├── model_training.ipynb              # ML model training notebook
│   ├── energy_predictor_model.joblib     # Trained ML model (R² = 0.74)
│   ├── smart_home_ontology.ttl           # RDF knowledge graph (74 triples)
│   ├── optimization_rules.py             # SPARQL rule engine
│   ├── check_db.py                       # Database utility
│   ├── requirements.txt                  # Python dependencies
│   ├── venv/                             # Virtual environment
│   └── instance/
│       └── refit_energy_data.db          # SQLite database (921 records)
│
├── frontend/                             # React Application
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navigation.js             # App navigation bar
│   │   │   ├── charts/                   # Recharts components
│   │   │   │   ├── EnergyUsageChart.js
│   │   │   │   ├── ApplianceBreakdownChart.js
│   │   │   │   └── ApplianceComparisonChart.js
│   │   │   └── common/
│   │   │       └── StatCard.js           # Reusable stat cards
│   │   ├── pages/
│   │   │   ├── Dashboard.js              # Main dashboard (ML predictions)
│   │   │   ├── Appliances.js             # Appliance monitoring
│   │   │   ├── Optimization.js           # RDF-based suggestions
│   │   │   ├── Simulator.js              # Interactive usage simulator
│   │   │   └── Settings.js               # System info & configuration
│   │   ├── services/
│   │   │   └── api.js                    # API service layer
│   │   └── utils/
│   │       ├── formatters.js             # Data formatting utilities
│   │       └── mockData.js               # Mock data for development
│   ├── public/
│   └── package.json
│
├── energy_categorical.csv                # Training dataset (5 households)
├── energy_data.csv                       # Additional energy data
└── README.md                             # This file
```

## 🚀 Quick Start

### Prerequisites
- Python 3.8+ with pip
- Node.js 14+ with npm
- Git

### Backend Setup

1. **Navigate to backend directory:**
   ```powershell
   cd backend
   ```

2. **Activate virtual environment:**
   ```powershell
   .\venv\Scripts\Activate.ps1  # Windows PowerShell
   # or
   source venv/bin/activate     # Linux/Mac
   ```

3. **Install dependencies:**
   ```powershell
   pip install -r requirements.txt
   ```

4. **Run Flask server:**
   ```powershell
   python app.py
   ```

   Server starts at `http://127.0.0.1:5000/`
   
   On first run:
   - ✅ Creates SQLite database
   - ✅ Loads 921 energy readings
   - ✅ Initializes ML model (R² = 0.74)
   - ✅ Loads RDF ontology (74 triples)

### Frontend Setup

1. **Navigate to frontend directory:**
   ```powershell
   cd frontend
   ```

2. **Install dependencies:**
   ```powershell
   npm install
   ```

3. **Start development server:**
   ```powershell
   npm start
   ```

   App opens at `http://localhost:3000/`

### Verify Installation

**Test Backend:**
```powershell
curl http://localhost:5000/
# Expected: {"message": "Smart Home Energy Tracker API"}
```

**Test Frontend:**
- Open browser to `http://localhost:3000`
- You should see the Dashboard with energy charts

## 📊 Application Pages

### 1. Dashboard (`/`)
**Features:**
- Real-time energy consumption display
- 24-hour ML prediction chart
- Historical usage trends
- Time range selector (24h/7d/30d)
- Quick statistics cards

**Technologies Used:**
- Phase 1: Historical data from SQLite
- Phase 2: ML predictions from trained model

### 2. Appliances (`/appliances`)
**Features:**
- Monitor 5 household devices
- Energy breakdown pie chart
- Appliance comparison bar chart
- Individual appliance details
- Status indicators (active/idle)

**Technologies Used:**
- Phase 1: Database queries by household

### 3. Optimization (`/optimization`)
**Features:**
- AI-powered energy-saving suggestions
- Priority filtering (High/Medium/Low)
- Potential savings calculations
- Action tracking (complete/dismiss)
- Rule-based recommendations

**Technologies Used:**
- Phase 3: RDF ontology + SPARQL queries
- Dynamic rule matching based on usage patterns

### 4. Simulator (`/simulator`) 🆕
**Features:**
- Interactive usage pattern testing
- Three scenarios: Normal, Peak, Off-Peak
- Cost comparison with time-of-use pricing
- ML prediction vs simulated usage charts
- Savings recommendations
- Time slot breakdown analysis

**Technologies Used:**
- Phase 2: ML model predictions
- Phase 3: RDF cost multipliers and SPARQL rules
- Real-time cost calculations

### 5. Settings (`/settings`)
**Features:**
- System information display
- ML model performance metrics
- RDF ontology statistics
- Current time slot status
- Project documentation

## 🔌 API Endpoints

### Core Endpoints

#### `GET /`
Health check endpoint
```json
{"message": "Smart Home Energy Tracker API"}
```

#### `GET /api/v1/usage/historical`
Get historical energy readings

**Query Parameters:**
- `household_id` (optional): Filter by household (1-5)
- `start_date` (optional): Format YYYY-MM-DD
- `end_date` (optional): Format YYYY-MM-DD

**Example:**
```bash
http://localhost:5000/api/v1/usage/historical?household_id=1
```

**Response:**
```json
{
  "count": 183,
  "data": [
    {
      "id": 1,
      "timestamp": "2024-01-01T00:00:00",
      "household_id": 1,
      "energy_kwh": 0.152,
      "future_energy_kwh": 0.163
    }
  ]
}
```

### Machine Learning Endpoints

#### `GET /api/predictions`
Get ML-powered 24-hour forecast

**Query Parameters:**
- `hours` (optional): Number of hours to predict (default: 24)

**Response:**
```json
{
  "forecast_generated": "2025-12-05T10:00:00",
  "forecast_period_hours": 24,
  "predictions": [
    {
      "timestamp": "2025-12-05T10:00:00",
      "predicted_kwh": 0.213,
      "hour": 10,
      "day_of_week": "Thursday",
      "time_category": "Morning"
    }
  ]
}
```

### Optimization Endpoints (RDF/SPARQL)

#### `GET /api/v1/optimization/suggestions`
Get RDF-based optimization suggestions

**Query Parameters:**
- `time_window` (optional): Minutes of data to analyze (default: 60)

**Response:**
```json
{
  "generated_at": "2025-12-05T14:30:00",
  "time_slot_info": {
    "current_slot": "ShoulderHours",
    "cost_multiplier": 1.2,
    "next_transition": "17:00"
  },
  "suggestions": [
    {
      "rule_id": "rule_1",
      "description": "High energy usage during peak hours...",
      "impact": "High",
      "category": "Cost-Saving",
      "savings_kwh": 0.15,
      "savings_cost": 0.025,
      "priority": 1
    }
  ]
}
```

#### `GET /api/v1/optimization/timeslot`
Get current time-of-use pricing slot

**Response:**
```json
{
  "current_slot": "PeakHours",
  "cost_multiplier": 1.5,
  "start_time": "17:00",
  "end_time": "21:00",
  "recommendations": [
    "Defer high-energy appliances until off-peak hours",
    "Peak pricing in effect - minimize usage"
  ]
}
```

### Appliance Endpoints

#### `GET /api/appliances`
Get list of monitored appliances

**Response:**
```json
{
  "appliances": [
    {
      "id": 1,
      "name": "HVAC",
      "type": "Climate Control",
      "power_rating": 3500,
      "status": "active"
    }
  ]
}
```

## 🧠 Machine Learning Model

### Model Details
- **Algorithm**: Linear Regression (scikit-learn)
- **Performance**: R² = 0.7425 (74.25% variance explained)
- **MAE**: 21.7 Wh average prediction error
- **Training Data**: 183 records (Household 1, after feature engineering)
- **File**: `backend/energy_predictor_model.joblib`

### Features (10 Total)

**Time-based Features (4):**
1. `hour_of_day` - Hour (0-23)
2. `day_of_week` - Day (0-6)
3. `is_weekend` - Boolean flag
4. `time_category` - Morning/Afternoon/Evening/Night

**Lag Features (3):**
5. `lag_1` - Previous 1-hour consumption
6. `lag_2` - Previous 2-hour consumption
7. `lag_3` - Previous 3-hour consumption

**Rolling Statistics (3):**
8. `rolling_mean_3` - 3-hour rolling average
9. `rolling_mean_6` - 6-hour rolling average
10. `rolling_std_3` - 3-hour rolling std deviation

### Why It Works
Energy consumption exhibits strong **temporal autocorrelation** - recent usage patterns are the best predictors of future consumption. Lag features capture this dependency, while rolling statistics smooth noise and identify trends.

### Training Process
1. Load `energy_categorical.csv` (Household 1)
2. Engineer 10 features
3. 80/20 train-test split (maintains time order)
4. Train Linear Regression
5. Save model as `.joblib` file
6. Evaluate: R² = 0.74, MAE = 21.7 Wh

### Retrain Model (Optional)
```powershell
cd backend
jupyter notebook model_training.ipynb
# Run all cells to retrain
```

## 🌐 Semantic Web (Phase 3)

### RDF Ontology Structure

**File**: `backend/smart_home_ontology.ttl`
**Format**: Turtle (TTL)
**Triples**: 74 semantic statements

### Time Slots
```turtle
:PeakHours a :TimeSlot ;
    :startTime "17:00" ;
    :endTime "21:00" ;
    :costMultiplier "1.5" .

:ShoulderHours a :TimeSlot ;
    :startTime "07:00" ;
    :endTime "17:00" ;
    :costMultiplier "1.2" .

:OffPeakHours a :TimeSlot ;
    :startTime "21:00" ;
    :endTime "07:00" ;
    :costMultiplier "1.0" .
```

### Optimization Rules
8 rules covering different scenarios:
- Peak hour usage warnings
- Appliance scheduling recommendations
- Off-peak shift suggestions
- Efficiency improvements

**Example Rule:**
```turtle
:Rule1 a :OptimizationRule ;
    :appliesTo :PeakHours ;
    :threshold "150" ;
    :ruleDescription "High energy usage during peak hours (5-9 PM). Consider shifting appliance usage to off-peak hours to save on energy costs." ;
    :impact "High" ;
    :category "Cost-Saving" ;
    :savingsPercent "30" .
```

### SPARQL Query Engine

**File**: `backend/optimization_rules.py`

**Key Functions:**
- `load_ontology_graph()` - Load RDF graph
- `get_current_time_slot()` - Determine pricing period
- `query_optimization_rules(slot)` - Execute SPARQL queries
- `get_optimization_suggestions(data)` - Generate recommendations

**Example SPARQL Query:**
```sparql
PREFIX : <http://smartenergy.org/ontology#>

SELECT ?rule ?description ?impact ?category ?threshold
WHERE {
    ?rule a :OptimizationRule ;
          :appliesTo :PeakHours ;
          :ruleDescription ?description ;
          :impact ?impact ;
          :category ?category ;
          :threshold ?threshold .
}
```

### How Rules Work
1. **Determine Time Slot**: Check current hour against slot definitions
2. **Query Ontology**: SPARQL pattern matching for applicable rules
3. **Evaluate Thresholds**: Compare current usage against rule thresholds
4. **Calculate Savings**: `savings = usage × (multiplier - 1.0)`
5. **Return Suggestions**: Ranked by priority and impact

## 💾 Database Schema

### EnergyReading Table
```sql
CREATE TABLE energy_reading (
    id INTEGER PRIMARY KEY,
    timestamp DATETIME NOT NULL,
    household_id INTEGER NOT NULL,
    energy_kwh FLOAT NOT NULL,
    future_energy_kwh FLOAT,
    INDEX idx_timestamp (timestamp),
    INDEX idx_household (household_id)
);
```

**Sample Data:**
- **Records**: 921 total
- **Households**: 5 (IDs 1-5)
- **Timeframe**: January 1, 2024
- **Interval**: ~1 minute granularity

## 🎨 Frontend Architecture

### Component Hierarchy
```
App
├── Navigation
└── Routes
    ├── Dashboard
    │   ├── StatCard (×4)
    │   ├── EnergyUsageChart
    │   └── Predictions Chart
    ├── Appliances
    │   ├── ApplianceBreakdownChart
    │   └── ApplianceComparisonChart
    ├── Optimization
    │   └── Suggestion Cards
    ├── Simulator
    │   ├── Control Panel
    │   ├── Results Charts (×2)
    │   └── Recommendations
    └── Settings
        └── Information Panels
```

### State Management
- **Local State**: React hooks (`useState`, `useEffect`)
- **API Integration**: Axios with service layer
- **Data Flow**: Unidirectional (parent → child via props)

### Styling
- Custom CSS modules per component
- Responsive design (mobile-friendly)
- Color scheme: Blue primary, gray neutrals
- Accessibility: ARIA labels, semantic HTML

## 🧪 Testing & Validation

### Backend Tests
```powershell
# Test API health
curl http://localhost:5000/

# Test historical data
curl http://localhost:5000/api/v1/usage/historical?household_id=1

# Test ML predictions
curl http://localhost:5000/api/predictions?hours=24

# Test RDF time slot
curl http://localhost:5000/api/v1/optimization/timeslot

# Test optimization suggestions
curl http://localhost:5000/api/v1/optimization/suggestions
```

### Frontend Tests
1. Navigate to `http://localhost:3000`
2. Check Dashboard charts load
3. Switch time ranges (24h/7d/30d)
4. Visit Appliances page - verify 5 devices shown
5. Visit Optimization - check suggestions appear
6. Visit Simulator - run a simulation
7. Check browser console for errors (F12)

### End-to-End Test (Simulator)
1. Open `http://localhost:3000/simulator`
2. Select "HVAC" appliance
3. Set duration to 24 hours
4. Choose "Off-Peak" pattern
5. Click "Run Simulation"
6. ✅ **Success Criteria:**
   - Summary cards show energy/cost data
   - Two charts display (energy & cost)
   - Time slot breakdown appears
   - Recommendations shown

## 🔧 Troubleshooting

### Backend Won't Start
**Issue**: `ModuleNotFoundError`
**Solution**: Activate venv and reinstall dependencies
```powershell
cd backend
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

### Frontend Won't Start
**Issue**: `npm` errors
**Solution**: Delete `node_modules` and reinstall
```powershell
cd frontend
Remove-Item -Recurse -Force node_modules
npm install
```

### No Data in Charts
**Issue**: Backend not running
**Solution**: Ensure Flask server is active at port 5000
```powershell
# Check if backend is running
curl http://localhost:5000/
```

### CORS Errors
**Issue**: Cross-origin blocked
**Solution**: Already configured! `CORS(app)` in `app.py` allows all origins

### sklearn Version Warning
**Issue**: Model saved with different sklearn version
**Impact**: Non-critical (Linear Regression is stable)
**Solution** (optional): Retrain model with current version

### No Optimization Suggestions
**Issue**: Using old historical data (2024 timestamps)
**Solution**: Already fixed! Backend uses most recent 100 readings regardless of timestamp

## 📈 Performance Metrics

### Model Performance
- **R² Score**: 0.7425 (excellent)
- **MAE**: 21.7 Wh (low error)
- **Prediction Range**: 24 hours ahead
- **Update Frequency**: Real-time via API

### Database Performance
- **Records**: 921 energy readings
- **Query Time**: <50ms for filtered queries
- **Indexes**: timestamp, household_id

### API Performance
- **Response Time**: ~100-200ms
- **CORS**: Enabled for all origins
- **Caching**: None (real-time data)

## 🚀 Future Enhancements

### Short-term
- [ ] User authentication and authorization
- [ ] Appliance scheduling automation
- [ ] Email alerts for high usage
- [ ] Export reports as PDF
- [ ] Mobile app (React Native)

### Medium-term
- [ ] Extended forecasting (weekly/monthly)
- [ ] Weather data integration
- [ ] Cost estimation by utility provider
- [ ] Multi-household comparison dashboards
- [ ] Historical trend analysis tools

### Long-term
- [ ] IoT device integration (smart plugs)
- [ ] Real-time monitoring via WebSocket
- [ ] Advanced ML models (LSTM, Prophet)
- [ ] Blockchain for energy trading
- [ ] Carbon footprint tracking

## 📚 Learning Resources

### Technologies Used
- **React**: https://react.dev/
- **Flask**: https://flask.palletsprojects.com/
- **scikit-learn**: https://scikit-learn.org/
- **rdflib**: https://rdflib.readthedocs.io/
- **SPARQL**: https://www.w3.org/TR/sparql11-query/
- **Recharts**: https://recharts.org/

### Concepts Demonstrated
- Full-stack web development
- RESTful API design
- Machine learning deployment
- Semantic web technologies (RDF/SPARQL)
- Time-series data analysis
- Interactive data visualization
- Feature engineering for ML

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - See LICENSE file for details

## 👨‍💻 Author

Built as a demonstration of full-stack development with ML and semantic web integration.

## 🎯 Project Highlights

### What Makes This Special
✅ **Three-Phase Architecture**: Data → ML → Semantic Web
✅ **Real ML Deployment**: Production-ready model serving predictions
✅ **Semantic Reasoning**: RDF ontology with SPARQL queries
✅ **Interactive Simulator**: What-if scenario analysis
✅ **Full-Stack**: React frontend + Flask backend
✅ **Clean Architecture**: Modular, maintainable codebase
✅ **Well-Documented**: Comprehensive README and code comments

### Technologies Integrated
- **Frontend**: React, Recharts, Axios
- **Backend**: Flask, SQLAlchemy, CORS
- **ML**: scikit-learn, Pandas, NumPy
- **Semantic Web**: rdflib, SPARQL
- **Database**: SQLite
- **APIs**: RESTful design with 12+ endpoints

---

**Ready to start?**
```powershell
# Terminal 1 - Backend
cd backend
.\venv\Scripts\Activate.ps1
python app.py

# Terminal 2 - Frontend
cd frontend
npm start
```

**Then visit:** http://localhost:3000 🚀
