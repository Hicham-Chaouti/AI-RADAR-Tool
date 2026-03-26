"""Scoring endpoints — POST /api/v1/score."""

from __future__ import annotations

import time
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import (
    get_cache_service,
    get_db,
    get_llm_router,
    get_rag_service,
    get_scoring_service,
)
from app.models.session import Session
from app.models.use_case import UseCase
from app.schemas.scoring import ScoreRequest, ScoreResponse, ScoringResult
from app.services.cache_service import CacheService
from app.services.embedding_service import build_query_text, wait_for_model
from app.services.llm_router import LLMRouter
from app.services.rag_service import RAGService
from app.services.scoring_service import ScoringEngine
from app.utils.logger import get_logger

log = get_logger(__name__)

router = APIRouter()


@router.post("", response_model=ScoreResponse)
async def score_use_cases(
    payload: ScoreRequest,
    db: AsyncSession = Depends(get_db),
    cache: CacheService = Depends(get_cache_service),
    rag: RAGService = Depends(get_rag_service),
    scoring: ScoringEngine = Depends(get_scoring_service),
    llm: LLMRouter = Depends(get_llm_router),
):
    """Score and rank Top 10 use cases for a session."""
    start = time.time()

    # 0. Wait for embedding model to load (first request may take 30-60s)
    await wait_for_model()

    # 1. Check cache
    cache_key = f"score:{payload.session_id}"
    cached = await cache.get(cache_key)
    if cached:
        log.info("Score cache hit", extra={"session_id": payload.session_id, "cache_hit": True})
        return ScoreResponse(**cached)

    # 2. Load session from DB
    result = await db.execute(
        select(Session).where(Session.id == payload.session_id)
    )
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # 3. Build query text for RAG
    query_text = build_query_text(
        sector=session.sector,
        capabilities=session.capabilities,
        objectives=session.strategic_objectives,
    )

    # 4. RAG: query Qdrant → top 20 candidates
    rag_results = await rag.query(
        query_text=query_text,
        sector_filter=None,  # search across all sectors for broader results
        top_k=20,
    )

    if not rag_results:
        raise HTTPException(status_code=404, detail="No matching use cases found")

    # 5. Load use case details from PostgreSQL
    uc_ids = [r["use_case_id"] for r in rag_results]
    result = await db.execute(select(UseCase).where(UseCase.id.in_(uc_ids)))
    use_cases_map = {uc.id: uc for uc in result.scalars().all()}

    # Build cosine similarity map
    cosine_map = {r["use_case_id"]: r["score"] for r in rag_results}

    # 6. Score each use case
    scored: list[ScoringResult] = []
    for uc_id, cosine_score in cosine_map.items():
        uc = use_cases_map.get(uc_id)
        if not uc:
            continue
        sr = scoring.score(uc, session, cosine_score)
        scored.append(sr)

    # 7. Sort by radar_score desc → keep Top 10
    scored.sort(key=lambda s: s.radar_score, reverse=True)
    top10 = scored[:10]

    # 8. Assign ranks + generate justifications
    for i, sr in enumerate(top10):
        sr.rank = i + 1
        uc = use_cases_map[sr.use_case_id]
        sr.justification = await llm.generate_justification(uc, session)

    # 9. Build response
    processing_time = int((time.time() - start) * 1000)
    response = ScoreResponse(
        session_id=str(session.id),
        sector=session.sector,
        processing_time_ms=processing_time,
        top_10=top10,
        generated_at=datetime.now(timezone.utc).isoformat(),
    )

    # 10. Cache result (TTL 1h)
    await cache.set(cache_key, response.model_dump(), ttl=3600)

    log.info(
        "Scoring complete",
        extra={
            "session_id": payload.session_id,
            "duration_ms": processing_time,
            "task": "scoring_pipeline",
        },
    )
    return response
