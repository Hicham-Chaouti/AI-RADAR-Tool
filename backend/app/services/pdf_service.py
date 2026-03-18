"""PDF service — Jinja2 + WeasyPrint with DXC branding."""

from __future__ import annotations

import asyncio
import re
from datetime import datetime, timezone
from pathlib import Path

from jinja2 import Environment, FileSystemLoader
from markupsafe import Markup
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from weasyprint import HTML

from app.models.use_case import UseCase
from app.utils.logger import get_logger

log = get_logger(__name__)

TEMPLATES_DIR = Path(__file__).resolve().parent.parent.parent / "templates"


def _md_to_html(text: str | None) -> str:
    """Convert basic Markdown bold/italic to HTML."""
    if not text:
        return text or ""
    text = re.sub(r"\*\*(.*?)\*\*", r"<strong>\1</strong>", text)
    text = re.sub(r"\*(.*?)\*", r"<em>\1</em>", text)
    return Markup(text)


async def generate_pdf(
    session,
    top_10: list[dict],
    executive_summary: str,
    db: AsyncSession,
) -> bytes:
    """Generate a branded PDF report with cover, summary, table, and detail sheets."""

    # 1. Load full use case details from PostgreSQL
    uc_ids = [item["use_case_id"] for item in top_10]
    result = await db.execute(select(UseCase).where(UseCase.id.in_(uc_ids)))
    uc_map = {uc.id: uc for uc in result.scalars().all()}

    # 2. Merge scoring results with DB details
    top_10_with_details = []
    for item in top_10:
        uc = uc_map.get(item["use_case_id"])
        entry = {
            "rank": item.get("rank", 0),
            "title": item.get("title", ""),
            "use_case_id": item.get("use_case_id", ""),
            "radar_score": item.get("radar_score", 0),
            "justification": _md_to_html(item.get("justification", "")),
            "archetype": uc.archetype if uc else "",
            "company_example": uc.company_example if uc else "",
            "description": uc.description if uc else "",
            "business_challenge": uc.business_challenge if uc else "",
            "ai_solution": uc.ai_solution if uc else "",
            "benefits": uc.benefits if uc else [],
            "data_prerequisites": uc.data_prerequisites if uc else [],
            "source_url": uc.source_url if uc else "",
            "source_name": uc.source_name if uc else "",
            "quick_win": uc.quick_win if uc else False,
            "scores": {
                "trend_strength": item.get("score_breakdown", {}).get("trend_strength", 0),
                "client_relevance": item.get("score_breakdown", {}).get("client_relevance", 0),
                "capability_match": item.get("score_breakdown", {}).get("capability_match", 0),
                "market_momentum": item.get("score_breakdown", {}).get("market_momentum", 0),
            },
        }
        top_10_with_details.append(entry)

    # 3. Prepare Jinja2 context
    context = {
        "client_name": session.client_name,
        "sector": session.sector,
        "generated_date": datetime.now(timezone.utc).strftime("%d %B %Y"),
        "executive_summary": _md_to_html(executive_summary),
        "top_10": top_10_with_details,
        "top_score": top_10[0]["radar_score"] if top_10 else 0,
        "quick_win_count": sum(1 for uc in top_10_with_details if uc.get("quick_win")),
        "total_analyzed": 1068,
    }

    # 4. Render HTML via Jinja2
    env = Environment(loader=FileSystemLoader(str(TEMPLATES_DIR)))
    template = env.get_template("pdf_report.html")
    html_content = template.render(**context)

    # 5. Generate PDF via WeasyPrint (blocking — run in thread)
    def _render():
        return HTML(
            string=html_content,
            base_url=str(TEMPLATES_DIR),
        ).write_pdf()

    log.info(
        f"Generating PDF for {session.client_name}",
        extra={"task": "pdf_export"},
    )
    pdf_bytes = await asyncio.to_thread(_render)

    log.info(
        f"PDF generated: {len(pdf_bytes)} bytes",
        extra={"task": "pdf_export"},
    )
    return pdf_bytes
