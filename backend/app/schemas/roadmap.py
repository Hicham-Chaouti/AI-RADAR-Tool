"""Pydantic schemas for the roadmap generation endpoint."""

from pydantic import BaseModel


class RoadmapPhase(BaseModel):
    phase: str = "Phase"
    description: str = ""
    charge_jours: int = 0
    budget_phase: str = "0€"
    profils: list[str] = []
    key_actions: list[str] = []
    livrables: list[str] = []


class RiskMitigation(BaseModel):
    risk: str = ""
    mitigation: str = ""


class RoadmapRequest(BaseModel):
    session_id: str | None = None


class RoadmapResponse(BaseModel):
    use_case_title: str = "Titre du cas d'usage"
    objective: str = "Objectif non défini"
    business_value: list[str] = []
    budget_total: str | None = None
    equipe_recommandee: str | None = None
    roadmap: list[RoadmapPhase] = []
    estimated_timeline: str = "Non défini"
    risks_and_mitigations: list[RiskMitigation] = []
