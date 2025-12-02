# Smart Home Energy Tracker

A web application to monitor and track energy consumption in smart homes using the REFIT dataset.

## Tech Stack

- **Frontend**: React
- **Backend**: Flask (Python)
- **Database**: SQLite with SQLAlchemy ORM
- **Data Processing**: Pandas
- **API**: RESTful API with CORS enabled

## Features

- Historical energy usage data storage and retrieval
- Support for REFIT dataset format (wide format CSV conversion)
- Filterable API endpoints (by meter, date range)
- SQLite database for efficient data persistence

## Project Structure

```
Smart-Home-Energy-Tracker/
├── backend/          # Flask API server
│   ├── app.py        # Main Flask application
│   ├── requirements.txt
│   ├── venv/         # Python virtual environment
│   ├── refit_energy_data.db  # SQLite database (auto-generated)
│   └── House_1_sample.csv    # Sample REFIT data (auto-generated)
├── frontend/         # React application
│   ├── src/
│   ├── public/
│   └── package.json
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
   - Create the SQLite database
   - Generate a sample REFIT CSV file
   - Load sample data into the database

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

### Historical Energy Usage
- `GET /api/v1/usage/historical` - Get historical energy readings
  
  **Query Parameters:**
  - `meter_id` (optional) - Filter by specific meter (e.g., 'Aggregate', 'Appliance_1')
  - `start_date` (optional) - Filter from date (format: YYYY-MM-DD)
  - `end_date` (optional) - Filter to date (format: YYYY-MM-DD)
  
  **Examples:**
  ```bash
  # Get all readings
  http://127.0.0.1:5000/api/v1/usage/historical
  
  # Get readings for a specific meter
  http://127.0.0.1:5000/api/v1/usage/historical?meter_id=Aggregate
  
  # Get readings within a date range
  http://127.0.0.1:5000/api/v1/usage/historical?start_date=2024-01-01&end_date=2024-01-31
  ```

## Database Schema

### EnergyReading Table
- `id` - Integer, Primary Key
- `timestamp` - DateTime (indexed)
- `meter_id` - String (indexed) - Meter identifier (e.g., 'Aggregate', 'Appliance_1')
- `power_w` - Float - Power consumption in Watts

## REFIT Dataset Integration

The application supports REFIT dataset CSV files. The REFIT format has:
- `Time` column (timestamp)
- Multiple appliance columns (e.g., 'Aggregate', 'Appliance_1', 'Appliance_2')

The `load_refit_data()` function automatically:
1. Converts the Time column to datetime
2. Melts wide format to long format (unpivots appliance columns)
3. Filters out NaN and zero values
4. Loads data into SQLite database

## Development

- Backend runs on port 5000
- Frontend runs on port 3000
- CORS is enabled for cross-origin requests

## License

MIT
