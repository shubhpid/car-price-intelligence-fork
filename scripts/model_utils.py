"""
model_utils.py
Shared feature engineering + SHAP explanation utilities.

Imported by:
  - notebooks/car_price_model.ipynb  (validation / sanity check)
  - backend/                         (FastAPI /predict and /explain endpoints)

Artefacts expected at:  car-price-intelligence/models/
  car_price_model.pkl
  feature_meta.pkl
  shap_data.pkl          (optional — built lazily if missing)
"""

from __future__ import annotations

import numpy as np
import pandas as pd
import joblib
from pathlib import Path

# ── Paths ─────────────────────────────────────────────────────────────────────
_MODELS_DIR = Path(__file__).parent.parent / "models"

LUXURY_MAKES = {
    "bmw", "mercedes-benz", "audi", "lexus", "porsche", "cadillac",
    "lincoln", "infiniti", "acura", "volvo", "land rover", "jaguar", "genesis",
}

CAT_COLS = [
    "make", "model", "condition", "fuel", "transmission",
    "drive", "type", "state", "region", "paint_color",
    "title_status", "cylinders",
]

FEATURE_COLS = [
    "car_age", "log_odometer", "mileage_per_year", "is_luxury", "month",
    "make", "model", "condition", "fuel", "transmission", "drive",
    "type", "state", "region", "paint_color", "title_status", "cylinders",
    "lat", "long",
]

# ── Lazy-loaded singletons ────────────────────────────────────────────────────
_model        = None
_explainer    = None
_feature_meta = None


def _load_artifacts() -> None:
    global _model, _explainer, _feature_meta
    if _model is not None:
        return
    _model        = joblib.load(_MODELS_DIR / "car_price_model.pkl")
    _feature_meta = joblib.load(_MODELS_DIR / "feature_meta.pkl")
    shap_path     = _MODELS_DIR / "shap_data.pkl"
    if shap_path.exists():
        shap_data  = joblib.load(shap_path)
        _explainer = shap_data.get("explainer")


# ── Feature engineering ───────────────────────────────────────────────────────
def engineer_features(
    df: pd.DataFrame,
    cat_codes: dict | None = None,
    lat_median: float = 37.0,
    long_median: float = -95.0,
) -> tuple[pd.DataFrame, list[str]]:
    """
    Build the model feature matrix from a raw / cleaned DataFrame row(s).

    Parameters
    ----------
    df        : DataFrame with raw columns (make, year, odometer, …)
    cat_codes : Saved mapping {col: {label: int_code}} from feature_meta.pkl.
                Pass None only during training (fits new codes).
    lat_median, long_median : Fallback fill values for missing geo columns.

    Returns
    -------
    X             : DataFrame of engineered features (model-ready)
    feature_names : Ordered list of column names matching X
    """
    d = df.copy()

    # Numeric coercion
    for col in ("year", "odometer", "lat", "long"):
        if col in d.columns:
            d[col] = pd.to_numeric(d[col], errors="coerce")

    d["car_age"]          = (2024 - d.get("year", 2014)).clip(0, 50).fillna(10)
    d["log_odometer"]     = np.log1p(d.get("odometer", pd.Series(0, index=d.index)).fillna(0))
    d["mileage_per_year"] = (
        d.get("odometer", pd.Series(0, index=d.index)).fillna(0)
        / d["car_age"].replace(0, 1)
    )
    d["is_luxury"] = d.get("make", "").str.lower().isin(LUXURY_MAKES).astype(int)

    if "month" in d.columns:
        d["month"] = d["month"].fillna(6).astype(int)
    elif "posting_date" in d.columns:
        d["month"] = pd.to_datetime(d["posting_date"], errors="coerce", utc=True).dt.month.fillna(6).astype(int)
    else:
        d["month"] = 6

    d["lat"]  = d.get("lat",  pd.Series(lat_median,  index=d.index)).fillna(lat_median)
    d["long"] = d.get("long", pd.Series(long_median, index=d.index)).fillna(long_median)

    for col in CAT_COLS:
        if col not in d.columns:
            d[col] = -1
            continue
        d[col] = d[col].fillna("unknown").astype(str).str.lower().str.strip()
        if cat_codes and col in cat_codes:
            d[col] = d[col].map(cat_codes[col]).fillna(-1).astype(int)
        else:
            d[col] = d[col].astype("category").cat.codes

    available = [c for c in FEATURE_COLS if c in d.columns]
    return d[available], available


# ── Predict ───────────────────────────────────────────────────────────────────
def predict_price(row_dict: dict) -> float:
    """
    Predict price (original $) for a single listing dict.
    Returns predicted price as a float.
    """
    _load_artifacts()
    df = pd.DataFrame([row_dict])
    X, _ = engineer_features(
        df,
        cat_codes   = _feature_meta["cat_codes"],
        lat_median  = _feature_meta.get("lat_median",  37.0),
        long_median = _feature_meta.get("long_median", -95.0),
    )
    log_price = _model.predict(X)[0]
    return float(np.expm1(log_price))


# ── Explain ───────────────────────────────────────────────────────────────────
def explain_prediction(row_dict: dict) -> list[dict]:
    """
    Return top-3 SHAP contributors for a single listing.

    Parameters
    ----------
    row_dict : Raw car listing dict (same keys as cleaned_cars.csv columns)

    Returns
    -------
    List of 3 dicts:
        {
          "feature":   str,   # feature name
          "value":     float, # encoded feature value
          "impact":    float, # |SHAP value| — magnitude of price effect (log scale)
          "direction": str,   # "increases price" | "decreases price"
        }
    """
    import shap as _shap

    _load_artifacts()

    df = pd.DataFrame([row_dict])
    X, feature_names = engineer_features(
        df,
        cat_codes   = _feature_meta["cat_codes"],
        lat_median  = _feature_meta.get("lat_median",  37.0),
        long_median = _feature_meta.get("long_median", -95.0),
    )

    # Build explainer lazily if shap_data.pkl was not found
    global _explainer
    if _explainer is None:
        _explainer = _shap.TreeExplainer(_model)

    sv = _explainer.shap_values(X)[0]          # shape: (n_features,)
    top3 = np.argsort(np.abs(sv))[::-1][:3]

    return [
        {
            "feature":   feature_names[i],
            "value":     float(X.iloc[0, i]),
            "impact":    round(float(abs(sv[i])), 4),
            "direction": "increases price" if sv[i] > 0 else "decreases price",
        }
        for i in top3
    ]
