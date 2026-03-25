"""Feedback endpoints — POST/GET /api/v1/feedback."""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db
from app.models.feedback import Feedback
from app.models.session import Session
from app.models.use_case import UseCase
from app.schemas.feedback import FeedbackListResponse, FeedbackRead, FeedbackUpsertRequest

router = APIRouter()


@router.post("", response_model=FeedbackRead)
async def upsert_feedback(
    payload: FeedbackUpsertRequest,
    db: AsyncSession = Depends(get_db),
):
    """Create or update feedback for a session/use_case pair."""
    session_result = await db.execute(select(Session).where(Session.id == payload.session_id))
    if not session_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Session not found")

    use_case_result = await db.execute(select(UseCase).where(UseCase.id == payload.use_case_id))
    if not use_case_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Use case not found")

    values = payload.model_dump()
    stmt = pg_insert(Feedback).values(**values)
    stmt = stmt.on_conflict_do_update(
        index_elements=["session_id", "use_case_id"],
        set_={
            "decision_status": stmt.excluded.decision_status,
            "confidence": stmt.excluded.confidence,
            "strategic_fit": stmt.excluded.strategic_fit,
            "business_value": stmt.excluded.business_value,
            "feasibility": stmt.excluded.feasibility,
            "time_to_value": stmt.excluded.time_to_value,
            "blockers": stmt.excluded.blockers,
            "rationale": stmt.excluded.rationale,
            "owner": stmt.excluded.owner,
            "next_step_date": stmt.excluded.next_step_date,
            "implemented": stmt.excluded.implemented,
            "kpi_name": stmt.excluded.kpi_name,
            "baseline_value": stmt.excluded.baseline_value,
            "current_value": stmt.excluded.current_value,
            "adoption_percent": stmt.excluded.adoption_percent,
            "satisfaction": stmt.excluded.satisfaction,
            "delivery_difficulty": stmt.excluded.delivery_difficulty,
            "risk_incidents": stmt.excluded.risk_incidents,
            "outcome_comment": stmt.excluded.outcome_comment,
            "updated_by": stmt.excluded.updated_by,
        },
    )

    await db.execute(stmt)
    await db.commit()

    result = await db.execute(
        select(Feedback).where(
            Feedback.session_id == payload.session_id,
            Feedback.use_case_id == payload.use_case_id,
        )
    )
    record = result.scalar_one()
    return record


@router.get("", response_model=FeedbackListResponse)
async def list_feedback(
    session_id: str = Query(description="Session id"),
    db: AsyncSession = Depends(get_db),
):
    """List all feedback records for a session."""
    result = await db.execute(
        select(Feedback).where(Feedback.session_id == session_id).order_by(Feedback.updated_at.desc())
    )
    items = list(result.scalars().all())
    return FeedbackListResponse(session_id=session_id, items=items)
