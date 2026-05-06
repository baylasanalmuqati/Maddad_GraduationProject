"""
SQLAlchemy ORM models that mirror the PostgreSQL schema.
"""

from sqlalchemy import (
    BigInteger,
    Boolean,
    Column,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    JSON,
    SmallInteger,
    String,
    Text,
    func,
)
from sqlalchemy.orm import relationship

from app.database import Base

# ---------------------------------------------------------------------------
# Enum helpers (mirror SQL ENUM types)
# ---------------------------------------------------------------------------

UserTypeEnum = Enum("parent", "child", name="user_type")
RiskLevelEnum = Enum("low", "medium", "high", name="risk_level")


# ---------------------------------------------------------------------------
# users
# ---------------------------------------------------------------------------

class User(Base):
    __tablename__ = "users"

    id = Column(BigInteger, primary_key=True, index=True)
    user_type = Column(UserTypeEnum, nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    date_of_birth = Column(DateTime, nullable=True)
    phone_number = Column(String(20), nullable=True)
    profile_image_url = Column(String(255), nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())

    parent_profile = relationship("ParentProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    sessions = relationship("Session", back_populates="user", cascade="all, delete-orphan")
    questionnaire_results = relationship("QuestionnaireResult", back_populates="user", cascade="all, delete-orphan")


# ---------------------------------------------------------------------------
# parent_profiles  (extended child info stored here at registration)
# ---------------------------------------------------------------------------

class ParentProfile(Base):
    __tablename__ = "parent_profiles"

    id = Column(BigInteger, primary_key=True, index=True)
    user_id = Column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    occupation = Column(String(150), nullable=True)
    address = Column(String(255), nullable=True)
    city = Column(String(100), nullable=True)
    country = Column(String(100), nullable=True)
    postal_code = Column(String(20), nullable=True)
    bio = Column(Text, nullable=True)

    # Child information – collected at registration and editable in settings
    child_name = Column(String(100), nullable=True)
    child_age_group = Column(String(10), nullable=True)   # '12-18' | '19-24' | '25-30' | '31-36'
    child_gender = Column(String(10), nullable=True)      # 'ذكر' | 'أنثى'

    user = relationship("User", back_populates="parent_profile")


# ---------------------------------------------------------------------------
# sessions
# ---------------------------------------------------------------------------

class Session(Base):
    __tablename__ = "sessions"

    id = Column(BigInteger, primary_key=True, index=True)
    user_id = Column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    session_token = Column(String(255), unique=True, nullable=False, index=True)
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(Text, nullable=True)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())

    user = relationship("User", back_populates="sessions")


# ---------------------------------------------------------------------------
# questionnaire_results
# ---------------------------------------------------------------------------

class QuestionnaireResult(Base):
    __tablename__ = "questionnaire_results"

    id = Column(BigInteger, primary_key=True, index=True)
    user_id = Column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    age_group = Column(String(10), nullable=False)
    gender = Column(String(10), nullable=False)

    # 10 skill answers: 0 = نعم (typical), 1 = لا (concern)
    response_to_name = Column(SmallInteger, nullable=False)
    eye_contact = Column(SmallInteger, nullable=False)
    social_smile = Column(SmallInteger, nullable=False)
    imitation = Column(SmallInteger, nullable=False)
    discrimination = Column(SmallInteger, nullable=False)
    pointing_with_finger = Column(SmallInteger, nullable=False)
    facial_expressions = Column(SmallInteger, nullable=False)
    joint_attention = Column(SmallInteger, nullable=False)
    play_skills = Column(SmallInteger, nullable=False)
    response_to_commands = Column(SmallInteger, nullable=False)

    initial_score = Column(SmallInteger, nullable=False)
    initial_risk = Column(RiskLevelEnum, nullable=False)

    followup_answers = Column(JSON, nullable=True)
    final_score = Column(SmallInteger, nullable=True)
    final_risk = Column(RiskLevelEnum, nullable=True)

    ml_risk = Column(RiskLevelEnum, nullable=True)
    ml_confidence = Column(Float, nullable=True)

    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())

    user = relationship("User", back_populates="questionnaire_results")


# ---------------------------------------------------------------------------
# email_verifications
# ---------------------------------------------------------------------------

class EmailVerification(Base):
    __tablename__ = "email_verifications"
    id = Column(BigInteger, primary_key=True, index=True)
    user_id = Column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    token = Column(String(255), unique=True, nullable=False, index=True)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    verified = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    user = relationship("User", backref="email_verifications")


# ---------------------------------------------------------------------------
# game_permission_requests + game_permissions
# ---------------------------------------------------------------------------

class GamePermissionRequest(Base):
    __tablename__ = "game_permission_requests"
    id = Column(BigInteger, primary_key=True, index=True)
    user_id = Column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    game_id = Column(String(100), nullable=False)
    game_title = Column(String(255), nullable=False)
    status = Column(String(20), nullable=False, default="pending")
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())

class GamePermission(Base):
    __tablename__ = "game_permissions"
    id = Column(BigInteger, primary_key=True, index=True)
    user_id = Column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    game_id = Column(String(100), nullable=False)
    allowed = Column(Boolean, nullable=False, default=False)
    updated_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())
