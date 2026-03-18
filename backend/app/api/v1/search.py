"""Search endpoints — GET /api/v1/search."""

from __future__ import annotations

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db, get_rag_service
from app.models.use_case import UseCase
from app.services.rag_service import RAGService

router = APIRouter()


@router.get("")
async def search_use_cases(
    q: str = Query(description="Natural language search query"),
    sector: str | None = Query(default=None, description="Filter by sector_normalized"),
    function: str | None = Query(default=None, description="Filter by business function"),
    limit: int = Query(default=10, ge=1, le=50, description="Max results"),
    db: AsyncSession = Depends(get_db),
    rag: RAGService = Depends(get_rag_service),
):
    """Semantic search across use cases with optional metadata filters."""
    if not q.strip():
        return {"query": q, "results": [], "total": 0}

    # Vector search via Qdrant
    rag_results = await rag.query(
        query_text=q,
        sector_filter=sector,
        top_k=limit,
    )

    if not rag_results:
        return {"query": q, "results": [], "total": 0}

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
        results.append({
            "use_case_id": uc.id,
            "title": uc.title,
            "sector_normalized": uc.sector_normalized,
            "archetype": uc.archetype,
            "weighted_score": uc.weighted_score,
            "quick_win": uc.quick_win,
            "similarity_score": round(hit["score"], 3),
            "source_url": uc.source_url,
        })

    return {"query": q, "results": results, "total": len(results)}
