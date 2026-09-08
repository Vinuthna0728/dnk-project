from __future__ import annotations

import json
import math
from pathlib import Path
from typing import Any


DATA_PATH = (
    Path(__file__).resolve().parents[3]
    / "data"
    / "dnk_centers_india.json"
)

EARTH_RADIUS_KM = 6371.0088


def _load_centers() -> list[dict[str, Any]]:
    """Load DNK/Sub-PO records from the project dataset."""
    if not DATA_PATH.exists():
        raise FileNotFoundError(
            f"DNK center dataset not found: {DATA_PATH}"
        )

    with DATA_PATH.open("r", encoding="utf-8") as file:
        data = json.load(file)

    if not isinstance(data, list):
        raise ValueError("DNK center dataset must contain a JSON list.")

    return data


def _haversine_distance_km(
    latitude_1: float,
    longitude_1: float,
    latitude_2: float,
    longitude_2: float,
) -> float:
    """Return great-circle distance between two coordinates in kilometres."""
    lat1 = math.radians(latitude_1)
    lon1 = math.radians(longitude_1)
    lat2 = math.radians(latitude_2)
    lon2 = math.radians(longitude_2)

    delta_lat = lat2 - lat1
    delta_lon = lon2 - lon1

    a = (
        math.sin(delta_lat / 2) ** 2
        + math.cos(lat1)
        * math.cos(lat2)
        * math.sin(delta_lon / 2) ** 2
    )

    c = 2 * math.atan2(
        math.sqrt(a),
        math.sqrt(1 - a),
    )

    return EARTH_RADIUS_KM * c


def find_nearest_dnk_centers(
    latitude: float,
    longitude: float,
    limit: int = 5,
) -> list[dict[str, Any]]:
    """
    Return the nearest DNK/Sub-PO facilities to a coordinate.

    The result is sorted by Haversine distance and limited to the
    requested number of facilities.
    """
    if not -90 <= latitude <= 90:
        raise ValueError("Latitude must be between -90 and 90.")

    if not -180 <= longitude <= 180:
        raise ValueError("Longitude must be between -180 and 180.")

    if limit <= 0:
        raise ValueError("Limit must be greater than zero.")

    centers = _load_centers()
    results: list[dict[str, Any]] = []

    for center in centers:
        distance_km = _haversine_distance_km(
            latitude,
            longitude,
            float(center["latitude"]),
            float(center["longitude"]),
        )

        results.append(
            {
                **center,
                "distance_km": round(distance_km, 2),
            }
        )

    results.sort(key=lambda item: item["distance_km"])

    return results[:limit]
