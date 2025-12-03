from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import pandas as pd
import numpy as np
import os
from datetime import datetime, timedelta
import joblib

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

if __name__ == '__main__':
    # Initialize database
    init_db()
    
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
