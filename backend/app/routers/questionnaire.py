"""
Questionnaire endpoints:
  POST /api/questionnaire/submit   – store answers and return ML prediction
  GET  /api/questionnaire/history  – list past assessments for the current user
"""

from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import QuestionnaireResult, User
from app.ml.predictor import normalize_risk_label, predict
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

    # CHANGED: Manually calculate the score by summing the values (1s and 0s)
    score = sum(answers_dict.values())

    try:
        ml_risk_raw, ml_confidence = predict(body.age_group, body.gender, answers_dict)
        ml_risk = normalize_risk_label(ml_risk_raw)
    except (FileNotFoundError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Machine learning files not found. Please ensure the deployed model assets are available."
        )

    failed_skills = [k for k, v in answers_dict.items() if v == 1]
    
    followup_needed = ml_risk == "high"

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
            initial_risk=normalize_risk_label(r.initial_risk),
            final_risk=normalize_risk_label(r.final_risk) if r.final_risk else None,
            ml_risk=normalize_risk_label(r.ml_risk) if r.ml_risk else None,
            ml_confidence=r.ml_confidence,
            score=r.final_score if r.final_score is not None else r.initial_score,
        )
        for r in results
    ]
