"""PDF export endpoints — GET /api/v1/export/pdf/{session_id}."""

from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_cache_service, get_db, get_llm_router
from app.models.session import Session
from app.services.cache_service import CacheService
from app.services.llm_router import LLMRouter
from app.services.pdf_service import generate_pdf

router = APIRouter()


@router.get("/pdf/{session_id}")
async def export_pdf(
    session_id: str,
    db: AsyncSession = Depends(get_db),
    cache: CacheService = Depends(get_cache_service),
    llm: LLMRouter = Depends(get_llm_router),
):
    """Generate and return a PDF report for a scoring session."""
    # 1. Load session
    result = await db.execute(select(Session).where(Session.id == session_id))
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # 2. Get cached scoring results
    score_cache_key = f"score:{session_id}"
    score_data = await cache.get(score_cache_key)
    if not score_data:
        raise HTTPException(
            status_code=400,
            detail="No scoring results found. Call POST /api/v1/score first.",
        )

    top10 = score_data.get("top_10", [])

    # 3. Generate executive summary via LLM
    summary = await llm.generate_report_summary(session, top10)

    # 4. Generate PDF (full WeasyPrint with DXC branding)
    pdf_bytes = await generate_pdf(
        session=session,
        top_10=top10,
        executive_summary=summary,
        db=db,
    )

    # 5. Return PDF response
    date_str = datetime.now(timezone.utc).strftime("%Y%m%d")
    filename = f"RadarTool_{session.client_name.replace(' ', '_')}_{date_str}.pdf"

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
