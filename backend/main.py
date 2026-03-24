"""
CARS — Context-Aware Riding Score
FastAPI Backend  |  Python 3.14 + Pydantic v2 + FastAPI 0.115+

Python 3.14 changes addressed:
  - All type hints use built-in generics (list[x], dict[x,y]) — no
    imports from `typing` needed for these (supported since 3.9,
    but 3.14 fully deprecates the typing equivalents for builtins).
  - Removed `from __future__ import annotations` — not needed in 3.14,
    and can mask runtime annotation evaluation issues in newer Python.
  - `Annotated` imported from `typing` (still correct in 3.14).
  - No use of any deprecated stdlib APIs removed in 3.14
    (e.g. `cgi`, `aifc`, `chunk`, `imghdr`, `pipes` etc.).
"""

from typing import Annotated

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# ─── App ──────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="CARS API",
    version="1.0.0",
    description="Context-Aware Riding Score — two-wheeler behavior analysis",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Pydantic v2 Models ───────────────────────────────────────────────────────

class RideData(BaseModel):
    speed:        list[float] = Field(..., description="Speed time-series in km/h")
    acceleration: list[float] = Field(..., description="Acceleration time-series in m/s²")
    road_type:    str         = Field(default="city",  description="highway | city | traffic")
    weather:      str         = Field(default="clear", description="clear | rain | fog")

    model_config = {
        "json_schema_extra": {
            "example": {
                "speed":        [20, 35, 50, 70, 65, 40, 20],
                "acceleration": [1.5, 2.0, 1.8, -1.2, -2.8, -1.5, -0.8],
                "road_type":    "city",
                "weather":      "rain",
            }
        }
    }


class AlertItem(BaseModel):
    type: str   # ok | warn | danger
    msg:  str
    time: str


class InsightItem(BaseModel):
    cls:  str   # pos | warn | neg
    text: str


class BadgeInfo(BaseModel):
    label: str
    cls:   str


class ScoreResponse(BaseModel):
    final_score:            int
    risk_score:             float
    risk_level:             str
    context_factor:         float
    max_speed:              float
    harsh_brake_count:      int
    aggressive_accel_count: int
    avg_jerk:               float
    overspeed_count:        int
    alerts:                 list[AlertItem]
    insights:               list[InsightItem]
    badge:                  BadgeInfo


# ─── Lookup Tables ────────────────────────────────────────────────────────────

ROAD_FACTORS: dict[str, float] = {
    "highway": 0.8,
    "city":    1.2,
    "traffic": 1.5,
}

WEATHER_FACTORS: dict[str, float] = {
    "clear": 1.0,
    "rain":  1.4,
    "fog":   1.2,
}

ROAD_LABELS: dict[str, str] = {
    "highway": "Highway",
    "city":    "City Road",
    "traffic": "Heavy Traffic",
}

WEATHER_LABELS: dict[str, str] = {
    "clear": "Clear",
    "rain":  "Rain",
    "fog":   "Fog",
}

SAMPLE_DATASETS: dict[str, dict] = {
    "safe": {
        "speed":        [20,28,35,40,42,45,43,40,38,35,30,25,22,20,18,20,25,28,30,28,25,20,18,15,12,10,8,5,0],
        "acceleration": [1.2,1.4,1.1,0.8,0.3,0.1,-0.2,-0.5,-0.4,-0.6,-0.7,-0.8,-0.5,-0.3,-0.4,0.5,1.1,0.8,0.5,0,-0.5,-0.7,-0.5,-0.4,-0.5,-0.3,-0.4,-0.5,-0.8],
        "road_type":    "city",
        "weather":      "clear",
    },
    "moderate": {
        "speed":        [30,42,55,68,72,75,70,65,55,45,30,20,28,40,58,65,60,55,48,40,35,28,20,15,10,8,5,3,0],
        "acceleration": [1.8,2.1,2.0,1.9,0.5,0.1,-0.8,-1.3,-2.1,-2.4,-2.8,-2.0,1.2,2.3,2.8,0.9,-0.8,-1.2,-1.8,-2.1,-1.1,-1.3,-1.5,-1.0,-0.8,-0.5,-0.6,-0.4,-0.8],
        "road_type":    "city",
        "weather":      "clear",
    },
    "risky": {
        "speed":        [40,58,75,90,95,100,102,95,80,50,30,20,45,70,95,100,98,90,75,50,30,20,15,10,8,6,4,2,0],
        "acceleration": [2.8,3.1,3.0,2.8,0.8,0.2,-1.5,-3.2,-4.5,-5.1,-4.8,-3.5,2.8,3.5,3.8,0.5,-1.2,-2.8,-4.2,-4.8,-3.5,-2.0,-1.5,-1.0,-0.6,-0.5,-0.5,-0.4,-1.0],
        "road_type":    "traffic",
        "weather":      "rain",
    },
}

# ─── Feature Extraction ───────────────────────────────────────────────────────

def extract_features(data: RideData) -> dict:
    speeds = data.speed
    accels = data.acceleration

    max_speed        = max(speeds, default=0.0)
    harsh_brakes     = sum(1 for a in accels if a < -2.5)
    aggressive_accel = sum(1 for a in accels if a > 2.5)
    overspeed_count  = sum(1 for s in speeds if s > 80)
    min_decel        = min(accels, default=0.0)

    jerk_vals = [abs(accels[i] - accels[i - 1]) for i in range(1, len(accels))]
    avg_jerk  = sum(jerk_vals) / len(jerk_vals) if jerk_vals else 0.0

    return {
        "max_speed":        max_speed,
        "harsh_brakes":     harsh_brakes,
        "aggressive_accel": aggressive_accel,
        "overspeed_count":  overspeed_count,
        "avg_jerk":         round(avg_jerk, 3),
        "min_decel":        min_decel,
    }


def compute_raw_risk(features: dict) -> float:
    """
    Rule-based risk scorer.
    ── ML HOOK ────────────────────────────────────────────────────
    To plug in a trained model, replace this function body with:

        import joblib
        model = joblib.load("models/risk_classifier.pkl")
        X = [[
            features["max_speed"],
            features["harsh_brakes"],
            features["aggressive_accel"],
            features["avg_jerk"],
            features["overspeed_count"],
        ]]
        return float(model.predict_proba(X)[0][1]) * 100
    ────────────────────────────────────────────────────────────────
    """
    risk  = (features["max_speed"] / 120) * 30
    risk += features["harsh_brakes"] * 8
    risk += features["aggressive_accel"] * 5
    risk += min(features["avg_jerk"] * 8, 20)
    risk += features["overspeed_count"] * 3
    return min(risk, 100.0)


def score_ride(data: RideData) -> ScoreResponse:
    features = extract_features(data)

    road_factor    = ROAD_FACTORS.get(data.road_type, 1.2)
    weather_factor = WEATHER_FACTORS.get(data.weather, 1.0)
    context_factor = round(road_factor * weather_factor, 2)

    raw_risk    = compute_raw_risk(features)
    risk_score  = min(raw_risk * context_factor, 100.0)
    final_score = max(0, round(100 - risk_score))

    road_label    = ROAD_LABELS.get(data.road_type,   data.road_type.title())
    weather_label = WEATHER_LABELS.get(data.weather, data.weather.title())

    # Badge
    if final_score >= 80:
        risk_level = "Safe"
        badge = BadgeInfo(label="🛡 Safe Rider", cls="safe")
    elif final_score >= 50:
        risk_level = "Moderate"
        badge = BadgeInfo(label="⚡ Developing Rider", cls="moderate")
    else:
        risk_level = "Risky"
        badge = BadgeInfo(label="⚠ Risky Rider", cls="risky")

    # Alerts
    alerts: list[AlertItem] = []
    if features["harsh_brakes"] > 0:
        alerts.append(AlertItem(
            type="danger",
            msg=f"Harsh braking detected ({features['harsh_brakes']} events)",
            time="Multiple timestamps",
        ))
    if features["overspeed_count"] > 0:
        alerts.append(AlertItem(
            type="warn",
            msg=f"Overspeeding in {road_label} zone",
            time="Exceeded 80 km/h",
        ))
    if features["aggressive_accel"] > 0:
        alerts.append(AlertItem(
            type="warn",
            msg=f"Aggressive acceleration ({features['aggressive_accel']} events)",
            time="Multiple timestamps",
        ))
    if features["min_decel"] < -4.0:
        alerts.append(AlertItem(
            type="danger",
            msg=f"Crash risk: sudden deceleration ({features['min_decel']:.1f} m/s²)",
            time="Critical event",
        ))
    if data.weather != "clear":
        alerts.append(AlertItem(
            type="warn",
            msg=f"{weather_label} conditions increase risk ×{weather_factor}",
            time="Entire ride",
        ))
    if not alerts:
        alerts.append(AlertItem(
            type="ok",
            msg="No significant events — excellent ride!",
            time="All clear",
        ))

    # Insights
    insights: list[InsightItem] = []
    if features["harsh_brakes"] > 2:
        insights.append(InsightItem(cls="neg",  text="You brake too aggressively. Increase following distance."))
    elif features["harsh_brakes"] > 0:
        insights.append(InsightItem(cls="warn", text="Occasional hard braking. Try anticipating stops earlier."))
    if features["overspeed_count"] > 3:
        insights.append(InsightItem(cls="neg",  text="Frequent overspeeding. Stay within context speed limits."))
    if features["aggressive_accel"] > 2:
        insights.append(InsightItem(cls="warn", text="Throttle control needs improvement — ease into acceleration."))
    if data.weather != "clear":
        insights.append(InsightItem(cls="warn", text=f"{weather_label} conditions: slow down and increase braking distance."))
    if final_score >= 80:
        insights.append(InsightItem(cls="pos",  text="Excellent smooth control throughout the ride. Keep it up!"))
    if not insights:
        insights.append(InsightItem(cls="pos",  text="Smooth, context-aware riding. You are a model rider!"))

    return ScoreResponse(
        final_score=final_score,
        risk_score=round(risk_score, 2),
        risk_level=risk_level,
        context_factor=context_factor,
        max_speed=features["max_speed"],
        harsh_brake_count=features["harsh_brakes"],
        aggressive_accel_count=features["aggressive_accel"],
        avg_jerk=features["avg_jerk"],
        overspeed_count=features["overspeed_count"],
        alerts=alerts,
        insights=insights,
        badge=badge,
    )


# ─── Routes ───────────────────────────────────────────────────────────────────

@app.post("/analyze", response_model=ScoreResponse)
def analyze_ride(data: RideData) -> ScoreResponse:
    """Analyze ride telemetry and return a CARS score."""
    return score_ride(data)


@app.get("/sample-data")
def get_sample_data(
    scenario: Annotated[str, Query(description="safe | moderate | risky")] = "moderate",
) -> dict:
    """Return a pre-built simulated ride dataset."""
    return SAMPLE_DATASETS.get(scenario, SAMPLE_DATASETS["moderate"])


@app.get("/insights")
def get_insights() -> dict:
    """Return general AI-based riding safety tips and context guide."""
    return {
        "tips": [
            "Maintain a 3-second following distance in city conditions.",
            "In rain, braking distance doubles — slow down by 30%.",
            "Avoid sudden lane changes at speeds above 60 km/h.",
            "Aggressive acceleration in traffic increases crash risk by 40%.",
            "Fog reduces visibility — use low beam lights and slow down.",
            "Highway riding scores lower risk due to a 0.8× context factor.",
        ],
        "context_guide": {
            road: f"{ROAD_LABELS[road]} — factor ×{ROAD_FACTORS[road]}"
            for road in ROAD_FACTORS
        } | {
            weather: f"{WEATHER_LABELS[weather]} — factor ×{WEATHER_FACTORS[weather]}"
            for weather in WEATHER_FACTORS
        },
    }


@app.get("/health")
def health() -> dict:
    """Health check endpoint."""
    return {"status": "ok", "service": "CARS API v1.0"}
