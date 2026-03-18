"""Pydantic schemas for use case API I/O."""

from datetime import date
from pydantic import BaseModel, Field


class UseCaseCreate(BaseModel):
    """Schema for inserting a use case from the enriched JSON."""

    id: str
    title: str
    original_title: str | None = None
    description: str
    sector: str | None = None
    sector_normalized: str
    functions: list[str] | None = None
    agent_type: str | None = None
    archetype: str | None = None
    company_example: str | None = None
    business_challenge: str | None = None
    ai_solution: str | None = None
    measurable_benefit: str | None = None
    tech_keywords: list[str] | None = None
    source_url: str
    source_name: str
    scrape_date: date
    benefits: list[str] | None = None
    data_prerequisites: list[str] | None = None
    trend_strength: int | None = None
    client_relevance: int | None = None
    capability_match: int | None = None
    market_momentum: int | None = None
    roi_potential: int | None = None
    technical_complexity: int | None = None
    market_maturity: int | None = None
    regulatory_risk: int | None = None
    quick_win_potential: int | None = None
    weighted_score: float | None = None
    estimated_roi: str | None = None
    complexity_level: str | None = None
    quick_win: bool | None = None


class UseCaseRead(UseCaseCreate):
    """Use case response schema — all fields + computed weighted_score."""

    model_config = {"from_attributes": True}
