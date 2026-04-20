"""
Post-processing enrichment for seed_use_cases.json.

Usage:
    python scripts/enrich_use_cases.py              # full enrichment
    python scripts/enrich_use_cases.py --only-unscored  # rescore unscored only

Input:  backend/data/seed_use_cases.json
Output: backend/data/seed_use_cases_enriched.json

Tasks:
    1. Uniformize attributes (ensure all fields present)
    2. Fix company-name titles via Mistral
    3. Add benefits + tools_and_technologies
    4. Score by archetype (keyword matching)

Resumable: saves checkpoint after every batch of LLM calls.
If interrupted, rerun and it picks up where it left off.
"""

from __future__ import annotations

import argparse
import asyncio
import json
import logging
import os
import re
import sys
import time
from pathlib import Path
from typing import Any

from dotenv import load_dotenv
from mistralai.client import Mistral

# Load .env from project root
load_dotenv(Path(__file__).resolve().parent.parent.parent / ".env")

# ─── Paths ──────────────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
SEED_FILE = DATA_DIR / "seed_use_cases.json"
ENRICHED_FILE = DATA_DIR / "seed_use_cases_enriched.json"

# ─── Logging ────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-7s | %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("enrich_use_cases")

# ─── LLM ────────────────────────────────────────────────────
LLM_MODEL = "mistral-small-latest"
LLM_DELAY = 2  # seconds between LLM calls
CHECKPOINT_EVERY = 10  # save to disk every N LLM calls

# ─── Target schema (all fields a use case must have) ────────
TARGET_SCHEMA: dict[str, Any] = {
    "id": None,
    "title": None,
    "description": None,
    "sector": None,
    "sector_normalized": None,
    "functions": None,
    "agent_type": None,
    "company_example": None,
    "business_challenge": None,
    "ai_solution": None,
    "measurable_benefit": None,
    "tech_keywords": None,
    "source_url": None,
    "source_name": None,
    "scrape_date": None,
    "benefits": None,
    "tools_and_technologies": None,
    "trend_strength": None,
    "client_relevance": None,
    "capability_match": None,
    "market_momentum": None,
    "roi_potential": None,
    "technical_complexity": None,
    "market_maturity": None,
    "regulatory_risk": None,
    "quick_win_potential": None,
    "weighted_score": None,
    "estimated_roi": None,
    "complexity_level": None,
    "quick_win": None,
}

# ─── Archetype scores ──────────────────────────────────────
ARCHETYPE_SCORES = {
    "employee_productivity_genai": {"ts": 10, "cr": 9, "cm": 8, "mm": 10, "rp": 8, "tc": 2, "ma": 9, "rr": 3, "qwp": 10, "ws": 9.0},
    "code_generation": {"ts": 10, "cr": 8, "cm": 9, "mm": 10, "rp": 8, "tc": 2, "ma": 10, "rr": 4, "qwp": 10, "ws": 8.9},
    "marketing_creative_genai": {"ts": 10, "cr": 9, "cm": 8, "mm": 10, "rp": 8, "tc": 3, "ma": 8, "rr": 5, "qwp": 9, "ws": 8.95},
    "document_processing": {"ts": 9, "cr": 9, "cm": 9, "mm": 9, "rp": 9, "tc": 3, "ma": 9, "rr": 4, "qwp": 9, "ws": 9.0},
    "customer_chatbot": {"ts": 9, "cr": 9, "cm": 9, "mm": 9, "rp": 8, "tc": 4, "ma": 9, "rr": 4, "qwp": 9, "ws": 8.8},
    "contact_center_ai": {"ts": 9, "cr": 9, "cm": 9, "mm": 9, "rp": 8, "tc": 4, "ma": 9, "rr": 5, "qwp": 8, "ws": 8.8},
    "ai_search_discovery": {"ts": 8, "cr": 8, "cm": 9, "mm": 8, "rp": 8, "tc": 4, "ma": 8, "rr": 2, "qwp": 9, "ws": 8.2},
    "recommendation_engine": {"ts": 8, "cr": 9, "cm": 10, "mm": 8, "rp": 9, "tc": 4, "ma": 10, "rr": 3, "qwp": 8, "ws": 8.8},
    "fraud_detection": {"ts": 9, "cr": 9, "cm": 9, "mm": 9, "rp": 9, "tc": 6, "ma": 9, "rr": 7, "qwp": 6, "ws": 8.8},
    "security_soc_automation": {"ts": 9, "cr": 9, "cm": 8, "mm": 9, "rp": 9, "tc": 7, "ma": 8, "rr": 5, "qwp": 6, "ws": 8.8},
    "data_analytics_nl_sql": {"ts": 8, "cr": 8, "cm": 8, "mm": 8, "rp": 7, "tc": 4, "ma": 8, "rr": 3, "qwp": 8, "ws": 7.8},
    "predictive_maintenance": {"ts": 8, "cr": 8, "cm": 9, "mm": 8, "rp": 8, "tc": 6, "ma": 8, "rr": 2, "qwp": 6, "ws": 8.1},
    "demand_forecasting": {"ts": 8, "cr": 7, "cm": 9, "mm": 8, "rp": 8, "tc": 5, "ma": 8, "rr": 1, "qwp": 7, "ws": 7.9},
    "supply_chain_optimization": {"ts": 8, "cr": 8, "cm": 8, "mm": 8, "rp": 8, "tc": 6, "ma": 7, "rr": 2, "qwp": 6, "ws": 7.9},
    "dynamic_pricing": {"ts": 8, "cr": 7, "cm": 8, "mm": 8, "rp": 9, "tc": 6, "ma": 7, "rr": 5, "qwp": 6, "ws": 8.0},
    "clinical_documentation": {"ts": 9, "cr": 8, "cm": 9, "mm": 9, "rp": 8, "tc": 5, "ma": 7, "rr": 8, "qwp": 7, "ws": 8.5},
    "medical_ai_diagnostics": {"ts": 9, "cr": 7, "cm": 8, "mm": 9, "rp": 9, "tc": 9, "ma": 6, "rr": 9, "qwp": 2, "ws": 8.3},
    "legal_ai": {"ts": 8, "cr": 7, "cm": 9, "mm": 8, "rp": 9, "tc": 4, "ma": 6, "rr": 6, "qwp": 8, "ws": 8.15},
    "hr_automation": {"ts": 7, "cr": 8, "cm": 7, "mm": 7, "rp": 7, "tc": 4, "ma": 7, "rr": 8, "qwp": 7, "ws": 7.3},
    "financial_research_automation": {"ts": 8, "cr": 7, "cm": 8, "mm": 8, "rp": 8, "tc": 5, "ma": 6, "rr": 7, "qwp": 6, "ws": 7.75},
    "public_service_ai": {"ts": 7, "cr": 7, "cm": 8, "mm": 7, "rp": 7, "tc": 5, "ma": 6, "rr": 7, "qwp": 6, "ws": 7.25},
    "education_ai": {"ts": 8, "cr": 7, "cm": 8, "mm": 8, "rp": 7, "tc": 4, "ma": 6, "rr": 7, "qwp": 7, "ws": 7.5},
    "digital_twin_simulation": {"ts": 8, "cr": 6, "cm": 7, "mm": 8, "rp": 8, "tc": 9, "ma": 6, "rr": 2, "qwp": 3, "ws": 7.4},
    "environmental_disaster_ai": {"ts": 7, "cr": 5, "cm": 7, "mm": 7, "rp": 7, "tc": 7, "ma": 4, "rr": 2, "qwp": 3, "ws": 6.5},
    "cross_industry_ai": {"ts": 7, "cr": 7, "cm": 7, "mm": 7, "rp": 7, "tc": 5, "ma": 7, "rr": 3, "qwp": 6, "ws": 7.0},
}

# ─── Keyword mapping for archetype classification ──────────
KEYWORD_MAPPING = {
    "employee_productivity_genai": [
        "employee productivity", "workplace", "internal assistant",
        "enterprise assistant", "knowledge worker", "copilot", "summarization",
        "automation", "workflow", "efficiency", "ai platform",
        "business process", "transformation", "productivity",
    ],
    "code_generation": [
        "code", "developer", "software", "programming", "github",
        "debugging", "devops", "cicd",
    ],
    "marketing_creative_genai": [
        "marketing", "creative", "content generation", "campaign",
        "advertising", "copywriting", "brand", "social media",
    ],
    "document_processing": [
        "document", "invoice", "contract", "ocr", "extraction",
        "classification", "idp", "intelligent document",
    ],
    "customer_chatbot": [
        "chatbot", "virtual assistant", "conversational", "chat",
        "customer service bot", "faq", "self-service",
        "customer experience", "cx", "engagement", "interaction",
        "service", "support",
    ],
    "contact_center_ai": [
        "contact center", "call center", "agent assist", "ccai",
        "customer support", "helpdesk", "ivr",
    ],
    "ai_search_discovery": [
        "search", "discovery", "semantic search", "knowledge base",
        "enterprise search", "information retrieval",
        "insight", "intelligence platform", "data platform",
        "knowledge", "information", "query",
    ],
    "recommendation_engine": [
        "recommendation", "personalization", "next best action",
        "nba", "product recommendation", "collaborative filtering",
    ],
    "fraud_detection": [
        "fraud", "anomaly detection", "transaction monitoring",
        "aml", "anti-money laundering", "risk scoring",
    ],
    "security_soc_automation": [
        "security", "soc", "threat detection", "cybersecurity",
        "intrusion", "siem", "vulnerability",
    ],
    "data_analytics_nl_sql": [
        "analytics", "business intelligence", "nl2sql", "natural language query",
        "data insights", "dashboard", "reporting",
        "analytics platform", "visualization", "metrics", "kpi", "performance",
    ],
    "predictive_maintenance": [
        "predictive maintenance", "equipment failure", "iot sensor",
        "asset health", "downtime prediction", "condition monitoring",
    ],
    "demand_forecasting": [
        "demand forecasting", "inventory", "replenishment",
        "sales forecast", "stock optimization",
    ],
    "supply_chain_optimization": [
        "supply chain", "logistics", "warehouse", "routing",
        "last mile", "procurement",
    ],
    "dynamic_pricing": [
        "pricing", "dynamic pricing", "revenue management",
        "yield management", "price optimization",
    ],
    "clinical_documentation": [
        "clinical", "ehr", "medical documentation", "ambient",
        "physician", "nurse", "prior authorization", "clinical notes",
    ],
    "medical_ai_diagnostics": [
        "diagnostic", "radiology", "pathology", "medical imaging",
        "disease detection", "drug discovery", "genomics",
    ],
    "legal_ai": [
        "legal", "contract review", "ediscovery", "compliance review",
        "due diligence", "regulatory filing",
    ],
    "hr_automation": [
        "hr", "human resources", "recruiting", "onboarding",
        "talent", "payroll", "workforce",
    ],
    "financial_research_automation": [
        "financial research", "investment", "portfolio", "trading",
        "market analysis", "risk management", "esg reporting",
    ],
    "public_service_ai": [
        "government", "public service", "citizen", "municipal",
        "tax", "benefits", "public sector",
    ],
    "education_ai": [
        "education", "learning", "student", "tutoring",
        "e-learning", "assessment", "curriculum",
    ],
    "digital_twin_simulation": [
        "digital twin", "simulation", "virtual model",
        "3d model", "physics simulation", "factory simulation",
    ],
    "environmental_disaster_ai": [
        "environment", "climate", "sustainability", "carbon",
        "disaster", "weather", "wildfire", "flood",
    ],
}

# Words indicating a proper AI use-case title (not a company name)
AI_ACTION_WORDS = [
    "automat", "detect", "optimi", "generat", "analy", "predict",
    "monitor", "classif", "recommend", "process", "assistant",
    "search", "forecast", "extract", "transform", "recogni",
    "segment", "personali", "translat", "summar", "chatbot",
    "virtual", "real-time", "ai-powered", "intelligent", "smart",
    "machine learning", "deep learning", "nlp", "computer vision",
]


def repair_json(text: str) -> str:
    """Fix common JSON issues from LLM output."""
    text = text.strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[1] if "\n" in text else text[3:]
    if text.endswith("```"):
        text = text[:-3].strip()
    if text.startswith("json"):
        text = text[4:].strip()
    text = re.sub(r",\s*([}\]])", r"\1", text)
    return text


def save_checkpoint(records: list[dict[str, Any]]) -> None:
    """Save current state to enriched file."""
    ENRICHED_FILE.write_text(
        json.dumps(records, indent=2, ensure_ascii=False, default=str),
        encoding="utf-8",
    )


# ═══════════════════════════════════════════════════════════
# TASK 1 — Uniformize attributes
# ═══════════════════════════════════════════════════════════
def uniformize_attributes(records: list[dict[str, Any]]) -> int:
    """Ensure every record has all target schema fields. Returns count of fields added."""
    fields_added = 0
    for record in records:
        for field, default in TARGET_SCHEMA.items():
            if field not in record:
                record[field] = default
                fields_added += 1
    return fields_added


# ═══════════════════════════════════════════════════════════
# TASK 2 — Fix company-name titles
# ═══════════════════════════════════════════════════════════
def title_looks_like_company(record: dict[str, Any]) -> bool:
    """Check if a title is likely a company name rather than a use-case title."""
    title = (record.get("title") or "").strip()
    if not title:
        return False

    # Already fixed in a previous run
    if record.get("original_title"):
        return False

    # If title matches company_example exactly
    company = (record.get("company_example") or "").strip()
    if company and title.lower() == company.lower():
        return True

    # If title is very short (1-3 words) and has no AI action words
    title_lower = title.lower()
    word_count = len(title.split())
    if word_count <= 3:
        has_action = any(w in title_lower for w in AI_ACTION_WORDS)
        if not has_action:
            return True

    return False


async def fix_company_titles(
    records: list[dict[str, Any]], mistral_client: Mistral
) -> int:
    """Fix titles that are company names. Returns count of titles fixed."""
    titles_to_fix = [(i, r) for i, r in enumerate(records) if title_looks_like_company(r)]
    log.info(f"  Found {len(titles_to_fix)} titles that need fixing")

    if not titles_to_fix:
        return 0

    fixed_count = 0
    llm_calls = 0
    for idx, (i, record) in enumerate(titles_to_fix):
        prompt = f"""Generate a concise, professional AI use case title (5-8 words max)
based on this description. The title must describe WHAT the AI does,
not WHO uses it.

Company: {record.get('company_example') or record.get('title')}
Description: {record.get('description', '')}
AI Solution: {record.get('ai_solution', '')}

Rules:
- Start with an action word (Automated, AI-powered, Real-time, etc.)
- Describe the business function, not the company
- Return ONLY the title, nothing else
- Examples of good titles:
  "Automated Customer Service with Conversational AI"
  "Real-time Fraud Detection Using ML"
  "AI-Powered Inventory Demand Forecasting"
"""
        try:
            response = await asyncio.to_thread(
                mistral_client.chat.complete,
                model=LLM_MODEL,
                messages=[{"role": "user", "content": prompt}],
                temperature=0,
            )
            new_title = (response.choices[0].message.content or "").strip().strip('"\'')
            if new_title and len(new_title) > 5:
                record["original_title"] = record["title"]
                record["title"] = new_title
                fixed_count += 1
                if fixed_count <= 5 or fixed_count % 50 == 0:
                    log.info(f"  [{fixed_count}/{len(titles_to_fix)}] '{record['original_title']}' -> '{new_title}'")
        except Exception as e:
            log.warning(f"  Failed to fix title for record {i}: {e}")

        llm_calls += 1
        if llm_calls % CHECKPOINT_EVERY == 0:
            save_checkpoint(records)
            log.info(f"  Checkpoint saved ({llm_calls}/{len(titles_to_fix)} titles processed)")

        if idx < len(titles_to_fix) - 1:
            await asyncio.sleep(LLM_DELAY)

    save_checkpoint(records)
    return fixed_count


# ═══════════════════════════════════════════════════════════
# TASK 3 — Add benefits + tools_and_technologies
# ═══════════════════════════════════════════════════════════
def add_benefits(records: list[dict[str, Any]]) -> int:
    """Convert measurable_benefit to benefits list. Returns count added."""
    count = 0
    for record in records:
        mb = record.get("measurable_benefit")
        if mb and str(mb).strip():
            record["benefits"] = [str(mb).strip()]
            count += 1
        elif not record.get("benefits"):
            record["benefits"] = None
    return count


async def add_tools_and_technologies(
    records: list[dict[str, Any]], mistral_client: Mistral
) -> int:
    """Add tools_and_technologies via Mistral. Skips already-enriched records. Returns count added."""
    # Count how many already have prerequisites (from a previous run)
    already_done = sum(1 for r in records if r.get("tools_and_technologies"))
    if already_done:
        log.info(f"  {already_done} records already have tools_and_technologies (resuming)")

    count = already_done
    total = len(records)
    llm_calls = 0

    for idx, record in enumerate(records):
        # Skip if already enriched
        if record.get("tools_and_technologies"):
            continue

        tech_kw = record.get("tech_keywords") or []
        prompt = f"""Based on this AI use case, list 2-4 realistic data prerequisites
needed to implement it. Be specific and technical.

Title: {record.get('title', '')}
Description: {record.get('description', '')}
Tech keywords: {', '.join(tech_kw) if tech_kw else 'N/A'}

Rules:
- Only list data/infrastructure that is obviously required
- Do NOT invent specific numbers or volumes
- Format: short noun phrases (e.g. "Historical transaction data",
  "Real-time sensor stream", "Labeled training dataset")
- Return ONLY a JSON array of strings, nothing else
- Maximum 4 items
"""
        try:
            response = await asyncio.to_thread(
                mistral_client.chat.complete,
                model=LLM_MODEL,
                messages=[{"role": "user", "content": prompt}],
                response_format={"type": "json_object"},
                temperature=0,
            )
            content = repair_json(response.choices[0].message.content or "")
            parsed = json.loads(content)

            if isinstance(parsed, list):
                prereqs = [str(p) for p in parsed[:4]]
            elif isinstance(parsed, dict):
                prereqs = None
                for key in ("tools_and_technologies", "prerequisites", "data", "items"):
                    if key in parsed and isinstance(parsed[key], list):
                        prereqs = [str(p) for p in parsed[key][:4]]
                        break
            else:
                prereqs = None

            if prereqs:
                record["tools_and_technologies"] = prereqs
                count += 1

        except Exception as e:
            if llm_calls < 5:
                log.warning(f"  Failed tools_and_technologies for '{record.get('title', '?')[:40]}': {e}")

        llm_calls += 1
        if llm_calls % CHECKPOINT_EVERY == 0:
            save_checkpoint(records)

        if llm_calls % 100 == 0:
            log.info(f"  tools_and_technologies: {llm_calls} LLM calls done, {count}/{total} enriched")

        await asyncio.sleep(LLM_DELAY)

    save_checkpoint(records)
    return count


# ═══════════════════════════════════════════════════════════
# TASK 4 — Score by archetype
# ═══════════════════════════════════════════════════════════
def classify_archetype(record: dict[str, Any]) -> str | None:
    """Classify a use case into an archetype via keyword matching."""
    parts = [
        record.get("title", ""),
        record.get("description", ""),
        " ".join(record.get("functions") or []),
        " ".join(record.get("tech_keywords") or []),
        record.get("ai_solution", "") or "",
        record.get("business_challenge", "") or "",
    ]
    text = " ".join(parts).lower()

    best_archetype = None
    best_score = 0

    for archetype, keywords in KEYWORD_MAPPING.items():
        score = sum(1 for kw in keywords if kw in text)
        if score > best_score:
            best_score = score
            best_archetype = archetype

    if best_score >= 1:
        return best_archetype
    # Fallback: assign cross_industry_ai to any unmatched use case
    return "cross_industry_ai"


def apply_archetype_scores(records: list[dict[str, Any]]) -> tuple[int, dict[str, int]]:
    """Apply scores based on archetype classification. Returns (scored_count, archetype_counts)."""
    scored = 0
    archetype_counts: dict[str, int] = {}

    score_field_map = {
        "ts": "trend_strength",
        "cr": "client_relevance",
        "cm": "capability_match",
        "mm": "market_momentum",
        "rp": "roi_potential",
        "tc": "technical_complexity",
        "ma": "market_maturity",
        "rr": "regulatory_risk",
        "qwp": "quick_win_potential",
        "ws": "weighted_score",
    }

    for record in records:
        archetype = classify_archetype(record)
        record["archetype"] = archetype

        if archetype and archetype in ARCHETYPE_SCORES:
            scores = ARCHETYPE_SCORES[archetype]
            for short_key, full_key in score_field_map.items():
                record[full_key] = scores[short_key]

            rp = scores["rp"]
            tc = scores["tc"]
            qwp = scores["qwp"]

            record["estimated_roi"] = "High" if rp >= 9 else ("Medium" if rp >= 7 else "Low")

            if tc <= 3:
                record["complexity_level"] = "Low"
            elif tc <= 5:
                record["complexity_level"] = "Medium"
            elif tc <= 7:
                record["complexity_level"] = "High"
            else:
                record["complexity_level"] = "Very High"

            record["quick_win"] = qwp >= 7

            scored += 1
            archetype_counts[archetype] = archetype_counts.get(archetype, 0) + 1

    return scored, archetype_counts


# ═══════════════════════════════════════════════════════════
# MAIN — Resumable orchestrator
# ═══════════════════════════════════════════════════════════
async def main() -> None:
    parser = argparse.ArgumentParser(description="Enrich AI use cases")
    parser.add_argument(
        "--only-unscored",
        action="store_true",
        help="Only re-score records that have no archetype match (skip Tasks 1-3)",
    )
    args = parser.parse_args()

    start = time.time()

    # Load from checkpoint if it exists, otherwise from seed
    if ENRICHED_FILE.exists():
        records = json.loads(ENRICHED_FILE.read_text(encoding="utf-8"))
        already_enriched = sum(1 for r in records if r.get("tools_and_technologies"))
        log.info(f"Resuming from checkpoint: {len(records)} records ({already_enriched} already have tools_and_technologies)")
    elif SEED_FILE.exists():
        records = json.loads(SEED_FILE.read_text(encoding="utf-8"))
        log.info(f"Starting fresh: loaded {len(records)} use cases from {SEED_FILE.name}")
    else:
        log.error(f"Input file not found: {SEED_FILE}")
        sys.exit(1)

    total = len(records)

    if args.only_unscored:
        # ── Fast path: only re-score by archetype ──
        log.info(f"\n{'=' * 60}")
        log.info("MODE: --only-unscored (re-scoring archetypes only)")
        log.info(f"{'=' * 60}")

        scored_count, archetype_counts = apply_archetype_scores(records)
        save_checkpoint(records)

        unscored = total - scored_count
        duration = time.time() - start

        log.info(f"\n{'=' * 60}")
        log.info("RESCORE REPORT")
        log.info(f"{'=' * 60}")
        log.info(f"  Total use cases: {total}")
        log.info(f"  Scored by archetype: {scored_count}/{total} ({scored_count/total*100:.1f}%)")
        log.info(f"  Unscored: {unscored}")
        log.info(f"  Duration: {duration:.1f}s")
        log.info(f"  Output: {ENRICHED_FILE}")
        log.info(f"")
        log.info("  Archetype distribution:")
        for arch, cnt in sorted(archetype_counts.items(), key=lambda x: -x[1]):
            log.info(f"    {arch}: {cnt}")
        return

    # Init Mistral client
    api_key = os.getenv("MISTRAL_API_KEY", "")
    if not api_key:
        log.error("MISTRAL_API_KEY not set in .env")
        sys.exit(1)
    mistral_client = Mistral(api_key=api_key)

    # ── TASK 1: Uniformize attributes (always rerun, instant) ──
    log.info(f"\n{'=' * 60}")
    log.info("TASK 1: Uniformizing attributes")
    log.info(f"{'=' * 60}")
    fields_added = uniformize_attributes(records)
    log.info(f"  Added {fields_added} missing fields across {total} records")
    save_checkpoint(records)

    # ── TASK 2: Fix company-name titles (skips already fixed) ──
    log.info(f"\n{'=' * 60}")
    log.info("TASK 2: Fixing company-name titles")
    log.info(f"{'=' * 60}")
    titles_fixed = await fix_company_titles(records, mistral_client)
    log.info(f"  Fixed {titles_fixed} titles")

    # ── TASK 3: Add benefits + tools_and_technologies ──
    log.info(f"\n{'=' * 60}")
    log.info("TASK 3: Adding benefits + tools_and_technologies")
    log.info(f"{'=' * 60}")
    benefits_count = add_benefits(records)
    log.info(f"  Benefits added: {benefits_count} (from measurable_benefit)")
    save_checkpoint(records)
    log.info("  Starting tools_and_technologies enrichment (LLM calls)...")
    prereqs_count = await add_tools_and_technologies(records, mistral_client)
    log.info(f"  Data prerequisites total: {prereqs_count}/{total}")

    # ── TASK 4: Score by archetype (always rerun, instant) ──
    log.info(f"\n{'=' * 60}")
    log.info("TASK 4: Scoring by archetype")
    log.info(f"{'=' * 60}")
    scored_count, archetype_counts = apply_archetype_scores(records)
    log.info(f"  Scored: {scored_count}/{total} use cases")
    unscored = total - scored_count
    log.info(f"  Unscored (no archetype match): {unscored}")

    # ── Final save ──
    save_checkpoint(records)
    duration = time.time() - start

    # ── Final report ──
    log.info(f"\n{'=' * 60}")
    log.info("ENRICHMENT REPORT")
    log.info(f"{'=' * 60}")
    log.info(f"  Total use cases: {total}")
    log.info(f"  Duration: {duration:.1f}s")
    log.info(f"  Output: {ENRICHED_FILE}")
    log.info(f"")
    log.info(f"  [Task 1] Fields added: {fields_added}")
    log.info(f"  [Task 2] Titles fixed: {titles_fixed}")
    log.info(f"  [Task 3] Benefits added: {benefits_count}")
    log.info(f"  [Task 3] Data prerequisites: {prereqs_count}/{total}")
    log.info(f"  [Task 4] Scored by archetype: {scored_count}/{total}")
    log.info(f"  [Task 4] Unscored: {unscored}")
    log.info(f"")
    log.info("  Top 5 archetypes:")
    for arch, cnt in sorted(archetype_counts.items(), key=lambda x: -x[1])[:5]:
        log.info(f"    {arch}: {cnt}")


if __name__ == "__main__":
    asyncio.run(main())
