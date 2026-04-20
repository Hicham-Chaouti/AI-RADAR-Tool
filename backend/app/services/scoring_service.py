"""Scoring service — 4-criteria weighted formula + business rules adjustment."""

from __future__ import annotations

from app.models.use_case import UseCase
from app.models.session import Session
from app.schemas.scoring import ScoreBreakdown, RadarAxes, ScoringResult
from app.services.business_rules import BusinessRulesEngine
from app.utils.logger import get_logger

log = get_logger(__name__)

_rules = BusinessRulesEngine()

# ─── Weights ────────────────────────────────────────────────
W_TREND = 0.25
W_CLIENT = 0.30
W_CAPABILITY = 0.25
W_MOMENTUM = 0.20

# ─── Capability keyword mapping ────────────────────────────
CAPABILITY_KEYWORDS: dict[str, list[str]] = {
    "AI": ["machine learning", "ml", "ai", "model", "prediction"],
    "GenAI": ["llm", "generative", "gpt", "nlp", "language model"],
    "Computer Vision": ["computer vision", "image", "video", "ocr"],
    "Data": ["analytics", "data", "bi", "dashboard", "reporting"],
    "Cloud": ["cloud", "gcp", "aws", "azure", "kubernetes"],
    "Agentic AI": ["agent", "agentic", "autonomous", "orchestration"],
    "Dev": ["code", "development", "api", "integration", "devops"],
    "IoT": ["iot", "edge", "sensor", "embedded", "connected"],
    "ML": ["machine learning", "ml", "model", "training", "inference"],
    "NLP": ["nlp", "natural language", "text", "sentiment", "chatbot"],
    "RPA": ["rpa", "robotic", "automation", "workflow", "bot"],
    "Security": ["security", "compliance", "fraud", "threat", "soc"],
}


class ScoringEngine:
    """Computes radar_score for a use case given a client session context."""

    def score(
        self,
        use_case: UseCase,
        session: Session,
        cosine_similarity: float,
    ) -> ScoringResult:
        """
        Score a single use case against a session.

        cosine_similarity: from Qdrant search (0..1).
        """
        # ── trend_strength: from DB (archetype-based) ────────
        ts = use_case.trend_strength or 5

        # ── client_relevance: cosine similarity × 10 ─────────
        cr = round(min(10.0, cosine_similarity * 10), 1)

        # ── capability_match: keyword overlap ─────────────────
        cm = self._compute_capability_match(use_case, session)

        # ── market_momentum: from DB (archetype-based) ────────
        mm = use_case.market_momentum or 5

        # ── Weighted radar score ──────────────────────────────
        radar_score = round(
            ts * W_TREND + cr * W_CLIENT + cm * W_CAPABILITY + mm * W_MOMENTUM,
            2,
        )

        # ── Business rules adjustment (sector + archetype) ────
        rule_adj = round(_rules.compute_adjustment(use_case, session), 2)
        final_score = round(min(10.0, max(0.0, radar_score + rule_adj)), 2)

        return ScoringResult(
            rank=0,  # set by caller after sorting
            use_case_id=use_case.id,
            title=use_case.title,
            company_example=use_case.company_example,
            source_url=use_case.source_url,
            radar_score=final_score,
            score_breakdown=ScoreBreakdown(
                trend_strength=int(ts),
                client_relevance=int(round(cr)),
                capability_match=cm,
                market_momentum=int(mm),
                rule_adjustment=rule_adj,
            ),
            radar_axes=RadarAxes(
                roi_potential=use_case.roi_potential or 5,
                technical_complexity=use_case.technical_complexity or 5,
                market_maturity=use_case.market_maturity or 5,
                regulatory_risk=use_case.regulatory_risk or 5,
                quick_win_potential=use_case.quick_win_potential or 5,
            ),
        )

    def _compute_capability_match(self, use_case: UseCase, session: Session) -> int:
        """Count keyword matches between capabilities + strategic objectives and use case text.

        Objectives are weighted higher (2 pts each) than capability keywords (1 pt each)
        because they express the client's specific intent rather than generic tech stack.
        """
        user_caps = session.capabilities or []
        objectives = session.strategic_objectives or []

        if not user_caps and not objectives:
            return 5  # neutral default

        # Build searchable text from use case
        parts = [
            use_case.title or "",
            use_case.description or "",
            " ".join(use_case.tech_keywords or []),
            use_case.ai_solution or "",
            use_case.business_challenge or "",
        ]
        text = " ".join(parts).lower()

        # Capability keyword matching (1 pt per keyword hit)
        cap_score = 0
        for cap in user_caps:
            keywords = CAPABILITY_KEYWORDS.get(cap, [])
            for kw in keywords:
                if kw in text:
                    cap_score += 1

        # Objective term matching (2 pts per objective with at least one term hit)
        obj_score = 0
        for obj in objectives:
            meaningful_words = [w for w in obj.lower().split() if len(w) > 3]
            if meaningful_words and any(w in text for w in meaningful_words):
                obj_score += 2

        return min(10, cap_score + obj_score)
