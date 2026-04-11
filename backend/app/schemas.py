"""
Pydantic schemas for request validation and response serialization.
"""

from datetime import datetime
from typing import Dict, List, Literal, Optional

from pydantic import BaseModel, EmailStr, Field


# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    child_name: str = Field(min_length=2)
    child_age: Literal["12-18", "19-24", "25-30", "31-36"]
    child_gender: Literal["ذكر", "أنثى"]


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    child_name: str
    child_age: str
    child_gender: str
    email: str


# ---------------------------------------------------------------------------
# Profile
# ---------------------------------------------------------------------------

class ProfileResponse(BaseModel):
    email: str
    child_name: str
    child_age: str
    child_gender: str
    created_at: datetime

    class Config:
        from_attributes = True


class ProfileUpdateRequest(BaseModel):
    child_name: Optional[str] = Field(None, min_length=2)
    child_age: Optional[Literal["12-18", "19-24", "25-30", "31-36"]] = None
    child_gender: Optional[Literal["ذكر", "أنثى"]] = None
    email: Optional[EmailStr] = None


# ---------------------------------------------------------------------------
# Questionnaire
# ---------------------------------------------------------------------------

# Skill answer: 0 = نعم (typical), 1 = لا (concern)
SkillAnswer = Literal[0, 1]


class QuestionnaireAnswers(BaseModel):
    response_to_name: SkillAnswer
    eye_contact: SkillAnswer
    social_smile: SkillAnswer
    imitation: SkillAnswer
    discrimination: SkillAnswer
    pointing_with_finger: SkillAnswer
    facial_expressions: SkillAnswer
    joint_attention: SkillAnswer
    play_skills: SkillAnswer
    response_to_commands: SkillAnswer


class QuestionnaireSubmitRequest(BaseModel):
    age_group: Literal["12-18", "19-24", "25-30", "31-36"]
    gender: Literal["ذكر", "أنثى"]
    answers: QuestionnaireAnswers


class PredictionResult(BaseModel):
    risk: Literal["low", "medium", "high"]
    confidence: float
    score: int
    rule_risk: Optional[str] = None


class QuestionnaireSubmitResponse(BaseModel):
    result_id: int
    prediction: PredictionResult
    failed_skills: List[str]
    followup_needed: bool

# ---------------------------------------------------------------------------
# Followup
# ---------------------------------------------------------------------------

class FollowupSubmitRequest(BaseModel):
    result_id: int
    followup_answers: Dict[str, int]   # updated skill answers after follow-up


class FollowupSubmitResponse(BaseModel):
    prediction: PredictionResult


# ---------------------------------------------------------------------------
# History
# ---------------------------------------------------------------------------

class HistoryItem(BaseModel):
    id: int
    date: datetime
    age_group: str
    initial_risk: str
    final_risk: Optional[str]
    ml_risk: Optional[str]
    ml_confidence: Optional[float]
    score: int

    class Config:
        from_attributes = True
