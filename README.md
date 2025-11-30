# Smart Home Energy Tracker

A web application to monitor and track energy consumption in smart homes.

## Tech Stack

- **Frontend**: React
- **Backend**: Flask (Python)
- **API**: RESTful API with CORS enabled

## Project Structure

```
Smart-Home-Energy-Tracker/
├── backend/          # Flask API server
│   ├── app.py        # Main Flask application
│   ├── requirements.txt
│   └── venv/         # Python virtual environment
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

- `GET /` - Health check endpoint

## Development

- Backend runs on port 5000
- Frontend runs on port 3000
- CORS is enabled for cross-origin requests

## License

MIT
