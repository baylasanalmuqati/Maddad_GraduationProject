from app.ml.predictor import ml_assets_ready, validate_ml_assets
from app.models import QuestionnaireResult


def _register(client, email="parent@example.com"):
    payload = {
        "email": email,
        "password": "StrongPass1!",
        "child_name": "طفل",
        "child_age": "19-24",
        "child_gender": "ذكر",
    }
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 201
    return response.json()["access_token"]


def _answers():
    return {
        "response_to_name": 1,
        "eye_contact": 1,
        "social_smile": 0,
        "imitation": 0,
        "discrimination": 1,
        "pointing_with_finger": 0,
        "facial_expressions": 0,
        "joint_attention": 1,
        "play_skills": 1,
        "response_to_commands": 0,
    }


def test_auth_register_and_login(client):
    _register(client, email="auth@example.com")
    login = client.post(
        "/api/auth/login",
        json={"email": "auth@example.com", "password": "StrongPass1!"},
    )
    assert login.status_code == 200
    body = login.json()
    assert body["access_token"]
    assert body["email"] == "auth@example.com"


def test_questionnaire_normalizes_risk_and_persists(client, db_session, monkeypatch):
    token = _register(client, email="q@example.com")
    monkeypatch.setattr("app.routers.questionnaire.predict", lambda *_: ("High", 0.93))

    response = client.post(
        "/api/questionnaire/submit",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "age_group": "19-24",
            "gender": "ذكر",
            "answers": _answers(),
        },
    )
    assert response.status_code == 201
    body = response.json()
    assert body["prediction"]["risk"] == "high"
    assert body["followup_needed"] is True

    saved = db_session.query(QuestionnaireResult).first()
    assert saved is not None
    assert str(saved.initial_risk).lower() == "high"
    assert str(saved.ml_risk).lower() == "high"


def test_followup_normalizes_risk_and_persists(client, db_session, monkeypatch):
    token = _register(client, email="f@example.com")
    monkeypatch.setattr("app.routers.questionnaire.predict", lambda *_: ("Medium", 0.74))

    submit = client.post(
        "/api/questionnaire/submit",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "age_group": "19-24",
            "gender": "ذكر",
            "answers": _answers(),
        },
    )
    assert submit.status_code == 201
    result_id = submit.json()["result_id"]

    monkeypatch.setattr("app.routers.followup.predict", lambda *_: ("HIGH", 0.88))
    followup = client.post(
        "/api/followup/submit",
        headers={"Authorization": f"Bearer {token}"},
        json={"result_id": result_id, "followup_answers": {"eye_contact": 0}},
    )
    assert followup.status_code == 200
    assert followup.json()["prediction"]["risk"] == "high"

    saved = db_session.query(QuestionnaireResult).filter(QuestionnaireResult.id == result_id).first()
    assert saved is not None
    assert str(saved.final_risk).lower() == "high"
    assert str(saved.ml_risk).lower() == "high"


def test_validate_ml_assets_success(monkeypatch):
    class DummyEncoder:
        classes_ = ["Low", "Medium", "High"]

    monkeypatch.setattr(
        "app.ml.predictor._load_assets",
        lambda: (object(), DummyEncoder(), ["Age_12–18 Months", "Gender"]),
    )
    validate_ml_assets()
    assert ml_assets_ready() is True
