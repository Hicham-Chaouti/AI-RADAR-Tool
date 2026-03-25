"""002 — Add feedback table.

Revision ID: 002_feedback_table
Revises: 001_initial_schema
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import ARRAY, UUID
import uuid


revision = "002_feedback_table"
down_revision = "001_initial_schema"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "feedback",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column("session_id", UUID(as_uuid=True), sa.ForeignKey("client_sessions.id", ondelete="CASCADE"), nullable=False),
        sa.Column("use_case_id", sa.String(length=20), sa.ForeignKey("use_cases.id", ondelete="CASCADE"), nullable=False),
        sa.Column("decision_status", sa.String(length=20), nullable=False),
        sa.Column("confidence", sa.String(length=20), nullable=False),
        sa.Column("strategic_fit", sa.Integer, nullable=False),
        sa.Column("business_value", sa.Integer, nullable=False),
        sa.Column("feasibility", sa.Integer, nullable=False),
        sa.Column("time_to_value", sa.String(length=20), nullable=False),
        sa.Column("blockers", ARRAY(sa.String), nullable=True),
        sa.Column("rationale", sa.Text, nullable=False),
        sa.Column("owner", sa.String(length=120), nullable=True),
        sa.Column("next_step_date", sa.Date, nullable=True),
        sa.Column("implemented", sa.Boolean, nullable=True),
        sa.Column("kpi_name", sa.String(length=120), nullable=True),
        sa.Column("baseline_value", sa.Float, nullable=True),
        sa.Column("current_value", sa.Float, nullable=True),
        sa.Column("adoption_percent", sa.Integer, nullable=True),
        sa.Column("satisfaction", sa.Integer, nullable=True),
        sa.Column("delivery_difficulty", sa.Integer, nullable=True),
        sa.Column("risk_incidents", sa.String(length=20), nullable=True),
        sa.Column("outcome_comment", sa.Text, nullable=True),
        sa.Column("updated_by", sa.String(length=120), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.UniqueConstraint("session_id", "use_case_id", name="uq_feedback_session_use_case"),
    )

    op.create_index("ix_feedback_session_id", "feedback", ["session_id"])
    op.create_index("ix_feedback_use_case_id", "feedback", ["use_case_id"])


def downgrade() -> None:
    op.drop_index("ix_feedback_use_case_id", table_name="feedback")
    op.drop_index("ix_feedback_session_id", table_name="feedback")
    op.drop_table("feedback")
