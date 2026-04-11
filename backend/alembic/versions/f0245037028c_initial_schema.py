"""initial_schema

Revision ID: f0245037028c
Revises: 
Create Date: 2026-04-11 12:47:09.470266

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f0245037028c'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    user_type_enum = sa.Enum("parent", "child", name="user_type")
    risk_level_enum = sa.Enum("low", "medium", "high", name="risk_level")

    user_type_enum.create(op.get_bind(), checkfirst=True)
    risk_level_enum.create(op.get_bind(), checkfirst=True)

    op.create_table(
        "users",
        sa.Column("id", sa.BigInteger(), nullable=False),
        sa.Column("user_type", user_type_enum, nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("first_name", sa.String(length=100), nullable=False),
        sa.Column("last_name", sa.String(length=100), nullable=False),
        sa.Column("date_of_birth", sa.DateTime(), nullable=True),
        sa.Column("phone_number", sa.String(length=20), nullable=True),
        sa.Column("profile_image_url", sa.String(length=255), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email"),
    )
    op.create_index(op.f("ix_users_email"), "users", ["email"], unique=False)
    op.create_index(op.f("ix_users_id"), "users", ["id"], unique=False)

    op.create_table(
        "parent_profiles",
        sa.Column("id", sa.BigInteger(), nullable=False),
        sa.Column("user_id", sa.BigInteger(), nullable=False),
        sa.Column("occupation", sa.String(length=150), nullable=True),
        sa.Column("address", sa.String(length=255), nullable=True),
        sa.Column("city", sa.String(length=100), nullable=True),
        sa.Column("country", sa.String(length=100), nullable=True),
        sa.Column("postal_code", sa.String(length=20), nullable=True),
        sa.Column("bio", sa.Text(), nullable=True),
        sa.Column("child_name", sa.String(length=100), nullable=True),
        sa.Column("child_age_group", sa.String(length=10), nullable=True),
        sa.Column("child_gender", sa.String(length=10), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id"),
    )
    op.create_index(op.f("ix_parent_profiles_id"), "parent_profiles", ["id"], unique=False)

    op.create_table(
        "questionnaire_results",
        sa.Column("id", sa.BigInteger(), nullable=False),
        sa.Column("user_id", sa.BigInteger(), nullable=False),
        sa.Column("age_group", sa.String(length=10), nullable=False),
        sa.Column("gender", sa.String(length=10), nullable=False),
        sa.Column("response_to_name", sa.SmallInteger(), nullable=False),
        sa.Column("eye_contact", sa.SmallInteger(), nullable=False),
        sa.Column("social_smile", sa.SmallInteger(), nullable=False),
        sa.Column("imitation", sa.SmallInteger(), nullable=False),
        sa.Column("discrimination", sa.SmallInteger(), nullable=False),
        sa.Column("pointing_with_finger", sa.SmallInteger(), nullable=False),
        sa.Column("facial_expressions", sa.SmallInteger(), nullable=False),
        sa.Column("joint_attention", sa.SmallInteger(), nullable=False),
        sa.Column("play_skills", sa.SmallInteger(), nullable=False),
        sa.Column("response_to_commands", sa.SmallInteger(), nullable=False),
        sa.Column("initial_score", sa.SmallInteger(), nullable=False),
        sa.Column("initial_risk", risk_level_enum, nullable=False),
        sa.Column("followup_answers", sa.JSON(), nullable=True),
        sa.Column("final_score", sa.SmallInteger(), nullable=True),
        sa.Column("final_risk", risk_level_enum, nullable=True),
        sa.Column("ml_risk", risk_level_enum, nullable=True),
        sa.Column("ml_confidence", sa.Float(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_questionnaire_results_id"), "questionnaire_results", ["id"], unique=False)

    op.create_table(
        "sessions",
        sa.Column("id", sa.BigInteger(), nullable=False),
        sa.Column("user_id", sa.BigInteger(), nullable=False),
        sa.Column("session_token", sa.String(length=255), nullable=False),
        sa.Column("ip_address", sa.String(length=45), nullable=True),
        sa.Column("user_agent", sa.Text(), nullable=True),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("session_token"),
    )
    op.create_index(op.f("ix_sessions_id"), "sessions", ["id"], unique=False)
    op.create_index(op.f("ix_sessions_session_token"), "sessions", ["session_token"], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f("ix_sessions_session_token"), table_name="sessions")
    op.drop_index(op.f("ix_sessions_id"), table_name="sessions")
    op.drop_table("sessions")

    op.drop_index(op.f("ix_questionnaire_results_id"), table_name="questionnaire_results")
    op.drop_table("questionnaire_results")

    op.drop_index(op.f("ix_parent_profiles_id"), table_name="parent_profiles")
    op.drop_table("parent_profiles")

    op.drop_index(op.f("ix_users_id"), table_name="users")
    op.drop_index(op.f("ix_users_email"), table_name="users")
    op.drop_table("users")

    sa.Enum(name="risk_level").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="user_type").drop(op.get_bind(), checkfirst=True)
