# car-price-intelligence

Data-driven car price intelligence platform that tracks market trends and predicts the optimal time to buy or wait based on expected price movements.

---

## Project Structure

```
car-price-intelligence/
│
├── Data/                        # Raw & cleaned datasets (git-ignored, stored in Drive)
│   ├── vehicles.csv             # Raw Craigslist used cars (~426k rows, 26 cols)
│   └── cleaned_cars.csv         # Output of cleaning pipeline
│
├── Cleaning/
│   └── craigslist_cleaning.ipynb  # Colab T4 data-cleaning notebook
│
├── notebooks/
│   └── car_price_model.ipynb    # Colab T4 — feature eng + XGBoost + SHAP
│
├── models/                      # Trained artefacts (git-ignored, download from Colab)
│   ├── car_price_model.pkl      # XGBoost regressor
│   ├── feature_meta.pkl         # cat_codes + feature_names + geo medians
│   ├── shap_data.pkl            # TreeExplainer + 500-row sample
│   └── shap_summary.png         # SHAP bar chart
│
├── scripts/
│   ├── mongo_ingest.py          # Ingest cleaned_cars.csv → MongoDB Atlas
│   └── model_utils.py           # Shared feature eng + predict + explain_prediction()
│
├── docs/
│   └── mongo_setup.md           # Step-by-step Atlas + .env setup guide
│
├── backend/
│   ├── agent.py                 # Tool-calling agent: GPT-4o-mini + 5 tools → BUY/WAIT/NEUTRAL
│   └── main.py                  # FastAPI: /api/cars /api/predict /api/market-overview /api/shap-importance
│
├── frontend/                    # React + Vite + Tailwind + Recharts
│   ├── src/
│   │   ├── App.jsx              # Tab nav + AppContext (cross-tab car selection)
│   │   ├── api.js               # axios wrappers
│   │   └── components/
│   │       ├── AnalyzeTab.jsx   # Car form → agent call → recommendation + chart + SHAP
│   │       ├── MarketOverview.jsx # Metric cards + Best Buys table + seasonality chart
│   │       └── HowItWorks.jsx   # Pipeline diagram + SHAP chart + model card + sources
│   └── package.json
└── .env                         # Local secrets — never committed
```

---

## Task Log

> Tasks are listed in order. Check off each item as it is completed.

---

### Phase 1 — Data Acquisition & Cleaning

| # | Status | Task | Output | Notes |
|---|--------|------|--------|-------|
| 1.1 | ✅ Done | Identify raw dataset | `Data/vehicles.csv` | Craigslist used cars, 426 881 rows × 26 cols |
| 1.2 | ✅ Done | Write Colab data-cleaning notebook | `Cleaning/craigslist_cleaning.ipynb` | T4-compatible; steps below |
| 1.3 | ✅ Done | Ingest cleaned data into MongoDB Atlas | `scripts/mongo_ingest.py` | 328,209 listings · 61,721 snapshots · 175 MB / 512 MB used; see `docs/mongo_setup.md` |

#### Cleaning notebook steps (`craigslist_cleaning.ipynb`)

| Step | Status | Description |
|------|--------|-------------|
| 1 | ✅ Done | Drop rows where `price < 500` or `price > 150 000` |
| 2 | ✅ Done | Drop rows where `odometer > 300 000` |
| 3 | ✅ Done | Parse `posting_date` → `year_month`, `month`, `day_of_week` |
| 4 | ✅ Done | Keep only top-20 makes by listing count |
| 5 | ✅ Done | Add `price_per_mile = price / odometer` (NaN on div-by-zero) |
| 6 | ✅ Done | Print shape + `.describe()` after every step |
| 7 | ✅ Done | Save `cleaned_cars.csv` to Drive + browser download |

---

### Phase 2 — Exploratory Data Analysis

| # | Status | Task | Output | Notes |
|---|--------|------|--------|-------|
| 2.1 | ⬜ Todo | Price distribution by make | chart | histogram / box plot |
| 2.2 | ⬜ Todo | Price vs odometer scatter | chart | colour by make |
| 2.3 | ⬜ Todo | Listing volume over time | chart | `year_month` time-series |
| 2.4 | ⬜ Todo | Regional price heatmap | chart | by `state` / `lat`+`long` |
| 2.5 | ⬜ Todo | Correlation matrix | chart | numeric features |

---

### Phase 3 — Feature Engineering

| # | Status | Task | Output | Notes |
|---|--------|------|--------|-------|
| 3.1 | ⬜ Todo | Encode categorical columns | feature set | `condition`, `fuel`, `transmission`, `drive` |
| 3.2 | ⬜ Todo | Handle remaining nulls / imputation | feature set | strategy TBD |
| 3.3 | ⬜ Todo | Create age feature (`listing_year - year`) | feature set | car age in years |
| 3.4 | ⬜ Todo | Scale / normalise numeric features | feature set | StandardScaler or MinMax |

---

### Phase 4 — Modelling

| # | Status | Task | Output | Notes |
|---|--------|------|--------|-------|
| 4.1 | ✅ Done | Feature engineering | `notebooks/car_price_model.ipynb` Cell 1 | car_age, log_odometer, mileage_per_year, is_luxury, category codes; time-based 80/20 split |
| 4.2 | ✅ Done | Train XGBoost regressor (T4 GPU) | `models/car_price_model.pkl` | n_estimators=500, lr=0.05, depth=6, early stopping |
| 4.3 | ✅ Done | Evaluate on original $ scale | metrics | MAE / RMSE / MAPE printed in notebook |
| 4.4 | ✅ Done | SHAP analysis + explain_prediction() | `models/shap_data.pkl` · `shap_summary.png` | Top-3 contributors per listing; imported by FastAPI |
| 4.5 | ✅ Done | Shared model utilities | `scripts/model_utils.py` | predict_price() + explain_prediction() for backend |
| 4.6 | ⬜ Todo | Build "buy now vs wait" signal | signal logic | price trend + model residuals |

---

### Phase 5 — Backend

| # | Status | Task | Output | Notes |
|---|--------|------|--------|-------|
| 5.1 | ✅ Done | Tool-calling analyst agent | `backend/agent.py` | GPT-4o-mini · 5 tools · BUY/WAIT/NEUTRAL rules |
| 5.2 | ✅ Done | FastAPI app | `backend/main.py` | /api/cars · /api/predict · /api/market-overview · /api/shap-importance |
| 5.3 | ⬜ Todo | Unit tests | `backend/tests/` | pytest |

---

### Phase 6 — Frontend (React)

| # | Status | Task | Output | Notes |
|---|--------|------|--------|-------|
| 6.1 | ✅ Done | Scaffold Vite + React + Tailwind + Recharts | `frontend/` | Vite proxy → :8000 |
| 6.2 | ✅ Done | Analyze tab | `AnalyzeTab.jsx` | Cascade dropdowns · agent call · SHAP bullets · chart · reasoning steps |
| 6.3 | ✅ Done | Market Overview tab | `MarketOverview.jsx` | Metric cards · Best Buys table · seasonality heatmap |
| 6.4 | ✅ Done | How It Works tab | `HowItWorks.jsx` | Pipeline diagram · SHAP chart · model card · data sources |
| 6.5 | ✅ Done | Cross-tab context | `AppContext` | Click Best Buy row → auto-loads Analyze tab |
| 6.6 | ⬜ Todo | Deploy (Vercel / Netlify) | live URL | — |

---

### Phase 7 — Deployment & DevOps

| # | Status | Task | Output | Notes |
|---|--------|------|--------|-------|
| 7.1 | ⬜ Todo | Dockerise backend | `Dockerfile` | — |
| 7.2 | ⬜ Todo | CI pipeline | `.github/workflows/` | lint + test on PR |
| 7.3 | ⬜ Todo | Deploy backend (Render / Railway / EC2) | live URL | — |
| 7.4 | ⬜ Todo | Environment / secrets management | `.env.example` | — |

---

## Status Key

| Symbol | Meaning |
|--------|---------|
| ✅ Done | Completed and verified |
| 🔄 In Progress | Actively being worked on |
| ⬜ Todo | Not started |
| ❌ Blocked | Waiting on dependency or decision |

---

## Quick-Start (local dev)

```bash
git clone <repo-url>
cd car-price-intelligence

# 1 — Backend
pip install fastapi uvicorn motor pymongo python-dotenv openai prophet xgboost shap joblib scikit-learn pandas numpy
uvicorn backend.main:app --reload --port 8000

# 2 — Frontend (new terminal)
cd frontend
npm install
npm run dev        # → http://localhost:5173
```

Add `.env` to project root:
```
MONGO_URI=mongodb+srv://...
OPENAI_API_KEY=sk-...
```

---

*Last updated: 2026-02-21 — Phase 1 ✅ · Phase 4 ✅ · Phase 5 ✅ · Phase 6 ✅ (full stack)*
