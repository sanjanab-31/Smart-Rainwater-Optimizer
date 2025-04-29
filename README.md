# Smart Rainwater Harvesting Optimizer

A web-based platform that optimizes rainwater harvesting with precise calculations, real-time weather integration, AI-driven recommendations, and data visualization.

## Features

- Manual data input (roof area, outflow, location, tank capacity)
- Real-time weather integration via OpenWeatherMap API
- Inflow calculation and outflow display
- Leak detection and smart alerts
- Tank maintenance suggestions
- ROI calculation
- AI-based water usage optimization
- Tank capacity planning
- Visual reports with Chart.js
- Data storage in MongoDB

## Technology Stack

- **Frontend**: React.js, plain CSS
- **Backend**: Django (Python)
- **Database**: MongoDB
- **External APIs**: OpenWeatherMap API
- **AI/ML Libraries**: Pandas, NumPy, Scikit-learn
- **Charting Library**: Chart.js

## Setup Instructions

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Create a virtual environment:
   ```
   python -m venv venv
   ```

3. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - Unix/MacOS: `source venv/bin/activate`

4. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

5. Set up environment variables:
   - Create a `.env` file in the backend directory
   - Add your OpenWeatherMap API key: `OPENWEATHERMAP_API_KEY=your_api_key_here`
   - Add your MongoDB connection string: `MONGODB_URI=your_mongodb_uri_here`

6. Run migrations:
   ```
   python manage.py migrate
   ```

7. Start the Django server:
   ```
   python manage.py runserver
   ```

## API Endpoints

- `POST /api/inputs/`: Save user inputs and trigger calculations
- `GET /api/results/`: Retrieve results for display
- `POST /api/save-results/`: Save results to MongoDB
- `GET /api/historical-data/`: Fetch historical data for Analysis Page
- `PUT /api/settings/`: Update user preferences
- `DELETE /api/saved-results/`: Delete saved results
- `GET /api/weather/`: Fetch rainfall data from OpenWeatherMap API

## Core Formulas

- **Rainwater Inflow**: Inflow = Rainfall (mm) × Roof Area (m²) × 0.9
- **ROI**: (Water Saved in Liters × Local Water Cost per Liter) - (Setup + Maintenance Costs)
- **Leak Detection**: If actual outflow significantly exceeds expected outflow (based on inflow prediction), suspect a leak

## AI Optimization Logic

- **High Rainfall Prediction**: Allocate more water for gardening (e.g., 50% gardening, 30% cleaning, 20% drinking)
- **Low Rainfall Prediction**: Prioritize drinking and cleaning (e.g., 40% drinking, 40% cleaning, 20% gardening)
- **Tank Near Full**: Recommend increased usage or external storage to prevent overflow
- **Tank Near Empty**: Suggest reducing non-essential usage (e.g., limit gardening)
