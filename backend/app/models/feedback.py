"""SQLAlchemy model for decision-maker feedback on scored use cases."""

import uuid
from datetime import date, datetime

from sqlalchemy import Date, DateTime, Float, ForeignKey, Integer, String, Text, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import ARRAY, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.database import Base


class Feedback(Base):
    """Feedback record linked to a session + use case."""

    __tablename__ = "feedback"
    __table_args__ = (
        UniqueConstraint("session_id", "use_case_id", name="uq_feedback_session_use_case"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("client_sessions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    use_case_id: Mapped[str] = mapped_column(
        String(20),
        ForeignKey("use_cases.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    decision_status: Mapped[str] = mapped_column(String(20), nullable=False)
    confidence: Mapped[str] = mapped_column(String(20), nullable=False)
    strategic_fit: Mapped[int] = mapped_column(Integer, nullable=False)
    business_value: Mapped[int] = mapped_column(Integer, nullable=False)
    feasibility: Mapped[int] = mapped_column(Integer, nullable=False)
    time_to_value: Mapped[str] = mapped_column(String(20), nullable=False)
    blockers: Mapped[list[str] | None] = mapped_column(ARRAY(String), nullable=True)
    rationale: Mapped[str] = mapped_column(Text, nullable=False)

    owner: Mapped[str | None] = mapped_column(String(120), nullable=True)
    next_step_date: Mapped[date | None] = mapped_column(Date, nullable=True)

    implemented: Mapped[bool | None] = mapped_column(default=None, nullable=True)
    kpi_name: Mapped[str | None] = mapped_column(String(120), nullable=True)
    baseline_value: Mapped[float | None] = mapped_column(Float, nullable=True)
    current_value: Mapped[float | None] = mapped_column(Float, nullable=True)
    adoption_percent: Mapped[int | None] = mapped_column(Integer, nullable=True)
    satisfaction: Mapped[int | None] = mapped_column(Integer, nullable=True)
    delivery_difficulty: Mapped[int | None] = mapped_column(Integer, nullable=True)
    risk_incidents: Mapped[str | None] = mapped_column(String(20), nullable=True)
    outcome_comment: Mapped[str | None] = mapped_column(Text, nullable=True)

    updated_by: Mapped[str | None] = mapped_column(String(120), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )
