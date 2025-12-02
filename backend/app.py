from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import pandas as pd
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///refit_energy_data.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Database Model
class EnergyReading(db.Model):
    __tablename__ = 'energy_readings'
    
    id = db.Column(db.Integer, primary_key=True)
    timestamp = db.Column(db.DateTime, nullable=False, index=True)
    meter_id = db.Column(db.String(50), nullable=False, index=True)
    power_w = db.Column(db.Float, nullable=False)
    
    def to_dict(self):
        return {
            'id': self.id,
            'timestamp': self.timestamp.isoformat(),
            'meter_id': self.meter_id,
            'power_w': self.power_w
        }

# Initialize database
def init_db():
    """Create database file and all tables."""
    with app.app_context():
        db.create_all()
        print("Database initialized successfully!")

# Data loading utility for REFIT dataset
def load_refit_data(file_path):
    """
    Load REFIT CSV data into the database.
    Converts wide format (many appliance columns) to long format.
    """
    if not os.path.exists(file_path):
        print(f"Error: File {file_path} not found!")
        return 0
    
    print(f"Loading data from {file_path}...")
    
    # Read CSV data
    df = pd.read_csv(file_path)
    
    # Process Time column to datetime
    df['Time'] = pd.to_datetime(df['Time'])
    
    # Melt DataFrame: Convert wide format to long format
    # id_vars=['Time'] keeps Time column, all other columns become meter_id
    df_melted = df.melt(
        id_vars=['Time'],
        var_name='meter_id',
        value_name='power_w'
    )
    
    # Handle NaN/Missing values - drop rows with missing or zero power
    df_melted = df_melted.dropna(subset=['power_w'])
    df_melted = df_melted[df_melted['power_w'] != 0]
    
    # Load data into database
    rows_loaded = 0
    with app.app_context():
        for _, row in df_melted.iterrows():
            reading = EnergyReading(
                timestamp=row['Time'],
                meter_id=row['meter_id'],
                power_w=row['power_w']
            )
            db.session.add(reading)
            rows_loaded += 1
        
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
    - meter_id: Filter by specific meter (e.g., 'Aggregate', 'Appliance_1')
    - start_date: Filter by start date (ISO format: YYYY-MM-DD)
    - end_date: Filter by end date (ISO format: YYYY-MM-DD)
    """
    # Get query parameters
    meter_id = request.args.get('meter_id')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    # Build query
    query = EnergyReading.query
    
    # Apply filters
    if meter_id:
        query = query.filter(EnergyReading.meter_id == meter_id)
    
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

if __name__ == '__main__':
    # Initialize database
    init_db()
    
    # Create sample REFIT CSV file
    sample_file = 'House_1_sample.csv'
    if not os.path.exists(sample_file):
        sample_data = {
            'Time': [
                '2024-01-01 00:00:00',
                '2024-01-01 00:01:00',
                '2024-01-01 00:02:00',
                '2024-01-01 00:03:00',
                '2024-01-01 00:04:00'
            ],
            'Aggregate': [245.5, 248.3, 251.7, 249.2, 246.8],
            'Appliance_1': [120.3, 122.1, 119.8, 121.5, 120.0],
            'Appliance_2': [45.2, 46.8, 47.1, 45.9, 46.3]
        }
        df_sample = pd.DataFrame(sample_data)
        df_sample.to_csv(sample_file, index=False)
        print(f"Created sample file: {sample_file}")
    
    # Load sample data
    load_refit_data(sample_file)
    
    # Run Flask app
    app.run(debug=True, port=5000)
