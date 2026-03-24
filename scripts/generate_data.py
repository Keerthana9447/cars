"""
CARS - Synthetic Ride Data Generator
Generates a Kaggle-style CSV dataset for testing and ML training.
"""

import csv
import random
import math
import os
from datetime import datetime, timedelta

ROAD_TYPES = ["highway", "city", "traffic"]
WEATHER_CONDITIONS = ["clear", "rain", "fog"]

SPEED_LIMITS = {"highway": 100, "city": 60, "traffic": 40}
SCENARIOS = ["safe", "moderate", "risky"]


def generate_ride(ride_id: int, duration_seconds: int = 60, seed: int = None):
    if seed is not None:
        random.seed(seed)

    road_type = random.choice(ROAD_TYPES)
    weather = random.choice(WEATHER_CONDITIONS)
    scenario = random.choice(SCENARIOS)
    speed_limit = SPEED_LIMITS[road_type]

    rows = []
    start_time = datetime.now() - timedelta(hours=random.randint(0, 48))
    speed = random.uniform(10, 30)
    acceleration = 0.0

    for t in range(duration_seconds):
        # Simulate rider behavior based on scenario
        if scenario == "safe":
            target_speed = random.uniform(speed_limit * 0.6, speed_limit * 0.85)
            max_accel = 1.5
            brake_prob = 0.05
        elif scenario == "moderate":
            target_speed = random.uniform(speed_limit * 0.7, speed_limit * 1.05)
            max_accel = 2.5
            brake_prob = 0.12
        else:  # risky
            target_speed = random.uniform(speed_limit * 0.9, speed_limit * 1.4)
            max_accel = 3.5
            brake_prob = 0.2

        # Random braking events
        if random.random() < brake_prob:
            acceleration = -random.uniform(2.0, 5.5)
        else:
            diff = target_speed - speed
            acceleration = max(-max_accel, min(max_accel, diff * 0.15 + random.gauss(0, 0.3)))

        speed = max(0, speed + acceleration)
        brake_intensity = abs(acceleration) if acceleration < 0 else 0
        brake_binary = 1 if brake_intensity > 1.0 else 0

        rows.append({
            "ride_id": ride_id,
            "timestamp": (start_time + timedelta(seconds=t)).strftime("%Y-%m-%d %H:%M:%S"),
            "speed_kmh": round(speed, 2),
            "acceleration_ms2": round(acceleration, 3),
            "brake_binary": brake_binary,
            "brake_intensity": round(brake_intensity, 3),
            "road_type": road_type,
            "weather": weather,
            "scenario_label": scenario,
        })

    return rows


def generate_dataset(num_rides: int = 50, output_path: str = "ride_data.csv"):
    all_rows = []
    for i in range(1, num_rides + 1):
        ride_rows = generate_ride(ride_id=i, duration_seconds=random.randint(30, 90))
        all_rows.extend(ride_rows)

    fieldnames = ["ride_id", "timestamp", "speed_kmh", "acceleration_ms2",
                  "brake_binary", "brake_intensity", "road_type", "weather", "scenario_label"]

    with open(output_path, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(all_rows)

    print(f"Generated {len(all_rows)} rows across {num_rides} rides → {output_path}")
    return output_path


if __name__ == "__main__":
    os.makedirs("data", exist_ok=True)
    generate_dataset(num_rides=100, output_path="data/ride_data.csv")
