"""Search endpoints — GET /api/v1/search."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db, get_rag_service, get_scoring_service
from app.models.session import Session
from app.models.use_case import UseCase
from app.services.embedding_service import build_query_text
from app.services.rag_service import RAGService
from app.services.scoring_service import ScoringEngine

router = APIRouter()


SECTOR_ALIASES: dict[str, str] = {
    # Canonical keys (pass-through)
    "agriculture": "agriculture",
    "banking_finance": "banking_finance",
    "cross_industry": "cross_industry",
    "energy_utilities": "energy_utilities",
    "healthcare": "healthcare",
    "manufacturing": "manufacturing",
    "media_entertainment": "media_entertainment",
    "public_sector": "public_sector",
    "real_estate": "real_estate",
    "retail_ecommerce": "retail_ecommerce",
    "technology": "technology",
    "telecom": "telecom",
    "transportation_logistics": "transportation_logistics",
    # Frontend onboarding labels
    "agriculture & food": "agriculture",
    "automotive & mobility": "transportation_logistics",
    "banking & financial services": "banking_finance",
    "construction & real estate": "real_estate",
    "consumer goods & retail": "retail_ecommerce",
    "education & research": "cross_industry",
    "energy & utilities": "energy_utilities",
    "government & public sector": "public_sector",
    "healthcare & life sciences": "healthcare",
    "insurance": "banking_finance",
    "logistics & supply chain": "transportation_logistics",
    "manufacturing & industry 4.0": "manufacturing",
    "media & entertainment": "media_entertainment",
    "mining & natural resources": "energy_utilities",
    "professional services": "cross_industry",
    "telecommunications": "telecom",
    "travel & hospitality": "transportation_logistics",
}


def _normalize_sector_filter(sector: str | None) -> str | None:
    """Map UI sector labels/aliases to Qdrant sector_normalized keys."""
    if not sector:
        return None

    raw = sector.strip().lower()
    if not raw:
        return None

    normalized = SECTOR_ALIASES.get(raw)
    if normalized:
        return normalized

    # Fallback: turn labels like "Banking & Finance" into "banking_finance"
    slug = raw.replace("&", "and").replace("/", " ")
    slug = "_".join(slug.split())
    return SECTOR_ALIASES.get(slug)


@router.get("")
async def search_use_cases(
    q: str = Query(default="", description="Natural language search query"),
    session_id: str | None = Query(default=None, description="Optional session id to compute live radar_score"),
    sector: str | None = Query(default=None, description="Filter by sector_normalized"),
    function: str | None = Query(default=None, description="Filter by business function"),
    limit: int = Query(default=10, ge=1, le=50, description="Max results"),
    db: AsyncSession = Depends(get_db),
    rag: RAGService = Depends(get_rag_service),
    scoring: ScoringEngine = Depends(get_scoring_service),
):
    """Semantic search across use cases with optional metadata filters."""
    session: Session | None = None
    if session_id:
        session_result = await db.execute(select(Session).where(Session.id == session_id))
        session = session_result.scalar_one_or_none()
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")

    if not session and not q.strip():
        return {"query": q, "results": [], "total": 0}

    if session:
        # Match the scoring pipeline path exactly when session context is available.
        query_text = build_query_text(
            sector=session.sector,
            capabilities=session.capabilities,
            objectives=session.strategic_objectives,
        )
        sector_filter = None
        top_k = 20
    else:
        query_text = q
        sector_filter = _normalize_sector_filter(sector)
        top_k = limit

    # Vector search via Qdrant
    rag_results = await rag.query(
        query_text=query_text,
        sector_filter=sector_filter,
        top_k=top_k,
    )

    if not rag_results:
        return {"query": query_text, "results": [], "total": 0}

    # Load details from PostgreSQL
    uc_ids = [r["use_case_id"] for r in rag_results]
    result = await db.execute(select(UseCase).where(UseCase.id.in_(uc_ids)))
    uc_map = {uc.id: uc for uc in result.scalars().all()}

    # Build response maintaining cosine score order
    results = []
    for hit in rag_results:
        uc = uc_map.get(hit["use_case_id"])
        if not uc:
            continue
        # Optional function filter (post-filter since Qdrant doesn't index functions)
        if function and uc.functions:
            if not any(function.lower() in f.lower() for f in uc.functions):
                continue

        radar_score = None
        score_breakdown = None
        if session is not None:
            scored = scoring.score(uc, session, hit["score"])
            radar_score = scored.radar_score
            score_breakdown = scored.score_breakdown.model_dump()

        results.append({
            "use_case_id": uc.id,
            "title": uc.title,
            "sector_normalized": uc.sector_normalized,
            "archetype": uc.archetype,
            "weighted_score": uc.weighted_score,
            "radar_score": radar_score,
            "score_breakdown": score_breakdown,
            "quick_win": uc.quick_win,
            "company_example": uc.company_example,
            "source_name": uc.source_name,
            "similarity_score": round(hit["score"], 3),
            "source_url": uc.source_url,
        })

    if session is not None:
        results.sort(key=lambda item: item.get("radar_score") or 0, reverse=True)

    return {"query": query_text, "results": results, "total": len(results)}
