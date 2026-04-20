"""SQLAlchemy model for user sessions."""

import uuid
from datetime import datetime

from sqlalchemy import String, DateTime, func
from sqlalchemy.dialects.postgresql import UUID, ARRAY, JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.models.database import Base


class Session(Base):
    """Session representing a client onboarding + scoring request."""

    __tablename__ = "client_sessions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    sector: Mapped[str] = mapped_column(String(50), nullable=False)
    client_name: Mapped[str] = mapped_column(String(300), nullable=False)
    relationship_level: Mapped[str | None] = mapped_column(String(50), nullable=True)
    business_proximity: Mapped[str | None] = mapped_column(String(50), nullable=True)
    capabilities: Mapped[list[str] | None] = mapped_column(ARRAY(String), nullable=True)
    data_maturity: Mapped[str | None] = mapped_column(String(50), nullable=True)
    strategic_objectives: Mapped[list[str] | None] = mapped_column(ARRAY(String), nullable=True)
    results: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
