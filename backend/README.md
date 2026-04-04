# Maddad Backend

FastAPI backend for the Maddad ASD-screening platform.  
Uses **SQLite** by default — no database installation needed; everything is stored in a single file (`maddad.db`) that is created automatically the first time you start the server.

---

## How to run (step by step)

### Step 1 — Make sure Python is installed

Open a terminal / command prompt and type:

```
python --version
```

You should see `Python 3.11` or higher.  
If Python is not installed, download it from <https://www.python.org/downloads/> and install it.

---

### Step 2 — Open a terminal inside the `backend` folder

```
cd path/to/Maddad_GraduationProject/backend
```

Replace `path/to/Maddad_GraduationProject` with the actual location on your computer.

---

### Step 3 — (Recommended) Create a virtual environment

This keeps the project's packages isolated from the rest of your system.

```
python -m venv venv
```

Then activate it:

- **Windows:**  `venv\Scripts\activate`
- **Mac / Linux:**  `source venv/bin/activate`

You will see `(venv)` at the start of your terminal prompt when it is active.

---

### Step 4 — Install the required packages

```
pip install -r requirements.txt
```

This downloads all the libraries the backend needs.  
It only needs to be done once (or again if `requirements.txt` changes).

---

### Step 5 — Create the environment file

```
cp .env.example .env        # Mac / Linux
copy .env.example .env      # Windows
```

Open `.env` in any text editor.  
The default settings work out of the box — you do **not** need to change anything to run locally.

---

### Step 6 — Start the server

```
uvicorn app.main:app --reload
```

The first time this runs, it automatically creates `maddad.db` in the `backend` folder and sets up all the database tables. **You do not need to run any SQL scripts.**

You should see output like:

```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
```

---

### Step 7 — Check that it works

Open your browser and go to:

```
http://localhost:8000/health
```

You should see: `{"status": "ok"}`

To explore all API endpoints interactively, go to:

```
http://localhost:8000/docs
```

---

### Step 8 — Open the frontend

Open `index.html` (in the root of the project, **not** inside `backend`) in your browser.  
The frontend will automatically talk to the backend at `http://localhost:8000`.

---

## Stopping the server

Press **Ctrl + C** in the terminal where the server is running.

---

## Where is the database?

The database is stored in `backend/maddad.db`.  
It is a plain file — you can copy it, delete it, or open it with [DB Browser for SQLite](https://sqlitebrowser.org/) to inspect the data.

Deleting `maddad.db` and restarting the server will give you a fresh, empty database.

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Parent signup |
| `POST` | `/api/auth/login` | Login (returns JWT token) |
| `POST` | `/api/auth/logout` | Logout (clears client token) |
| `GET`  | `/api/profile` | Get current user's profile |
| `PUT`  | `/api/profile` | Update profile |
| `POST` | `/api/questionnaire/submit` | Submit 10-question assessment → ML prediction |
| `GET`  | `/api/questionnaire/history` | Past assessments for current user |
| `POST` | `/api/followup/submit` | Submit follow-up answers → refined prediction |

All protected endpoints require an `Authorization: Bearer <token>` header.  
The token is returned by `/api/auth/register` and `/api/auth/login`.

---

## ML Model

The risk prediction uses a pre-trained **XGBoost** model (`app/ml/model.pkl`).  
It classifies ASD screening results into three levels: `low` / `medium` / `high`.

---

## Switching to PostgreSQL

If you later want to use PostgreSQL instead of SQLite:

1. Install and start PostgreSQL.
2. Create a database (e.g. `maddad`).
3. In your `.env` file, change `DATABASE_URL` to:
   ```
   DATABASE_URL=postgresql://postgres:your_password@localhost:5432/maddad
   ```
4. Restart the server — tables are created automatically on startup.

