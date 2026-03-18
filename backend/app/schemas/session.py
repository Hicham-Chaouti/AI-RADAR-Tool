"""Pydantic schemas for session API I/O."""

import uuid
from datetime import datetime
from pydantic import BaseModel


class OnboardingForm(BaseModel):
    """Input from the frontend onboarding form."""

    sector: str
    client_name: str
    relationship_level: str | None = None
    business_proximity: str | None = None
    capabilities: list[str] | None = None
    data_maturity: str | None = None
    strategic_objectives: list[str] | None = None


class SessionCreate(OnboardingForm):
    """Schema for inserting into PostgreSQL (same fields as OnboardingForm)."""

    pass


class SessionRead(SessionCreate):
    """Session response with ID and timestamp."""

    id: uuid.UUID
    created_at: datetime

    model_config = {"from_attributes": True}
