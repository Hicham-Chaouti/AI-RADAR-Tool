"""Session endpoints — POST /api/v1/session."""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db
from app.models.session import Session
from app.schemas.session import OnboardingForm, SessionRead

router = APIRouter()


@router.post("", response_model=SessionRead)
async def create_session(
    payload: OnboardingForm,
    db: AsyncSession = Depends(get_db),
):
    """Create a new client scoring session."""
    session = Session(
        sector=payload.sector,
        client_name=payload.client_name,
        relationship_level=payload.relationship_level,
        business_proximity=payload.business_proximity,
        capabilities=payload.capabilities,
        data_maturity=payload.data_maturity,
        strategic_objectives=payload.strategic_objectives,
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)
    return session
