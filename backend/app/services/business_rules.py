"""Business rules engine — sector alignment and archetype coherence bonuses.

Applies lightweight, deterministic adjustments on top of the semantic radar_score:

  final_score = radar_score + sector_bonus + archetype_bonus

Rules:
  - +1.5  if use case sector matches the client's sector
  -  0.0  if use case is cross-industry (neutral, applies everywhere)
  - -1.0  if use case sector clearly belongs to a different sector
  - +1.5  if use case archetype matches an archetype expected from objectives
"""

from __future__ import annotations

from app.models.session import Session
from app.models.use_case import UseCase

# ─── Sector keyword mapping ──────────────────────────────────────────────────
# Maps session sector IDs → substrings expected in use_case.sector (raw field).
# Keep terms lowercase; matching is substring-based.
SECTOR_KEYWORDS: dict[str, list[str]] = {
    "banking_finance":        ["bank", "financial", "finance", "fintech", "payment", "credit"],
    "healthcare":             ["health", "medical", "pharma", "clinical", "hospital", "life science"],
    "manufacturing":          ["manufactur", "industrial", "factory", "industry 4"],
    "retail_ecommerce":       ["retail", "ecommerce", "e-commerce", "consumer goods", "luxury retail"],
    "energy_utilities":       ["energy", "utility", "utilities", "power", "grid", "clean energy", "net zero"],
    "transportation_logistics":["transport", "logistics", "supply chain", "automotive", "mobility"],
    "telecom":                ["telecom", "telecommunication", "communication", "network", "mobile carrier"],
    "public_sector":          ["government", "public sector", "nonprofit", "public agency"],
    "media_entertainment":    ["media", "entertainment", "gaming", "content", "streaming", "sports"],
    "automotive_mobility":    ["automotive", "mobility", "vehicle", "fleet"],
    "education":              ["education", "edtech", "university", "learning", "academic"],
    "insurance":              ["insurance", "insur", "actuarial"],
    "travel_hospitality":     ["travel", "hospitality", "hotel", "airline", "tourism"],
    "cross_industry":         [],  # neutral — never triggers mismatch penalty
}

# ─── Objective → archetype hint mapping ─────────────────────────────────────
# Maps substrings found in session objectives → expected use case archetype.
# Longer phrases are matched before shorter ones (dict order preserved in Py3.7+).
OBJECTIVE_ARCHETYPE_HINTS: dict[str, str] = {
    "anti-money laundering":    "fraud_detection",
    "anti money laundering":    "fraud_detection",
    "predictive maintenance":   "predictive_maintenance",
    "asset uptime":             "predictive_maintenance",
    "contact center":           "customer_chatbot",
    "customer support":         "customer_chatbot",
    "virtual assistant":        "customer_chatbot",
    "supply chain":             "supply_chain_optimization",
    "quality control":          "quality_inspection",
    "defect detection":         "quality_inspection",
    "code generation":          "code_generation",
    "fraud":                    "fraud_detection",
    "aml":                      "fraud_detection",
    "maintenance":              "predictive_maintenance",
    "chatbot":                  "customer_chatbot",
    "document":                 "document_processing",
    "documentation":            "document_processing",
    "productivity":             "employee_productivity_genai",
    "knowledge":                "employee_productivity_genai",
    "summarization":            "employee_productivity_genai",
    "inventory":                "supply_chain_optimization",
    "logistics":                "supply_chain_optimization",
    "quality":                  "quality_inspection",
    "inspection":               "quality_inspection",
    "search":                   "ai_search_discovery",
    "discovery":                "ai_search_discovery",
    "security":                 "security_soc_automation",
    "compliance":               "fraud_detection",
    "soc":                      "security_soc_automation",
    "threat":                   "security_soc_automation",
    "code":                     "code_generation",
}

# ─── Bonus / penalty magnitudes ─────────────────────────────────────────────
_SECTOR_MATCH_BONUS    =  1.5
_SECTOR_MISMATCH_PENALTY = -1.0
_ARCHETYPE_MATCH_BONUS =  1.5


class BusinessRulesEngine:
    """Computes signed rule adjustments to add on top of the semantic radar_score."""

    def compute_adjustment(self, use_case: UseCase, session: Session) -> float:
        """Return a float in roughly [-1.0, +3.0] to add to radar_score."""
        return (
            self._sector_adjustment(use_case, session)
            + self._archetype_bonus(use_case, session)
        )

    # ── Sector alignment ──────────────────────────────────────────────────────

    def _sector_adjustment(self, use_case: UseCase, session: Session) -> float:
        uc_sector = (use_case.sector or "").lower().strip()
        session_sector = (session.sector or "").lower().strip()

        # Cross-industry use cases are sector-agnostic → neutral
        if not uc_sector or "cross" in uc_sector:
            return 0.0

        session_keywords = SECTOR_KEYWORDS.get(session_sector, [])

        # Positive match: use case sector contains a keyword of the client's sector
        if session_keywords and any(kw in uc_sector for kw in session_keywords):
            return _SECTOR_MATCH_BONUS

        # Negative match: use case sector clearly belongs to a *different* known sector
        for other_sector, keywords in SECTOR_KEYWORDS.items():
            if other_sector == session_sector or not keywords:
                continue
            if any(kw in uc_sector for kw in keywords):
                return _SECTOR_MISMATCH_PENALTY

        return 0.0  # unknown/unmapped sector → neutral

    # ── Archetype coherence ───────────────────────────────────────────────────

    def _archetype_bonus(self, use_case: UseCase, session: Session) -> float:
        uc_archetype = (use_case.archetype or "").lower().strip()
        if not uc_archetype:
            return 0.0

        objectives = session.strategic_objectives or []
        if not objectives:
            return 0.0

        obj_text = " ".join(objectives).lower()

        for hint, archetype in OBJECTIVE_ARCHETYPE_HINTS.items():
            if hint in obj_text and uc_archetype == archetype:
                return _ARCHETYPE_MATCH_BONUS

        return 0.0
