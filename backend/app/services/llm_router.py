"""LLM Router — Mistral Small for justifications + report summaries."""

from __future__ import annotations

import asyncio
import json
import re
import time

from mistralai.client import Mistral

from app.config import settings
from app.models.use_case import UseCase
from app.models.session import Session
from app.prompts.justification import JUSTIFICATION_PROMPT
from app.prompts.report_summary import REPORT_SUMMARY_PROMPT
from app.services.cache_service import CacheService
from app.utils.logger import get_logger

log = get_logger(__name__)

LLM_MODEL = "mistral-small-latest"


class LLMRouter:
    """Routes LLM calls to Mistral, with Redis caching."""

    def __init__(self, cache: CacheService) -> None:
        self._cache = cache
        api_key = settings.MISTRAL_API_KEY
        self._client = Mistral(api_key=api_key) if api_key else None

    async def generate_justification(
        self,
        use_case: UseCase,
        session: Session,
    ) -> str:
        """Generate a 2-3 sentence justification. Cached per use_case + sector."""
        cache_key = f"justif:{use_case.id}:{session.sector}"

        # Check cache first
        cached = await self._cache.get(cache_key)
        if cached:
            log.info(
                "Justification cache hit",
                extra={"use_case_id": use_case.id, "cache_hit": True, "task": "justification"},
            )
            return cached.get("text", "")

        if not self._client:
            return "Justification unavailable (no LLM API key configured)."

        prompt = JUSTIFICATION_PROMPT.format(
            sector=session.sector,
            capabilities=", ".join(session.capabilities or []),
            objectives=", ".join(session.strategic_objectives or []),
            title=use_case.title,
            description=use_case.description or "",
            company_example=use_case.company_example or "N/A",
            measurable_benefit=use_case.measurable_benefit or "N/A",
            archetype=use_case.archetype or "N/A",
        )

        start = time.time()
        response = await asyncio.to_thread(
            self._client.chat.complete,
            model=LLM_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
        )
        latency = int((time.time() - start) * 1000)
        text = (response.choices[0].message.content or "").strip()
        tokens = getattr(response.usage, "total_tokens", 0)

        log.info(
            "Justification generated",
            extra={
                "use_case_id": use_case.id,
                "model": LLM_MODEL,
                "task": "justification",
                "tokens": tokens,
                "cache_hit": False,
                "latency_ms": latency,
            },
        )

        # Cache for 1h
        await self._cache.set(cache_key, {"text": text}, ttl=3600)
        return text

    async def anonymize_use_case(
        self,
        title: str,
        description: str,
    ) -> dict:
        """LLM-based anonymization of custom product/solution names. Cached per title hash."""
        from app.prompts.anonymize_use_case import ANONYMIZE_PROMPT
        import hashlib

        content_hash = hashlib.sha256(f"{title}||{description}".encode()).hexdigest()[:16]
        cache_key = f"anonymize:v1:{content_hash}"

        cached = await self._cache.get(cache_key)
        if isinstance(cached, dict) and cached.get("title"):
            log.info("Anonymize cache hit", extra={"cache_hit": True, "task": "anonymize"})
            return cached

        if not self._client:
            return {"title": title, "description": description}

        prompt = ANONYMIZE_PROMPT.format(title=title, description=description)

        start = time.time()
        try:
            response = await asyncio.to_thread(
                self._client.chat.complete,
                model=LLM_MODEL,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.1,
            )
            latency = int((time.time() - start) * 1000)
            raw = (response.choices[0].message.content or "").strip()
            tokens = getattr(response.usage, "total_tokens", 0)

            raw = re.sub(r"^```[a-z]*\n?", "", raw)
            raw = re.sub(r"\n?```$", "", raw).strip()

            data = json.loads(raw)

            log.info(
                "Anonymization complete",
                extra={"model": LLM_MODEL, "task": "anonymize", "tokens": tokens, "latency_ms": latency},
            )

            await self._cache.set(cache_key, data, ttl=86400)
            return data
        except Exception as exc:
            log.warning("Anonymization failed", extra={"error": str(exc)})
            return {"title": title, "description": description}

    async def generate_roadmap(
        self,
        use_case: UseCase,
        sector: str,
    ) -> dict:
        """Generate a structured implementation roadmap. Cached per use_case + sector (24h)."""
        from app.prompts.roadmap import ROADMAP_PROMPT

        cache_key = f"roadmap:v5:{use_case.id}:{sector}"
        cached = await self._cache.get(cache_key)
        if isinstance(cached, dict) and cached.get("roadmap"):
            log.info(
                "Roadmap cache hit",
                extra={"use_case_id": use_case.id, "cache_hit": True, "task": "roadmap"},
            )
            return cached

        if not self._client:
            return _empty_roadmap(use_case.title)

        prompt = ROADMAP_PROMPT.format(
            title=use_case.title,
            sector=sector,
            description=use_case.description or "",
            ai_solution=use_case.ai_solution or "",
            business_challenge=use_case.business_challenge or "",
            measurable_benefit=use_case.measurable_benefit or "",
        )

        start = time.time()
        try:
            response = await asyncio.to_thread(
                self._client.chat.complete,
                model=LLM_MODEL,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,
            )
            latency = int((time.time() - start) * 1000)
            raw = (response.choices[0].message.content or "").strip()
            tokens = getattr(response.usage, "total_tokens", 0)

            # Strip markdown fences if the model wrapped the JSON
            raw = re.sub(r"^```[a-z]*\n?", "", raw)
            raw = re.sub(r"\n?```$", "", raw).strip()

            data = json.loads(raw)

            log.info(
                "Roadmap generated",
                extra={
                    "use_case_id": use_case.id,
                    "model": LLM_MODEL,
                    "task": "roadmap",
                    "tokens": tokens,
                    "cache_hit": False,
                    "latency_ms": latency,
                },
            )

            await self._cache.set(cache_key, data, ttl=86400)  # 24h
            return data
        except Exception as exc:
            log.warning("Roadmap generation failed", extra={"use_case_id": use_case.id, "error": str(exc)})
            return _empty_roadmap(use_case.title)

    async def generate_report_summary(
        self,
        session: Session,
        top10: list[dict],
    ) -> str:
        """Generate an executive summary for the PDF report. Cached per session."""
        cache_key = f"summary:{session.id}"

        cached = await self._cache.get(cache_key)
        if cached:
            log.info(
                "Report summary cache hit",
                extra={"session_id": str(session.id), "cache_hit": True, "task": "report_summary"},
            )
            return cached.get("text", "")

        if not self._client:
            return "Summary unavailable (no LLM API key configured)."

        top3_titles = ", ".join(uc.get("title", "?") for uc in top10[:3])
        top_score = max((uc.get("radar_score", 0) for uc in top10), default=0)

        prompt = REPORT_SUMMARY_PROMPT.format(
            client_name=session.client_name,
            sector=session.sector,
            top3_titles=top3_titles,
            top_score=f"{top_score:.1f}",
        )

        start = time.time()
        response = await asyncio.to_thread(
            self._client.chat.complete,
            model=LLM_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
        )
        latency = int((time.time() - start) * 1000)
        text = (response.choices[0].message.content or "").strip()
        tokens = getattr(response.usage, "total_tokens", 0)

        log.info(
            "Report summary generated",
            extra={
                "session_id": str(session.id),
                "model": LLM_MODEL,
                "task": "report_summary",
                "tokens": tokens,
                "cache_hit": False,
                "latency_ms": latency,
            },
        )

        await self._cache.set(cache_key, {"text": text}, ttl=3600)
        return text


def _empty_roadmap(title: str) -> dict:
    return {
        "use_case_title": title,
        "objective": "Roadmap unavailable — LLM service not configured.",
        "business_value": [],
        "roadmap": [],
        "estimated_timeline": "N/A",
        "risks_and_mitigations": [],
    }
