# Phase 3: Rule-Based Optimization Module - Implementation Guide

## 🎯 Overview

Phase 3 adds intelligent energy optimization suggestions using **RDF ontology** and **SPARQL queries** to provide context-aware, time-of-use pricing recommendations.

## 📦 Components Created

### 1. **RDF Ontology** (`smart_home_ontology.ttl`)

**Location:** `backend/smart_home_ontology.ttl`

**Structure:**
- **Time Slots:** Peak Hours (5-9 PM), Shoulder Hours (7 AM-5 PM), Off-Peak Hours (9 PM-7 AM)
- **Cost Multipliers:** Peak (1.5x), Shoulder (1.2x), Off-Peak (1.0x)
- **Optimization Rules:** 8 rules covering different appliances and scenarios

**Key Concepts:**
```turtle
:PeakHours a :TimeSlot ;
    :startTime "17:00" ;
    :endTime "21:00" ;
    :costMultiplier "1.5" .

:Rule1 a :OptimizationRule ;
    :appliesTo :PeakHours ;
    :ruleDescription "High energy usage during peak hours..." ;
    :impact "High" ;
    :category "Cost-Saving" ;
    :threshold "150" .
```

### 2. **Optimization Engine** (`optimization_rules.py`)

**Location:** `backend/optimization_rules.py`

**Key Functions:**

#### `load_ontology_graph()`
- Loads RDF ontology using rdflib
- Returns Graph object with 74 triples
- Called once during Flask initialization

#### `get_current_time_slot()`
- Determines current pricing period based on hour
- Returns: `('PeakHours', 1.5)` or `('ShoulderHours', 1.2)` or `('OffPeakHours', 1.0)`

#### `query_optimization_rules(time_slot_name)`
- Executes SPARQL query against ontology
- Retrieves rules applicable to current time slot
- Returns list of rule descriptions, impacts, categories, and thresholds

**SPARQL Query Example:**
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

#### `get_optimization_suggestions(current_usage_data)`
- **Input:** Recent energy readings from database
- **Logic:**
  1. Determine current time slot
  2. Query ontology for applicable rules
  3. Compare usage against thresholds
  4. Calculate potential savings
  5. Generate enhanced suggestions with specific data
- **Output:** List of suggestion dictionaries

#### `get_time_slot_info()`
- Provides detailed time slot context
- Returns current slot, cost multiplier, next transition time, and recommendations

### 3. **Flask API Integration** (`app.py`)

**New Endpoints:**

#### `GET /api/v1/optimization/suggestions`

**Description:** Get energy optimization suggestions based on current usage and RDF rules

**Query Parameters:**
- `time_window` (optional): Minutes of data to analyze (default: 60)

**Response Example:**
```json
{
  "generated_at": "2025-12-04T14:30:00",
  "time_window_minutes": 60,
  "analyzed_readings": 25,
  "time_slot_info": {
    "current_slot": "ShoulderHours",
    "cost_multiplier": 1.2,
    "current_hour": 14,
    "next_transition": "5 PM (Peak Hours begin)",
    "recommendation": "Complete heavy usage tasks before peak hours..."
  },
  "suggestion_count": 3,
  "suggestions": [
    {
      "id": 1,
      "text": "High energy usage detected during shoulder hours. Current usage: 0.285 kWh. Potential savings: 0.047 kWh (16.7% cost reduction).",
      "impact": "Medium",
      "category": "Cost-Saving",
      "household_id": 1,
      "current_usage_kwh": 0.285,
      "threshold_kwh": 0.100,
      "time_slot": "ShoulderHours",
      "cost_multiplier": 1.2,
      "potential_savings_kwh": 0.047,
      "timestamp": "2024-01-01T12:00:00"
    }
  ]
}
```

#### `GET /api/v1/optimization/timeslot`

**Description:** Get current time-of-use pricing information

**Response Example:**
```json
{
  "current_slot": "PeakHours",
  "cost_multiplier": 1.5,
  "current_hour": 19,
  "next_transition": "9 PM (Off-Peak begins)",
  "recommendation": "Avoid running high-power appliances. Delay usage until off-peak hours."
}
```

**Helper Function:**

#### `get_latest_usage_data(time_window_minutes=60)`
- Queries database for recent readings
- Returns list of usage dictionaries
- Used by optimization endpoint

## 🔧 Installation & Setup

### 1. Install Dependencies
```powershell
cd backend
.\venv\Scripts\Activate.ps1
pip install rdflib==7.0.0
```

### 2. Verify Files Exist
- `backend/smart_home_ontology.ttl` ✓
- `backend/optimization_rules.py` ✓
- Updated `backend/app.py` ✓
- Updated `backend/requirements.txt` ✓

### 3. Start Flask Server
```powershell
python app.py
```

**Expected Console Output:**
```
Database initialized successfully!

Loading RDF ontology for optimization engine...
✓ Ontology loaded successfully: 74 triples

Prediction model loaded successfully...
Database already contains 921 records.

Starting Flask server...
 * Running on http://127.0.0.1:5000
```

## 📊 How It Works

### Optimization Logic Flow

1. **User Request** → `GET /api/v1/optimization/suggestions`

2. **Fetch Recent Data** → Last 60 minutes of energy readings from database

3. **Determine Time Slot** → Current hour → PeakHours / ShoulderHours / OffPeakHours

4. **SPARQL Query** → Query ontology for rules matching current time slot

5. **Threshold Comparison** → For each reading:
   - If `energy_kwh > threshold_kwh` → Generate suggestion
   - Calculate: `potential_savings = energy_kwh * (cost_multiplier - 1.0)`

6. **Response Assembly** → Return JSON with:
   - Time slot info
   - Analyzed readings count
   - Detailed suggestions with savings calculations

### Example Scenario

**Time:** 7:00 PM (Peak Hours, 1.5x cost multiplier)  
**Household 1 Usage:** 0.285 kWh (last reading)  
**Threshold:** 0.150 kWh (150 Wh)

**Calculation:**
- Usage exceeds threshold ✓
- Potential savings: `0.285 * (1.5 - 1.0) = 0.143 kWh`
- Savings percentage: `(0.5 / 1.5) * 100 = 33.3%`

**Suggestion Generated:**
```
"High energy usage detected during peak hours. 
Current usage: 0.285 kWh. 
Potential savings: 0.143 kWh (33.3% cost reduction)."
```

## 🧪 Testing the API

### Test 1: Get Current Time Slot
```bash
curl http://127.0.0.1:5000/api/v1/optimization/timeslot
```

### Test 2: Get Optimization Suggestions (default 60-min window)
```bash
curl http://127.0.0.1:5000/api/v1/optimization/suggestions
```

### Test 3: Get Suggestions with Custom Time Window
```bash
curl "http://127.0.0.1:5000/api/v1/optimization/suggestions?time_window=120"
```

## 🎓 Key Concepts Explained

### RDF (Resource Description Framework)
- **Triple Format:** Subject-Predicate-Object
- Example: `:PeakHours :costMultiplier "1.5"`
- Enables semantic reasoning and knowledge graphs

### SPARQL (SPARQL Protocol and RDF Query Language)
- SQL-like query language for RDF
- Pattern matching against graph triples
- Returns structured results from ontology

### Time-of-Use Pricing
- **Peak Hours:** Highest demand → Highest cost (1.5x)
- **Shoulder Hours:** Medium demand → Medium cost (1.2x)
- **Off-Peak Hours:** Lowest demand → Lowest cost (1.0x)

### Threshold-Based Rules
- Only suggest optimization when usage exceeds defined thresholds
- Prevents notification fatigue from minor variations
- Focuses on high-impact opportunities

## 📈 Future Enhancements

- [ ] Add more specific appliance rules (EV charging, HVAC, water heater)
- [ ] Integrate with real-time electricity pricing APIs
- [ ] Machine learning to learn user behavior patterns
- [ ] Personalized threshold tuning per household
- [ ] Historical savings tracking dashboard
- [ ] Push notifications for urgent cost-saving opportunities
- [ ] Integration with smart home automation (auto-scheduling)

## 🔍 Troubleshooting

### Ontology Not Loading
**Error:** `✗ Ontology file not found`
**Solution:** Verify `smart_home_ontology.ttl` exists in `backend/` folder

### SPARQL Query Errors
**Error:** `✗ SPARQL query error`
**Solution:** Check ontology syntax with RDF validator, verify namespace prefixes

### No Suggestions Generated
**Issue:** API returns empty suggestions list
**Check:**
1. Is current usage above threshold? (Default: 0.100 kWh)
2. Is time window capturing recent data?
3. Are rules defined for current time slot in ontology?

### Empty Usage Data
**Error:** `"No recent usage data available"`
**Solution:** 
- Ensure database has recent timestamps
- Check if `time_window` parameter is too narrow
- Verify Flask app loaded 921 records on startup

## 📝 Summary

**Phase 3 Complete! ✅**

You now have:
- ✅ RDF ontology with 8 optimization rules
- ✅ SPARQL-based rule engine (`optimization_rules.py`)
- ✅ Two new API endpoints for suggestions and time slot info
- ✅ Smart threshold-based triggering
- ✅ Automatic savings calculations
- ✅ Time-of-use pricing awareness

**Backend Status:**
- Historical data API ✅
- ML prediction API (R² = 0.74) ✅
- **Optimization suggestions API ✅ NEW!**

**Ready for:** Frontend development with React to visualize all three data streams!
