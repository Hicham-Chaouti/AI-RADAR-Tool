"""Pydantic schemas for the roadmap generation endpoint."""

from pydantic import BaseModel


class RoadmapPhase(BaseModel):
    phase: str
    description: str
    charge_jours: int
    budget_phase: str
    profils: list[str]
    key_actions: list[str]
    livrables: list[str]


class RiskMitigation(BaseModel):
    risk: str
    mitigation: str


class RoadmapRequest(BaseModel):
    session_id: str | None = None


class RoadmapResponse(BaseModel):
    use_case_title: str
    objective: str
    business_value: list[str]
    budget_total: str | None = None
    equipe_recommandee: str | None = None
    roadmap: list[RoadmapPhase]
    estimated_timeline: str
    risks_and_mitigations: list[RiskMitigation]
