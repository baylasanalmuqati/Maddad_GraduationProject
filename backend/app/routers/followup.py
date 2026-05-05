"""
Follow-up endpoint:
  POST /api/followup/submit  – update skill answers after follow-up questions
                               and return a refined ML prediction
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import QuestionnaireResult, User
from app.ml.predictor import predict
from app.routers.auth import _get_current_user
from app.schemas import FollowupSubmitRequest, FollowupSubmitResponse, PredictionResult

router = APIRouter(prefix="/api/followup", tags=["followup"])


@router.post("/submit", response_model=FollowupSubmitResponse)
def submit_followup(
    body: FollowupSubmitRequest,
    current_user: User = Depends(_get_current_user),
    db: Session = Depends(get_db),
):
    result = db.query(QuestionnaireResult).filter(
        QuestionnaireResult.id == body.result_id,
        QuestionnaireResult.user_id == current_user.id,
    ).first()

    if result is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assessment not found"
        )

    original_answers = {
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

    updated_answers = {
        **original_answers,
        **{
            key: int(value)
            for key, value in body.followup_answers.items()
            if key in original_answers
        },
    }

    final_score = sum(updated_answers.values())

    try:
        ml_risk, ml_confidence = predict(
            result.age_group,
            result.gender,
            updated_answers
        )

        # Important: DB enum only accepts lowercase values: low / medium / high
        ml_risk = str(ml_risk).lower()

    except FileNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Machine learning model not found. Please ensure model.pkl is deployed."
        )

    result.followup_answers = body.followup_answers
    result.final_score = final_score
    result.final_risk = ml_risk
    result.ml_risk = ml_risk
    result.ml_confidence = ml_confidence

    db.commit()
    db.refresh(result)

    return FollowupSubmitResponse(
        prediction=PredictionResult(
            risk=ml_risk,
            confidence=ml_confidence,
            score=final_score,
            rule_risk=None,
        )
    )
