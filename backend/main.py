"""
main.py — FastAPI backend for Car Price Intelligence
Endpoints: /health  /api/cars  /api/predict  /api/market-overview  /api/shap-importance
"""
import os, sys, asyncio, hashlib, json
from datetime import datetime, timezone, timedelta
from pathlib import Path

import joblib, numpy as np
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

_ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(_ROOT))
from backend.agent import run_agent

load_dotenv(_ROOT / ".env")

app = FastAPI(title="Car Price Intelligence API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

_db   = AsyncIOMotorClient(os.environ["MONGO_URI"])["carmarket"]
_shap = joblib.load(_ROOT / "models" / "shap_data.pkl") if (_ROOT / "models" / "shap_data.pkl").exists() else None


def _clean(obj):
    """Strip MongoDB internals and make JSON-safe."""
    return json.loads(json.dumps(obj, default=str, skipkeys=False)
                      .replace('"_id":', '"__id_skip":')  )  # ObjectId gone via default=str

def _safe(doc: dict) -> dict:
    doc.pop("_id", None); doc.pop("expires_at", None); doc.pop("cache_key", None)
    return json.loads(json.dumps(doc, default=str))


# ── Health ─────────────────────────────────────────────────────────────────────
@app.get("/health")
async def health():
    await _db.command("ping")
    return {"status": "ok", "db": "connected"}


# ── Cars catalogue ─────────────────────────────────────────────────────────────
@app.get("/api/cars")
async def cars():
    pipeline = [
        {"$group": {"_id": {"make": "$make", "model": "$model", "year": "$year"}}},
        {"$project": {"_id": 0, "make": "$_id.make", "model": "$_id.model", "year": "$_id.year"}},
        {"$sort": {"make": 1, "model": 1, "year": -1}},
    ]
    return await _db["listings"].aggregate(pipeline).to_list(5000)


# ── Predict / analyse ──────────────────────────────────────────────────────────
@app.get("/api/predict")
async def predict(
    make: str, model: str, year: int,
    mileage: int = 50000, condition: str = "good", region: str = "california",
):
    key = hashlib.md5(f"{make}{model}{year}{mileage}{condition}{region}".encode()).hexdigest()
    cached = await _db["predictions_cache"].find_one({"cache_key": key})
    if cached:
        return _safe(cached)

    query = f"Should I buy a {year} {make} {model} with {mileage:,} miles in {condition} condition in {region}?"
    result = await asyncio.to_thread(run_agent, query)

    doc = {**result, "cache_key": key, "expires_at": datetime.now(timezone.utc) + timedelta(hours=1)}
    await _db["predictions_cache"].insert_one(doc)
    return _safe(doc)


# ── Market overview ────────────────────────────────────────────────────────────
@app.get("/api/market-overview")
async def market_overview():
    recent = await _db["price_snapshots"].find(
        {}, {"_id": 0, "year_month": 1, "avg_price": 1}
    ).sort("year_month", -1).limit(2).to_list(2)

    avg_now  = recent[0]["avg_price"] if recent else 0
    avg_prev = recent[1]["avg_price"] if len(recent) > 1 else avg_now
    mom_pct  = round((avg_now - avg_prev) / avg_prev * 100, 2) if avg_prev else 0

    top_buys = await _db["predictions_cache"].find(
        {"recommendation": "BUY"},
        {"_id": 0, "cache_key": 0, "expires_at": 0, "tool_outputs": 0},
    ).sort("predicted_price", 1).limit(5).to_list(5)

    season_pipeline = [
        {"$project": {"month": {"$toInt": {"$substr": ["$year_month", 5, 2]}}, "avg_price": 1}},
        {"$group": {"_id": "$month", "avg_price": {"$avg": "$avg_price"}}},
        {"$sort": {"_id": 1}},
    ]
    season = await _db["price_snapshots"].aggregate(season_pipeline).to_list(12)

    return {
        "avg_price_this_month": round(avg_now, 2),
        "mom_change_pct":       mom_pct,
        "top_buys":             [_safe(b) for b in top_buys],
        "seasonality_data":     [{"month": s["_id"], "avg_price": round(s["avg_price"], 2)} for s in season],
        "updated_at":           recent[0].get("year_month", "N/A") if recent else "N/A",
    }


# ── SHAP global importance ─────────────────────────────────────────────────────
@app.get("/api/shap-importance")
async def shap_importance():
    if not _shap:
        return {"features": []}
    sv, cols = _shap["shap_values"], list(_shap["X_test_sample"].columns)
    mean_abs, mean_dir = np.abs(sv).mean(axis=0), sv.mean(axis=0)
    features = sorted(
        [{"feature": n, "importance": round(float(v), 4),
          "direction": "positive" if float(d) > 0 else "negative"}
         for n, v, d in zip(cols, mean_abs, mean_dir)],
        key=lambda x: x["importance"], reverse=True,
    )[:10]
    return {"features": features}
