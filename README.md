# 🏍 CARS — Context-Aware Riding Score

An AI-powered two-wheeler riding behavior analysis system that evaluates rider actions combined with environmental context to generate an intelligent safety score.

---

## 📁 Project Structure

```
cars-project/
├── backend/
│   ├── main.py              # FastAPI app — Python 3.14 compatible
│   └── requirements.txt     # Loose-pinned deps (works on Python 3.14)
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ScoreRing.jsx
│   │   │   ├── RideCharts.jsx
│   │   │   ├── MetricCards.jsx
│   │   │   ├── AlertsPanel.jsx
│   │   │   └── FeedbackPanel.jsx
│   │   ├── data/scenarios.js
│   │   ├── utils/scoring.js
│   │   ├── utils/api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
├── scripts/
│   └── generate_data.py     # Synthetic dataset generator
├── start.bat                # Windows one-click launcher
├── start.sh                 # macOS/Linux one-click launcher
└── README.md
```

---

## 🚀 Setup & Running

### Prerequisites
- **Python 3.12 or 3.14** (both supported)
- **Node.js 18+**
- **pip** (comes with Python)

---

### ⚠ Why requirements.txt uses >= instead of ==

Python 3.14 is a recent release. Hard-pinned versions (e.g. `fastapi==0.111.0`) may not
have pre-built wheels for Python 3.14 yet, causing pip to fail when trying to compile
from source. Using `>=` lets pip pick the **latest wheel** that already supports your
Python version — which is always the safest approach on a new Python release.

---

### Backend (FastAPI)

```bash
cd backend

# 1. Create a virtual environment
python -m venv venv

# 2. Activate it
#    Windows:
venv\Scripts\activate
#    macOS / Linux:
source venv/bin/activate

# 3. Upgrade pip first (important on Python 3.14)
python -m pip install --upgrade pip

# 4. Install dependencies
pip install -r requirements.txt

# 5. Run the server
uvicorn main:app --reload --port 8000
```

Backend:   http://localhost:8000  
Swagger UI (interactive docs):  http://localhost:8000/docs

---

### Frontend (React + Vite)

```bash
cd frontend

npm install
npm run dev
```

Frontend: http://localhost:5173

> The frontend works **offline** even without the backend running.  
> It uses a built-in JavaScript scoring engine as fallback.  
> When the backend IS running it auto-switches to the API (shown by "API connected" badge).

---

### Generate Synthetic Dataset

```bash
cd scripts
python generate_data.py
# → creates scripts/data/ride_data.csv  (100 rides, ~5 000 rows)
```

---

### One-click launch (both servers)

```bash
# Windows
start.bat

# macOS / Linux
bash start.sh
```

---

## 🔷 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/analyze` | Analyze ride data, returns CARS score |
| GET  | `/sample-data?scenario=safe\|moderate\|risky` | Pre-built ride dataset |
| GET  | `/insights` | General safety tips |
| GET  | `/health` | Health check |

### Example — POST /analyze

**Request**
```json
{
  "speed":        [20, 35, 50, 70, 65, 40, 20],
  "acceleration": [1.5, 2.0, 1.8, -1.2, -2.8, -1.5, -0.8],
  "road_type":    "city",
  "weather":      "rain"
}
```

**Response**
```json
{
  "final_score": 62,
  "risk_score":  38.2,
  "risk_level":  "Moderate",
  "context_factor": 1.68,
  "max_speed": 70,
  "harsh_brake_count": 1,
  "aggressive_accel_count": 1,
  "avg_jerk": 1.23,
  "alerts":   [{"type":"warn","msg":"Harsh braking detected (1 events)","time":"Multiple timestamps"}],
  "insights": [{"cls":"warn","text":"Occasional hard braking. Try anticipating stops earlier."}],
  "badge":    {"label":"⚡ Developing Rider","cls":"moderate"}
}
```

---

## 🧠 Scoring Formula

```
Raw Risk = (max_speed/120)×30 + harsh_brakes×8 + aggressive_accel×5
         + min(avg_jerk×8, 20) + overspeed_count×3

Context Factor = Road Factor × Weather Factor
  Highway = 0.8 | City = 1.2 | Heavy Traffic = 1.5
  Clear   = 1.0 | Rain = 1.4 | Fog           = 1.2

Risk Score  = min(Raw Risk × Context Factor, 100)
Final Score = 100 − Risk Score

Risk Level:
  Safe     80–100
  Moderate 50–79
  Risky    0–49
```

---

## 🔮 Future Extensions

```python
# ML hook — backend/main.py → compute_raw_risk()
# Replace the rule-based body with:
#   model = joblib.load("models/risk_classifier.pkl")
#   return float(model.predict_proba([...])[0][1]) * 100

# Real-time GPS  → navigator.geolocation.watchPosition()
# OpenWeather    → api.openweathermap.org
# Google Roads   → roads.googleapis.com/v1/snapToRoads
# Mobile app     → React Native (scoring.js is fully portable)
# Insurance tier → aggregate daily scores → monthly risk profile
```

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite 5 |
| Styling | Tailwind CSS 3 |
| Charts | Recharts |
| HTTP client | Axios |
| Backend | FastAPI (Python 3.14) |
| Server | Uvicorn (pure-Python mode) |
| Validation | Pydantic v2 |
| Data | JSON / CSV |
