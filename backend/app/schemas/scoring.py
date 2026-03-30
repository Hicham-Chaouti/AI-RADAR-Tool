"""Pydantic schemas for scoring API I/O."""

from pydantic import BaseModel, Field


class ScoreBreakdown(BaseModel):
    """The 4 main scoring dimensions plus the business-rules adjustment."""

    trend_strength: int = Field(ge=0, le=10)
    client_relevance: int = Field(ge=0, le=10)
    capability_match: int = Field(ge=0, le=10)
    market_momentum: int = Field(ge=0, le=10)
    rule_adjustment: float = Field(default=0.0)  # sector + archetype bonuses


class RadarAxes(BaseModel):
    """The 5 radar-chart axes."""

    roi_potential: int = Field(ge=0, le=10)
    technical_complexity: int = Field(ge=0, le=10)
    market_maturity: int = Field(ge=0, le=10)
    regulatory_risk: int = Field(ge=0, le=10)
    quick_win_potential: int = Field(ge=0, le=10)


class ScoringResult(BaseModel):
    """A single scored use case in the Top-N response."""

    rank: int
    use_case_id: str
    title: str
    company_example: str | None = None
    source_url: str | None = None
    radar_score: float = Field(ge=0, le=10)
    score_breakdown: ScoreBreakdown
    radar_axes: RadarAxes
    justification: str | None = None
    cached: bool = False


class ScoreRequest(BaseModel):
    """Input for scoring — references a session."""

    session_id: str


class ScoreResponse(BaseModel):
    """Top-N scored use cases — API output."""

    session_id: str
    sector: str
    processing_time_ms: int
    top_10: list[ScoringResult]
    generated_at: str
