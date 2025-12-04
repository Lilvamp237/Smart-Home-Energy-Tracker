from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import pandas as pd
import numpy as np
import os
from datetime import datetime, timedelta
import joblib

# Import optimization module
from optimization_rules import (
    load_ontology_graph,
    get_optimization_suggestions,
    get_time_slot_info
)

app = Flask(__name__)
CORS(app)

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///refit_energy_data.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Global variable for the prediction model
predictor_model = None

# Database Model
class EnergyReading(db.Model):
    __tablename__ = 'energy_readings'
    
    id = db.Column(db.Integer, primary_key=True)
    timestamp = db.Column(db.DateTime, nullable=False, index=True)
    household_id = db.Column(db.Integer, nullable=False, index=True)
    energy_kwh = db.Column(db.Float, nullable=False)
    future_energy_kwh = db.Column(db.Float, nullable=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'timestamp': self.timestamp.isoformat(),
            'household_id': self.household_id,
            'energy_kwh': self.energy_kwh,
            'future_energy_kwh': self.future_energy_kwh
        }

# Initialize database
def init_db():
    """Create database file and all tables."""
    with app.app_context():
        db.create_all()
        print("Database initialized successfully!")

# Load the prediction model
def load_predictor_model():
    """Load the trained prediction model from disk."""
    global predictor_model
    model_path = 'energy_predictor_model.joblib'
    
    if os.path.exists(model_path):
        try:
            predictor_model = joblib.load(model_path)
            print(f"Prediction model loaded successfully from {model_path}")
            return True
        except Exception as e:
            print(f"Error loading model: {e}")
            return False
    else:
        print(f"Warning: Model file '{model_path}' not found. Prediction endpoint will not work.")
        print("Please run the model_training.ipynb notebook to generate the model.")
        return False

# Generate 24-hour forecast
def generate_24hr_forecast(model):
    """
    Generate 24-hour energy consumption forecast.
    Returns list of predictions with timestamps and predicted energy values.
    Note: This is a simplified forecast. For production, you'd need recent consumption data
    to properly calculate lagged features and rolling statistics.
    """
    if model is None:
        return None
    
    # Start from current hour
    now = datetime.now().replace(minute=0, second=0, microsecond=0)
    
    forecasts = []
    
    # For demo purposes, we'll use average consumption for lagged features
    # In production, fetch recent actual data from database
    avg_consumption = 0.2  # Average kWh from training data
    
    for hour_offset in range(24):
        # Generate timestamp for each hour
        forecast_time = now + timedelta(hours=hour_offset)
        
        # Time category helper
        hour = forecast_time.hour
        if 0 <= hour < 6:
            time_cat = 0  # Night
        elif 6 <= hour < 12:
            time_cat = 1  # Morning
        elif 12 <= hour < 18:
            time_cat = 2  # Afternoon
        else:
            time_cat = 3  # Evening
        
        # Extract features (same as training - 10 features)
        # Note: Using avg_consumption for lagged values (simplified)
        feature_array = np.array([[
            forecast_time.hour,  # hour_of_day
            forecast_time.weekday(),  # day_of_week
            1 if forecast_time.weekday() >= 5 else 0,  # is_weekend
            time_cat,  # time_category
            avg_consumption,  # lag_1 (simplified)
            avg_consumption,  # lag_2 (simplified)
            avg_consumption,  # lag_3 (simplified)
            avg_consumption,  # rolling_mean_3 (simplified)
            avg_consumption,  # rolling_mean_6 (simplified)
            0.02  # rolling_std_3 (simplified)
        ]])
        
        # Make prediction
        predicted_energy = model.predict(feature_array)[0]
        
        # Ensure prediction is non-negative
        predicted_energy = max(0, predicted_energy)
        
        forecasts.append({
            'timestamp': forecast_time.isoformat(),
            'predicted_kwh': round(predicted_energy, 4),
            'hour': forecast_time.hour,
            'day_of_week': forecast_time.strftime('%A'),
            'time_category': ['Night', 'Morning', 'Afternoon', 'Evening'][time_cat]
        })
    
    return forecasts

# Data loading utility for energy dataset
def load_energy_data(file_path, limit_rows=None):
    """
    Load energy consumption CSV data into the database.
    Format: timestamp, household_id, energy_consumption_kWh, future_consumption_kWh
    
    Args:
        file_path: Path to energy CSV file
        limit_rows: Maximum rows to load (None for all)
    """
    if not os.path.exists(file_path):
        print(f"Error: File {file_path} not found!")
        return 0
    
    print(f"Loading data from {file_path}...")
    if limit_rows:
        print(f"Limiting to first {limit_rows} rows for faster loading...")
    
    # Read CSV data
    df = pd.read_csv(file_path, nrows=limit_rows)
    
    # Process timestamp column
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    
    # Handle NaN/Missing values
    df = df.dropna(subset=['energy_consumption_kWh'])
    
    print(f"Loaded data: {len(df)} records")
    print(f"Date range: {df['timestamp'].min()} to {df['timestamp'].max()}")
    print(f"Unique households: {df['household_id'].nunique()}")
    
    # Load data into database in batches for efficiency
    rows_loaded = 0
    batch_size = 1000
    
    with app.app_context():
        # Clear existing data first
        EnergyReading.query.delete()
        db.session.commit()
        print("Cleared existing data from database")
        
        # Load in batches
        for i in range(0, len(df), batch_size):
            batch = df.iloc[i:i+batch_size]
            for _, row in batch.iterrows():
                reading = EnergyReading(
                    timestamp=row['timestamp'],
                    household_id=int(row['household_id']),
                    energy_kwh=row['energy_consumption_kWh'],
                    future_energy_kwh=row.get('future_consumption_kWh', None)
                )
                db.session.add(reading)
                rows_loaded += 1
            
            db.session.commit()
            if (i + batch_size) % 5000 == 0:
                print(f"  Loaded {rows_loaded} rows...")
        
        db.session.commit()
    
    print(f"Successfully loaded {rows_loaded} readings!")
    return rows_loaded

# API Routes
@app.route('/')
def hello():
    return {'message': 'Smart Home Energy Tracker API'}

# ============ Frontend-Compatible API Endpoints ============

@app.route('/api/energy/current', methods=['GET'])
def get_current_consumption():
    """
    Get current energy consumption (latest reading).
    Frontend-compatible endpoint.
    """
    try:
        # Get the most recent reading
        latest_reading = EnergyReading.query.order_by(
            EnergyReading.timestamp.desc()
        ).first()
        
        if not latest_reading:
            return jsonify({
                'current': 0,
                'unit': 'kW',
                'timestamp': datetime.now().isoformat()
            })
        
        # Convert kWh to kW (assuming 5-minute intervals)
        # kWh per 5 min = (kWh * 12) to get hourly rate in kW
        current_kw = latest_reading.energy_kwh * 12
        
        return jsonify({
            'current': round(current_kw, 2),
            'unit': 'kW',
            'timestamp': latest_reading.timestamp.isoformat()
        })
    
    except Exception as e:
        return jsonify({
            'error': 'Failed to fetch current consumption',
            'message': str(e)
        }), 500

@app.route('/api/energy/usage', methods=['GET'])
def get_energy_usage_range():
    """
    Get energy usage data for specified time range.
    Frontend-compatible endpoint.
    
    Query Parameters:
    - range: '24h', '7d', or '30d' (default: '24h')
    - household_id: Optional household filter
    """
    time_range = request.args.get('range', '24h')
    household_id = request.args.get('household_id', type=int)
    
    # Calculate time cutoff
    now = datetime.now()
    if time_range == '24h':
        cutoff = now - timedelta(hours=24)
        interval_minutes = 60  # Hourly aggregation
    elif time_range == '7d':
        cutoff = now - timedelta(days=7)
        interval_minutes = 1440  # Daily aggregation
    elif time_range == '30d':
        cutoff = now - timedelta(days=30)
        interval_minutes = 10080  # Weekly aggregation
    else:
        cutoff = now - timedelta(hours=24)
        interval_minutes = 60
    
    try:
        # Query readings
        query = EnergyReading.query.filter(EnergyReading.timestamp >= cutoff)
        
        if household_id:
            query = query.filter(EnergyReading.household_id == household_id)
        
        readings = query.order_by(EnergyReading.timestamp).all()
        
        if not readings:
            return jsonify([])
        
        # Aggregate data based on time range
        if time_range == '24h':
            # Hourly data
            aggregated = []
            for i in range(24):
                hour_start = now.replace(minute=0, second=0, microsecond=0) - timedelta(hours=23-i)
                hour_end = hour_start + timedelta(hours=1)
                
                hour_readings = [r for r in readings if hour_start <= r.timestamp < hour_end]
                
                if hour_readings:
                    avg_consumption = sum(r.energy_kwh for r in hour_readings) / len(hour_readings)
                    cost = avg_consumption * 0.12  # $0.12 per kWh
                else:
                    avg_consumption = 0
                    cost = 0
                
                aggregated.append({
                    'time': f"{i}:00",
                    'consumption': round(avg_consumption, 3),
                    'cost': round(cost, 2)
                })
            
            return jsonify(aggregated)
        
        elif time_range == '7d':
            # Daily data
            days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
            aggregated = []
            
            for i in range(7):
                day_start = now.replace(hour=0, minute=0, second=0, microsecond=0) - timedelta(days=6-i)
                day_end = day_start + timedelta(days=1)
                
                day_readings = [r for r in readings if day_start <= r.timestamp < day_end]
                
                if day_readings:
                    total_consumption = sum(r.energy_kwh for r in day_readings)
                    cost = total_consumption * 0.12
                else:
                    total_consumption = 0
                    cost = 0
                
                day_name = days[day_start.weekday()]
                aggregated.append({
                    'day': day_name,
                    'consumption': round(total_consumption, 2),
                    'cost': round(cost, 2)
                })
            
            return jsonify(aggregated)
        
        else:  # 30d - weekly aggregation
            aggregated = []
            for week in range(4):
                week_start = now.replace(hour=0, minute=0, second=0, microsecond=0) - timedelta(days=28-week*7)
                week_end = week_start + timedelta(days=7)
                
                week_readings = [r for r in readings if week_start <= r.timestamp < week_end]
                
                if week_readings:
                    total_consumption = sum(r.energy_kwh for r in week_readings)
                    cost = total_consumption * 0.12
                else:
                    total_consumption = 0
                    cost = 0
                
                aggregated.append({
                    'week': f"Week {week + 1}",
                    'consumption': round(total_consumption, 2),
                    'cost': round(cost, 2)
                })
            
            return jsonify(aggregated)
    
    except Exception as e:
        return jsonify({
            'error': 'Failed to fetch energy usage',
            'message': str(e)
        }), 500

@app.route('/api/appliances', methods=['GET'])
def get_appliances():
    """
    Get list of appliances (using households as appliance proxies).
    Frontend-compatible endpoint.
    """
    try:
        # Get distinct households with their latest readings
        households = db.session.query(
            EnergyReading.household_id
        ).distinct().all()
        
        appliances = []
        appliance_types = ['heating_cooling', 'appliance', 'appliance', 'appliance', 'electronics']
        appliance_names = ['HVAC', 'Refrigerator', 'Washer', 'Water Heater', 'Electronics']
        
        for idx, (household_id,) in enumerate(households):
            # Get latest reading for this household
            latest = EnergyReading.query.filter(
                EnergyReading.household_id == household_id
            ).order_by(EnergyReading.timestamp.desc()).first()
            
            # Convert kWh to W (5-min reading * 12 * 1000)
            power_rating = int(latest.energy_kwh * 12 * 1000) if latest else 0
            status = 'active' if power_rating > 100 else 'idle'
            
            appliances.append({
                'id': household_id,
                'name': appliance_names[idx % len(appliance_names)],
                'type': appliance_types[idx % len(appliance_types)],
                'powerRating': power_rating,
                'status': status
            })
        
        return jsonify(appliances)
    
    except Exception as e:
        return jsonify({
            'error': 'Failed to fetch appliances',
            'message': str(e)
        }), 500

@app.route('/api/appliances/<int:appliance_id>/usage', methods=['GET'])
def get_appliance_usage(appliance_id):
    """
    Get usage data for specific appliance (household).
    Frontend-compatible endpoint.
    """
    time_range = request.args.get('range', '7d')
    
    try:
        # Use household_id as appliance_id
        now = datetime.now()
        if time_range == '7d':
            cutoff = now - timedelta(days=7)
        else:
            cutoff = now - timedelta(hours=24)
        
        readings = EnergyReading.query.filter(
            EnergyReading.household_id == appliance_id,
            EnergyReading.timestamp >= cutoff
        ).order_by(EnergyReading.timestamp).all()
        
        usage_data = [{
            'timestamp': r.timestamp.isoformat(),
            'consumption': round(r.energy_kwh, 3),
            'cost': round(r.energy_kwh * 0.12, 2)
        } for r in readings]
        
        return jsonify(usage_data)
    
    except Exception as e:
        return jsonify({
            'error': 'Failed to fetch appliance usage',
            'message': str(e)
        }), 500

@app.route('/api/appliances/breakdown', methods=['GET'])
def get_appliance_breakdown():
    """
    Get energy consumption breakdown by appliance (household).
    Frontend-compatible endpoint.
    """
    try:
        # Get last 24 hours of data
        cutoff = datetime.now() - timedelta(hours=24)
        
        # Group by household and sum consumption
        household_totals = db.session.query(
            EnergyReading.household_id,
            db.func.sum(EnergyReading.energy_kwh).label('total_kwh')
        ).filter(
            EnergyReading.timestamp >= cutoff
        ).group_by(
            EnergyReading.household_id
        ).all()
        
        # Calculate total for percentages
        grand_total = sum(total for _, total in household_totals)
        
        # Map to appliance names
        appliance_names = ['HVAC', 'Water Heater', 'Refrigerator', 'Washer/Dryer', 'Electronics']
        colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#a4de6c']
        
        breakdown = []
        for idx, (household_id, total_kwh) in enumerate(household_totals):
            percentage = (total_kwh / grand_total * 100) if grand_total > 0 else 0
            
            breakdown.append({
                'name': appliance_names[idx % len(appliance_names)],
                'value': round(percentage, 1),
                'consumption': round(total_kwh, 1),
                'color': colors[idx % len(colors)]
            })
        
        return jsonify(breakdown)
    
    except Exception as e:
        return jsonify({
            'error': 'Failed to fetch appliance breakdown',
            'message': str(e)
        }), 500

@app.route('/api/predictions', methods=['GET'])
def get_predictions_frontend():
    """
    Get energy predictions in frontend-compatible format.
    Frontend-compatible endpoint.
    """
    hours = request.args.get('hours', default=24, type=int)
    
    if predictor_model is None:
        return jsonify({
            'error': 'Prediction model not loaded',
            'message': 'Please run model_training.ipynb to generate the model file'
        }), 503
    
    try:
        forecast = generate_24hr_forecast(predictor_model)
        
        if forecast is None:
            return jsonify({
                'error': 'Failed to generate forecast'
            }), 500
        
        # Reformat for frontend
        next24Hours = []
        for pred in forecast[:hours]:
            next24Hours.append({
                'time': f"{pred['hour']}:00",
                'predicted': round(pred['predicted_kwh'] * 12, 2),  # Convert to kW
                'confidence': 0.85  # Placeholder confidence
            })
        
        # Calculate summary
        total_predicted_kwh = sum(p['predicted_kwh'] for p in forecast)
        predicted_cost = total_predicted_kwh * 0.12
        
        # Get actual cost today
        today_start = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        today_readings = EnergyReading.query.filter(
            EnergyReading.timestamp >= today_start
        ).all()
        actual_kwh_today = sum(r.energy_kwh for r in today_readings)
        actual_cost_today = actual_kwh_today * 0.12
        
        return jsonify({
            'next24Hours': next24Hours,
            'summary': {
                'predictedCost': round(predicted_cost, 2),
                'actualCostToday': round(actual_cost_today, 2),
                'difference': round(predicted_cost - actual_cost_today, 2),
                'trend': 'increasing' if predicted_cost > actual_cost_today else 'decreasing'
            }
        })
    
    except Exception as e:
        return jsonify({
            'error': 'Prediction failed',
            'message': str(e)
        }), 500

@app.route('/api/v1/usage/historical', methods=['GET'])
def get_historical_usage():
    """
    Get historical energy usage data.
    Query parameters:
    - household_id: Filter by specific household (e.g., 1, 2, 3)
    - start_date: Filter by start date (ISO format: YYYY-MM-DD)
    - end_date: Filter by end date (ISO format: YYYY-MM-DD)
    """
    # Get query parameters
    household_id = request.args.get('household_id')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    # Build query
    query = EnergyReading.query
    
    # Apply filters
    if household_id:
        query = query.filter(EnergyReading.household_id == int(household_id))
    
    if start_date:
        try:
            start_dt = datetime.fromisoformat(start_date)
            query = query.filter(EnergyReading.timestamp >= start_dt)
        except ValueError:
            return jsonify({'error': 'Invalid start_date format. Use YYYY-MM-DD'}), 400
    
    if end_date:
        try:
            end_dt = datetime.fromisoformat(end_date)
            query = query.filter(EnergyReading.timestamp <= end_dt)
        except ValueError:
            return jsonify({'error': 'Invalid end_date format. Use YYYY-MM-DD'}), 400
    
    # Order by timestamp and execute query
    readings = query.order_by(EnergyReading.timestamp).all()
    
    # Convert to JSON
    result = [reading.to_dict() for reading in readings]
    
    return jsonify({
        'count': len(result),
        'data': result
    })

@app.route('/api/v1/usage/predict', methods=['GET'])
def get_prediction():
    """
    Get 24-hour energy usage forecast.
    Returns predicted power consumption for the next 24 hours.
    """
    if predictor_model is None:
        return jsonify({
            'error': 'Prediction model not loaded',
            'message': 'Please run model_training.ipynb to generate the model file'
        }), 503
    
    try:
        forecast = generate_24hr_forecast(predictor_model)
        
        if forecast is None:
            return jsonify({
                'error': 'Failed to generate forecast'
            }), 500
        
        return jsonify({
            'forecast_generated': datetime.now().isoformat(),
            'forecast_period_hours': 24,
            'predictions': forecast
        })
    
    except Exception as e:
        return jsonify({
            'error': 'Prediction failed',
            'message': str(e)
        }), 500

# Utility function to get latest usage data for optimization
def get_latest_usage_data(time_window_minutes=60):
    """
    Retrieve the latest energy readings within the specified time window.
    For demo purposes with historical data, if no recent data exists,
    retrieves the most recent 100 readings from the database.
    
    Args:
        time_window_minutes (int): Time window in minutes (default: 60 minutes)
    
    Returns:
        list: List of dictionaries with recent usage data
    """
    cutoff_time = datetime.now() - timedelta(minutes=time_window_minutes)
    
    # Query latest readings for all households
    latest_readings = EnergyReading.query.filter(
        EnergyReading.timestamp >= cutoff_time
    ).order_by(EnergyReading.timestamp.desc()).limit(100).all()
    
    # If no recent data (historical dataset), get the most recent readings from database
    if not latest_readings:
        latest_readings = EnergyReading.query.order_by(
            EnergyReading.timestamp.desc()
        ).limit(100).all()
    
    # Convert to dictionary format
    usage_data = []
    for reading in latest_readings:
        usage_data.append({
            'household_id': reading.household_id,
            'energy_kwh': reading.energy_kwh,
            'timestamp': reading.timestamp
        })
    
    return usage_data

@app.route('/api/optimization/suggestions', methods=['GET'])
@app.route('/api/v1/optimization/suggestions', methods=['GET'])
def get_suggestions():
    """
    Get energy optimization suggestions based on current usage patterns
    and RDF ontology rules.
    
    Query Parameters:
    - time_window (optional): Minutes of historical data to analyze (default: 60)
    
    Returns:
        JSON with optimization suggestions
    
    Available on both /api/optimization/suggestions (frontend) and /api/v1/optimization/suggestions (v1)
    """
    try:
        # Get time window parameter (default: 60 minutes)
        time_window = request.args.get('time_window', default=60, type=int)
        
        # Retrieve latest usage data
        current_usage = get_latest_usage_data(time_window)
        
        if not current_usage:
            return jsonify([])
        
        # Generate optimization suggestions using rule engine
        backend_suggestions = get_optimization_suggestions(current_usage)
        
        # Get current time slot info
        time_slot_info = get_time_slot_info()
        
        # Transform backend suggestions to frontend format
        frontend_suggestions = []
        for idx, suggestion in enumerate(backend_suggestions, start=1):
            # Extract energy and cost savings
            energy_saving = suggestion.get('potential_savings_kwh', 0) * 24  # Daily savings
            cost_saving = energy_saving * 0.12  # $0.12 per kWh
            
            # Determine priority based on impact
            impact_level = suggestion.get('impact', 'Medium')
            if impact_level == 'High':
                priority = 'high'
                score = 8.5 + (idx * 0.1)
            elif impact_level == 'Medium':
                priority = 'medium'
                score = 6.0 + (idx * 0.1)
            else:
                priority = 'low'
                score = 4.0 + (idx * 0.1)
            
            # Format suggestion text for title and description
            text = suggestion.get('text', '')
            parts = text.split('. ', 1)
            title = parts[0] if parts else text
            description = parts[1] if len(parts) > 1 else f"Time slot: {suggestion.get('time_slot', 'N/A')}"
            
            frontend_suggestions.append({
                'id': suggestion.get('id', idx),
                'title': title[:100],  # Limit title length
                'description': description,
                'impact': {
                    'energySaving': f"{energy_saving:.1f} kWh/day",
                    'costSaving': f"${cost_saving:.2f}/day",
                    'score': min(10.0, score)
                },
                'priority': priority,
                'status': 'pending',
                'category': suggestion.get('category', 'General'),
                'timeSlot': suggestion.get('time_slot', 'N/A'),
                'householdId': suggestion.get('household_id')
            })
        
        return jsonify(frontend_suggestions)
    
    except Exception as e:
        return jsonify({
            'error': 'Suggestion generation failed',
            'message': str(e)
        }), 500

@app.route('/api/v1/optimization/timeslot', methods=['GET'])
def get_current_timeslot():
    """
    Get information about the current time-of-use pricing slot.
    
    Returns:
        JSON with current time slot details and cost multiplier
    """
    try:
        time_slot_info = get_time_slot_info()
        return jsonify(time_slot_info)
    except Exception as e:
        return jsonify({
            'error': 'Failed to retrieve time slot information',
            'message': str(e)
        }), 500

if __name__ == '__main__':
    # Initialize database
    init_db()
    
    # Load RDF ontology for optimization rules
    print("\nLoading RDF ontology for optimization engine...")
    load_ontology_graph()
    
    # Load prediction model
    load_predictor_model()
    
    # Load energy dataset from root directory
    energy_file = '../energy_data.csv'
    
    # Check if we already have data in the database
    with app.app_context():
        existing_count = EnergyReading.query.count()
        
        if existing_count == 0:
            print(f"\nDatabase is empty. Loading energy data from {energy_file}...")
            print("Loading all records from energy_data.csv...")
            load_energy_data(energy_file)
        else:
            print(f"\nDatabase already contains {existing_count} records.")
            print("Skipping data load. Delete instance/refit_energy_data.db to reload.")
    
    # Run Flask app
    print("\nStarting Flask server...")
    app.run(debug=True, port=5000)
