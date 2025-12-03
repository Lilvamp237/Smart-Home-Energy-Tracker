# Smart Home Energy Tracker

A web application to monitor, track, and predict household energy consumption using machine learning.

## Tech Stack

- **Frontend**: React
- **Backend**: Flask (Python)
- **Database**: SQLite with SQLAlchemy ORM
- **Machine Learning**: scikit-learn (Linear Regression)
- **Data Processing**: Pandas, NumPy
- **Visualization**: Matplotlib (training notebooks)
- **API**: RESTful API with CORS enabled

## Features

- **Historical Data Tracking**: Store and retrieve energy consumption data by household
- **ML-Powered Predictions**: 24-hour energy consumption forecasting using trained model
- **Advanced Feature Engineering**: Lagged values, rolling statistics, and time-based features
- **Model Performance**: 74% R² score (excellent predictive accuracy)
- **Filterable API**: Query by household, date range
- **Efficient Storage**: SQLite database with 921+ readings across 5 households

## Project Structure

```
Smart-Home-Energy-Tracker/
├── backend/                          # Flask API server
│   ├── app.py                        # Main Flask application with API endpoints
│   ├── model_training.ipynb          # Jupyter notebook for ML model training
│   ├── energy_predictor_model.joblib # Trained prediction model (R² = 0.74)
│   ├── requirements.txt              # Python dependencies
│   ├── venv/                         # Python virtual environment
│   └── instance/
│       └── refit_energy_data.db      # SQLite database (921 records)
├── frontend/                         # React application (in development)
│   ├── src/
│   ├── public/
│   └── package.json
├── energy_categorical.csv            # Training dataset (5 households)
└── .gitignore
```

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Activate the virtual environment:
   ```bash
   .\venv\Scripts\Activate.ps1  # Windows PowerShell
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run the Flask server:
   ```bash
   python app.py
   ```

   The backend will be available at `http://127.0.0.1:5000/`
   
   On first run, it will:
   - Create the SQLite database in `instance/` folder
   - Load energy consumption data from `energy_categorical.csv`
   - Load the trained ML prediction model
   - Display 921 records across 5 households

5. (Optional) Train the ML model:
   ```bash
   jupyter notebook model_training.ipynb
   ```
   
   Run all cells to retrain the model with:
   - 10 engineered features (lagged values, rolling stats, time features)
   - 80/20 train-test split
   - Expected R² score: ~0.74 (74% accuracy)

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

   The frontend will be available at `http://localhost:3000/`

## API Endpoints

### Health Check
- `GET /` - API status check
  ```json
  {"message": "Smart Home Energy Tracker API"}
  ```

### Historical Energy Usage
- `GET /api/v1/usage/historical` - Get historical energy readings
  
  **Query Parameters:**
  - `household_id` (optional) - Filter by household (1-5)
  - `start_date` (optional) - Filter from date (format: YYYY-MM-DD)
  - `end_date` (optional) - Filter to date (format: YYYY-MM-DD)
  
  **Examples:**
  ```bash
  # Get all readings
  http://127.0.0.1:5000/api/v1/usage/historical
  
  # Get readings for household 1
  http://127.0.0.1:5000/api/v1/usage/historical?household_id=1
  
  # Get readings within a date range
  http://127.0.0.1:5000/api/v1/usage/historical?start_date=2024-01-01&end_date=2024-01-01
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

### Energy Prediction (ML-Powered)
- `GET /api/v1/usage/predict` - Get 24-hour energy consumption forecast
  
  **Response:**
  ```json
  {
    "forecast_generated": "2025-12-03T14:30:00",
    "forecast_period_hours": 24,
    "predictions": [
      {
        "timestamp": "2025-12-03T14:00:00",
        "predicted_kwh": 0.2134,
        "hour": 14,
        "day_of_week": "Tuesday",
        "time_category": "Afternoon"
      }
    ]
  }
  ```

## Database Schema

### EnergyReading Table
- `id` - Integer, Primary Key
- `timestamp` - DateTime (indexed)
- `household_id` - Integer (indexed) - Household identifier (1-5)
- `energy_kwh` - Float - Current energy consumption in kWh
- `future_energy_kwh` - Float - Next period's consumption (for ML training)

## Machine Learning Model

### Model Architecture
- **Algorithm**: Linear Regression
- **Performance**: R² = 0.7425 (74% variance explained)
- **Prediction Error**: MAE = 21.7 Wh average error
- **Interpretation**: Excellent predictive accuracy

### Features (10 total)
1. **Time Features**: hour_of_day, day_of_week, is_weekend, time_category
2. **Lagged Features**: lag_1, lag_2, lag_3 (previous consumption values)
3. **Rolling Statistics**: rolling_mean_3, rolling_mean_6, rolling_std_3

### Training Process
- **Dataset**: 183 records from household 1 (after feature engineering)
- **Train/Test Split**: 80/20 (maintains time order, no shuffling)
- **Target Variable**: future_consumption_kWh (predicts next period)
- **Model File**: `energy_predictor_model.joblib` (saved in backend/)

### Why It Works
Energy consumption is highly **autocorrelated** - recent usage patterns are the strongest predictor of future consumption. The lagged features (lag_1, lag_2, lag_3) capture this temporal dependency, while rolling statistics smooth out noise and identify trends.

## Dataset

The application uses `energy_categorical.csv` containing:
- **923 records** across **5 households**
- **Timeframe**: January 1, 2024 (15+ hours of data)
- **Columns**: timestamp, household_id, energy_consumption_kWh, future_consumption_kWh, target_category
- **Categories**: Low/Medium/High consumption levels

## Development

- Backend runs on port 5000
- Frontend runs on port 3000 (in development)
- CORS is enabled for cross-origin requests
- Model trained using Jupyter notebook (`model_training.ipynb`)
- Database stored in `backend/instance/refit_energy_data.db`

## Future Enhancements

- [ ] Complete React frontend with data visualizations
- [ ] Real-time energy monitoring dashboard
- [ ] Multi-household comparison charts
- [ ] Cost estimation based on consumption
- [ ] Energy-saving recommendations
- [ ] Extended forecasting (weekly/monthly predictions)

## License

MIT
