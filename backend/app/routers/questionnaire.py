"""
Questionnaire endpoints:
  POST /api/questionnaire/submit   – store answers and return ML prediction
  GET  /api/questionnaire/history  – list past assessments for the current user
  GET  /api/questionnaire/latest   – get the latest full assessment for the current user
"""

from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import QuestionnaireResult, User, ModelMonitoringLog
from app.ml.predictor import predict
from app.routers.auth import _get_current_user
from app.schemas import (
    HistoryItem,
    PredictionResult,
    QuestionnaireSubmitRequest,
    QuestionnaireSubmitResponse,
)

SKILL_KEYS = [
    "response_to_name",
    "eye_contact",
    "social_smile",
    "imitation",
    "discrimination",
    "pointing_with_finger",
    "facial_expressions",
    "joint_attention",
    "play_skills",
    "response_to_commands",
]

router = APIRouter(prefix="/api/questionnaire", tags=["questionnaire"])


@router.post("/submit", response_model=QuestionnaireSubmitResponse, status_code=status.HTTP_201_CREATED)
def submit_questionnaire(
    body: QuestionnaireSubmitRequest,
    current_user: User = Depends(_get_current_user),
    db: Session = Depends(get_db),
):
    answers_dict = body.answers.model_dump()

    score = sum(answers_dict.values())

    try:
        ml_risk, ml_confidence = predict(body.age_group, body.gender, answers_dict)
        ml_risk = ml_risk.lower()
    except FileNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Machine learning files not found. Please ensure the deployed model assets are available."
        )

    failed_skills = [k for k, v in answers_dict.items() if v == 1]
    # =========================
# ML Monitoring
# =========================

import csv
import os
from datetime import datetime

monitoring_file = "ml_monitoring_logs.csv"

file_exists = os.path.isfile(monitoring_file)

with open(monitoring_file, mode="a", newline="", encoding="utf-8") as file:
    writer = csv.writer(file)

    if not file_exists:
        writer.writerow([
            "timestamp",
            "user_id",
            "prediction",
            "confidence",
            "score",
            "failed_skills"
        ])

    writer.writerow([
        datetime.now(),
        current_user.id,
        ml_risk,
        round(ml_confidence, 2),
        score,
        len(failed_skills)
    ])

# =========================
# End Monitoring
# =========================

    followup_needed = ml_risk.lower() in ("medium", "high")

    result = QuestionnaireResult(
        user_id=current_user.id,
        age_group=body.age_group,
        gender=body.gender,
        **answers_dict,
        initial_score=score,
        initial_risk=ml_risk,
        ml_risk=ml_risk,
        ml_confidence=ml_confidence,
    )

    db.add(result)
    db.commit()
    db.refresh(result)

monitoring_log = ModelMonitoringLog(
    user_id=current_user.id,
    questionnaire_result_id=result.id,
    age_group=body.age_group,
    gender=body.gender,
    input_answers=answers_dict,
    prediction=ml_risk,
    confidence=ml_confidence,
    score=score,
    failed_skills_count=len(failed_skills),
)

db.add(monitoring_log)
db.commit()

    return QuestionnaireSubmitResponse(
        result_id=result.id,
        prediction=PredictionResult(
            risk=ml_risk,
            confidence=ml_confidence,
            score=score,
            rule_risk=None,
        ),
        failed_skills=failed_skills,
        followup_needed=followup_needed,
    )


@router.get("/history", response_model=List[HistoryItem])
def get_history(
    current_user: User = Depends(_get_current_user),
    db: Session = Depends(get_db),
):
    results = (
        db.query(QuestionnaireResult)
        .filter(QuestionnaireResult.user_id == current_user.id)
        .order_by(QuestionnaireResult.created_at.desc())
        .all()
    )

    return [
        HistoryItem(
            id=r.id,
            date=r.created_at,
            age_group=r.age_group,
            initial_risk=r.initial_risk,
            final_risk=r.final_risk,
            ml_risk=r.ml_risk,
            ml_confidence=r.ml_confidence,
            score=r.final_score if r.final_score is not None else r.initial_score,
        )
        for r in results
    ]


@router.get("/latest")
def get_latest_assessment(
    current_user: User = Depends(_get_current_user),
    db: Session = Depends(get_db),
):
    result = (
        db.query(QuestionnaireResult)
        .filter(QuestionnaireResult.user_id == current_user.id)
        .order_by(QuestionnaireResult.created_at.desc())
        .first()
    )

    if result is None:
        return None

    answers = {
        "response_to_name": result.response_to_name,
        "eye_contact": result.eye_contact,
        "social_smile": result.social_smile,
        "imitation": result.imitation,
        "discrimination": result.discrimination,
        "pointing_with_finger": result.pointing_with_finger,
        "facial_expressions": result.facial_expressions,
        "joint_attention": result.joint_attention,
        "play_skills": result.play_skills,
        "response_to_commands": result.response_to_commands,
    }

    if result.followup_answers:
        answers.update(result.followup_answers)

    failed_skills = [
        key for key, value in answers.items()
        if int(value) == 1
    ]

    return {
        "id": result.id,
        "age_group": result.age_group,
        "gender": result.gender,
        "answers": answers,
        "failed_skills": failed_skills,
        "score": result.final_score if result.final_score is not None else result.initial_score,
        "risk": result.final_risk if result.final_risk is not None else result.initial_risk,
        "ml_risk": result.ml_risk,
        "ml_confidence": result.ml_confidence,
        "followup_complete": result.followup_answers is not None,
        "created_at": result.created_at,
    }


@router.get("/monitoring/summary")
def get_monitoring_summary(
    current_user: User = Depends(_get_current_user),
    db: Session = Depends(get_db),
):
    logs = (
        db.query(ModelMonitoringLog)
        .filter(ModelMonitoringLog.user_id == current_user.id)
        .all()
    )

    if not logs:
        return {
            "total_predictions": 0,
            "risk_distribution": {},
            "average_confidence": 0,
            "average_score": 0,
            "average_failed_skills": 0,
        }

    risk_distribution = {}

    for log in logs:
        risk = log.prediction
        risk_distribution[risk] = risk_distribution.get(risk, 0) + 1

    return {
        "total_predictions": len(logs),
        "risk_distribution": risk_distribution,
        "average_confidence": round(
            sum(log.confidence or 0 for log in logs) / len(logs), 3
        ),
        "average_score": round(
            sum(log.score for log in logs) / len(logs), 2
        ),
        "average_failed_skills": round(
            sum(log.failed_skills_count for log in logs) / len(logs), 2
        ),
    }

@router.get("/test123")
def test123():
    return {"msg": "it works"}


