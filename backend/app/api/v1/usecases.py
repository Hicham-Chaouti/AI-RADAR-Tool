"""Use case detail endpoints — GET /api/v1/usecases/{id}."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db
from app.models.use_case import UseCase
from app.schemas.use_case import UseCaseRead

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
