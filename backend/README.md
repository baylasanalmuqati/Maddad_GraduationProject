# Maddad Backend

FastAPI backend that provides authentication, profile management, ASD questionnaire assessment, and ML-powered risk prediction for the Maddad platform.

---

## Quick Start (local development)

### 1. Prerequisites

- Python 3.11+
- A running PostgreSQL instance (local or cloud)

### 2. Install dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 3. Configure environment variables

```bash
cp .env.example .env
# Edit .env with your database URL and secret key
```

### 4. Create the database schema

```bash
# Connect to your PostgreSQL instance and run:
psql -U postgres -d maddad -f ../database/schema.sql
```

### 5. Train the ML model

This only needs to be done once (or whenever you want to retrain):

```bash
cd backend
python -m app.ml.train
```

This generates `app/ml/model.pkl` – an XGBoost classifier (multi:softprob objective) trained on synthetic data derived from the rule-based `classifyRisk()` function. Once real user data accumulates in the `questionnaire_results` table you can retrain on real assessments for improved accuracy.

### 6. Start the API server

```bash
cd backend
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`.  
Interactive docs: `http://localhost:8000/docs`

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Parent signup |
| `POST` | `/api/auth/login` | Login (returns JWT) |
| `POST` | `/api/auth/logout` | Logout (client deletes token) |
| `GET`  | `/api/profile` | Get current user's profile |
| `PUT`  | `/api/profile` | Update profile |
| `POST` | `/api/questionnaire/submit` | Submit 10-question assessment → ML prediction |
| `GET`  | `/api/questionnaire/history` | Past assessments |
| `POST` | `/api/followup/submit` | Submit follow-up answers → refined prediction |

All protected endpoints require an `Authorization: Bearer <token>` header.

---

## Deployment

### Render / Railway / Fly.io

1. Set the environment variables in the platform's dashboard (same keys as `.env.example`).
2. Use the `Procfile` to start the server: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
3. Run the schema migration and ML training as one-off commands before the first deploy.

### Frontend configuration

Set `MADDAD_API_BASE` in `pages/api.js` to your deployed API URL, e.g.:
```
https://maddad-api.onrender.com
```

---

## ML Model

The current model is an **XGBoost classifier** (`multi:softprob` objective, 200 estimators) trained on synthetic data.

**Features (12):**
- Age group (encoded 1–4)
- Gender (0 = ذكر, 1 = أنثى)
- 10 skill answers (0 or 1 each)

**Target (3 classes):** `low` / `medium` / `high`

**Retraining on real data:**

Once you have real user submissions in the database, export them and retrain:

```python
# In app/ml/train.py, add a function that reads from the DB instead of
# generating synthetic data, then call train_and_save() as before.
```
