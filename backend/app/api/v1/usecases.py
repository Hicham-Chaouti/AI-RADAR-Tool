"""Use case detail endpoints — GET /api/v1/usecases/{id}, POST /api/v1/usecases/{id}/roadmap."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_cache_service, get_db, get_llm_router
from app.models.session import Session
from app.models.use_case import UseCase
from app.schemas.roadmap import RoadmapRequest, RoadmapResponse
from app.schemas.use_case import UseCaseRead
from app.services.cache_service import CacheService
from app.services.llm_router import LLMRouter

router = APIRouter()


@router.get("/{use_case_id}", response_model=UseCaseRead)
async def get_use_case(
    use_case_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Get full use case detail by ID."""
    result = await db.execute(select(UseCase).where(UseCase.id == use_case_id))
    uc = result.scalar_one_or_none()
    if not uc:
        raise HTTPException(status_code=404, detail=f"Use case '{use_case_id}' not found")
    return uc


@router.post("/{use_case_id}/roadmap", response_model=RoadmapResponse)
async def generate_roadmap(
    use_case_id: str,
    payload: RoadmapRequest,
    db: AsyncSession = Depends(get_db),
    cache: CacheService = Depends(get_cache_service),
    llm: LLMRouter = Depends(get_llm_router),
):
    """Generate an AI implementation roadmap for a use case."""
    result = await db.execute(select(UseCase).where(UseCase.id == use_case_id))
    uc = result.scalar_one_or_none()
    if not uc:
        raise HTTPException(status_code=404, detail=f"Use case '{use_case_id}' not found")

    # Use sector from session if available, else fall back to use case sector
    sector = uc.sector_normalized or uc.sector or "General"
    if payload.session_id:
        sess_result = await db.execute(select(Session).where(Session.id == payload.session_id))
        session = sess_result.scalar_one_or_none()
        if session and session.sector:
            sector = session.sector

    data = await llm.generate_roadmap(uc, sector)
    return RoadmapResponse(**data)
