"""SQLAlchemy model for AI use cases — all enriched fields."""

from datetime import date, datetime

from sqlalchemy import Boolean, Float, Integer, String, Text, Date, DateTime, func
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import Mapped, mapped_column

from app.models.database import Base


class UseCase(Base):
    """Use case stored in PostgreSQL. Fields match seed_use_cases_enriched.json."""

    __tablename__ = "use_cases"

    # ─── Identity ────────────────────────────────────────────
    id: Mapped[str] = mapped_column(String(20), primary_key=True)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    original_title: Mapped[str | None] = mapped_column(String(500), nullable=True)
    description: Mapped[str] = mapped_column(Text, nullable=False)

    # ─── Classification ──────────────────────────────────────
    sector: Mapped[str | None] = mapped_column(String(100), nullable=True)
    sector_normalized: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    functions: Mapped[list[str] | None] = mapped_column(ARRAY(String), nullable=True)
    agent_type: Mapped[str | None] = mapped_column(String(50), nullable=True)
    archetype: Mapped[str | None] = mapped_column(String(60), nullable=True, index=True)

    # ─── Business context ────────────────────────────────────
    company_example: Mapped[str | None] = mapped_column(String(300), nullable=True)
    business_challenge: Mapped[str | None] = mapped_column(Text, nullable=True)
    ai_solution: Mapped[str | None] = mapped_column(Text, nullable=True)
    measurable_benefit: Mapped[str | None] = mapped_column(Text, nullable=True)

    # ─── Technical ───────────────────────────────────────────
    tech_keywords: Mapped[list[str] | None] = mapped_column(ARRAY(String), nullable=True)

    # ─── Source ──────────────────────────────────────────────
    source_url: Mapped[str] = mapped_column(String(1000), nullable=False)
    source_name: Mapped[str] = mapped_column(String(300), nullable=False)
    scrape_date: Mapped[date] = mapped_column(Date, nullable=False)

    # ─── Enriched fields ─────────────────────────────────────
    benefits: Mapped[list[str] | None] = mapped_column(ARRAY(String), nullable=True)
    tools_and_technologies: Mapped[list[str] | None] = mapped_column(ARRAY(String), nullable=True)

    # ─── Scoring (from archetype) ────────────────────────────
    trend_strength: Mapped[int | None] = mapped_column(Integer, nullable=True)
    client_relevance: Mapped[int | None] = mapped_column(Integer, nullable=True)
    capability_match: Mapped[int | None] = mapped_column(Integer, nullable=True)
    market_momentum: Mapped[int | None] = mapped_column(Integer, nullable=True)
    roi_potential: Mapped[int | None] = mapped_column(Integer, nullable=True)
    technical_complexity: Mapped[int | None] = mapped_column(Integer, nullable=True)
    market_maturity: Mapped[int | None] = mapped_column(Integer, nullable=True)
    regulatory_risk: Mapped[int | None] = mapped_column(Integer, nullable=True)
    quick_win_potential: Mapped[int | None] = mapped_column(Integer, nullable=True)
    weighted_score: Mapped[float | None] = mapped_column(Float, nullable=True, index=True)

    # ─── Derived fields ──────────────────────────────────────
    estimated_roi: Mapped[str | None] = mapped_column(String(20), nullable=True)
    complexity_level: Mapped[str | None] = mapped_column(String(20), nullable=True)
    quick_win: Mapped[bool | None] = mapped_column(Boolean, nullable=True, index=True)

    # ─── Timestamps ──────────────────────────────────────────
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
