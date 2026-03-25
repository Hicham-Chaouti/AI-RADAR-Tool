"""Pydantic schemas for feedback API."""

from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel, Field, model_validator


class FeedbackBase(BaseModel):
    decision_status: str = Field(pattern="^(approve|defer|reject)$")
    confidence: str = Field(pattern="^(low|medium|high)$")
    strategic_fit: int = Field(ge=1, le=5)
    business_value: int = Field(ge=1, le=5)
    feasibility: int = Field(ge=1, le=5)
    time_to_value: str = Field(pattern="^(lt_3m|m3_6|m6_12|gt_12m)$")
    blockers: list[str] | None = None
    rationale: str = Field(min_length=3, max_length=240)

    owner: str | None = Field(default=None, max_length=120)
    next_step_date: date | None = None

    implemented: bool | None = None
    kpi_name: str | None = Field(default=None, max_length=120)
    baseline_value: float | None = None
    current_value: float | None = None
    adoption_percent: int | None = Field(default=None, ge=0, le=100)
    satisfaction: int | None = Field(default=None, ge=1, le=5)
    delivery_difficulty: int | None = Field(default=None, ge=1, le=5)
    risk_incidents: str | None = Field(default=None, pattern="^(none|minor|major)$")
    outcome_comment: str | None = Field(default=None, max_length=300)

    updated_by: str | None = Field(default=None, max_length=120)

    @model_validator(mode="after")
    def validate_logic(self):
        if self.decision_status == "approve":
            if not self.owner or not self.next_step_date:
                raise ValueError("owner and next_step_date are required when decision_status=approve")

        if self.implemented:
            if not self.kpi_name:
                raise ValueError("kpi_name is required when implemented=true")
            if self.baseline_value is None or self.current_value is None:
                raise ValueError("baseline_value and current_value are required when implemented=true")

        return self


class FeedbackUpsertRequest(FeedbackBase):
    session_id: UUID
    use_case_id: str


class FeedbackRead(FeedbackBase):
    id: UUID
    session_id: UUID
    use_case_id: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class FeedbackListResponse(BaseModel):
    session_id: UUID
    items: list[FeedbackRead]
