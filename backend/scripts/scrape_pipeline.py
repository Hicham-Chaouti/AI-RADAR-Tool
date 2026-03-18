"""
Scraping pipeline for ai-radar-dxc Knowledge Base.

Usage:
    python scripts/scrape_pipeline.py

Output:
    backend/data/seed_use_cases.json   — structured use cases
    backend/data/raw/                  — raw HTML/text from each source
    backend/data/SCRAPING_REPORT.md    — per-source extraction stats

Rules:
    - Never invent or estimate any field value
    - Every record must have source_url populated
    - LLM is used only for structured extraction, not generation
    - If extraction fails for a field → set to null
    - Minimum 60 records required before pipeline succeeds

Architecture:
    - Incremental: processes one source at a time
    - Saves after each source (resumable)
    - Uses Mistral Small (32K context, free tier friendly)
"""

from __future__ import annotations

import asyncio
import hashlib
import json
import logging
import os
import re
import sys
import time
from datetime import date, datetime
from pathlib import Path
from typing import Any

import httpx
from bs4 import BeautifulSoup
from dotenv import load_dotenv
from markdownify import markdownify as md_convert
from mistralai.client import Mistral
from pydantic import BaseModel, field_validator

# Load .env from project root
load_dotenv(Path(__file__).resolve().parent.parent.parent / ".env")

# ─── Paths ──────────────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
RAW_DIR = DATA_DIR / "raw"
SEED_FILE = DATA_DIR / "seed_use_cases.json"
REPORT_FILE = DATA_DIR / "SCRAPING_REPORT.md"
PROGRESS_FILE = DATA_DIR / "scraping_progress.json"

# ─── Logging ────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-7s | %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("scrape_pipeline")

# ─── Constants ──────────────────────────────────────────────
MIN_RECORDS = 60
INTER_SOURCE_DELAY = 5  # seconds between LLM calls (rate limit safety)
LLM_MODEL = "mistral-small-latest"
MAX_CONTENT_CHARS = 80_000  # ~20K tokens for Mistral Small (32K context)
CHUNK_SIZE = 25_000  # chars per chunk for large sources
CHUNK_OVERLAP = 500  # overlap between chunks to avoid splitting use cases
INTER_CHUNK_DELAY = 5  # seconds between chunk LLM calls

# ─── Target Sources ─────────────────────────────────────────
SOURCES = [
    {
        "name": "Google Cloud 1001 Use Cases",
        "slug": "google_cloud_1001",
        "url": "https://cloud.google.com/transform/101-real-world-generative-ai-use-cases-from-industry-leaders",
        "priority": 1,
    },
    {
        "name": "Google Cloud AI Blueprints",
        "slug": "google_cloud_blueprints",
        "url": "https://cloud.google.com/blog/products/ai-machine-learning/real-world-gen-ai-use-cases-with-technical-blueprints",
        "priority": 2,
    },
    {
        "name": "IBM watsonx Use Cases",
        "slug": "ibm_watsonx",
        "url": "https://www.ibm.com/products/watsonx/use-cases",
        "priority": 3,
    },
    {
        "name": "Salesforce AI Use Cases",
        "slug": "salesforce_ai",
        "url": "https://www.salesforce.com/artificial-intelligence/use-cases/",
        "priority": 4,
    },
    {
        "name": "NVIDIA AI Industry Use Cases",
        "slug": "nvidia_industries",
        "url": "https://www.nvidia.com/en-us/industries/",
        "priority": 4,
    },
    {
        "name": "MIT Technology Review AI",
        "slug": "mit_tech_review_ai",
        "url": "https://www.technologyreview.com/topic/artificial-intelligence/",
        "priority": 5,
    },
]

# ─── Sector Mapping (§6.4 Step 5) ───────────────────────────
SECTOR_MAPPING: dict[str, str] = {
    "financial services": "banking_finance",
    "banking": "banking_finance",
    "finance": "banking_finance",
    "insurance": "banking_finance",
    "fintech": "banking_finance",
    "health": "healthcare",
    "healthcare": "healthcare",
    "life sciences": "healthcare",
    "pharma": "healthcare",
    "pharmaceutical": "healthcare",
    "medical": "healthcare",
    "retail": "retail_ecommerce",
    "ecommerce": "retail_ecommerce",
    "e-commerce": "retail_ecommerce",
    "consumer": "retail_ecommerce",
    "consumer goods": "retail_ecommerce",
    "energy": "energy_utilities",
    "utilities": "energy_utilities",
    "oil and gas": "energy_utilities",
    "oil & gas": "energy_utilities",
    "manufacturing": "manufacturing",
    "automotive": "manufacturing",
    "industrial": "manufacturing",
    "aerospace": "manufacturing",
    "telecom": "telecom",
    "telecommunications": "telecom",
    "media": "media_entertainment",
    "entertainment": "media_entertainment",
    "media and entertainment": "media_entertainment",
    "technology": "technology",
    "tech": "technology",
    "software": "technology",
    "government": "public_sector",
    "public sector": "public_sector",
    "education": "public_sector",
    "transportation": "transportation_logistics",
    "logistics": "transportation_logistics",
    "supply chain": "transportation_logistics",
    "travel": "transportation_logistics",
    "agriculture": "agriculture",
    "real estate": "real_estate",
    "construction": "real_estate",
}

# ─── LLM Extraction Prompt ──────────────────────────────────
EXTRACTION_PROMPT = """Tu es un extracteur de donnees structurees.
Lis le contenu complet de cette source : {source_name}

REGLES ABSOLUES :
1. Extrais UNIQUEMENT ce qui est explicitement ecrit dans le texte
2. N'invente, n'estime, n'infere AUCUNE valeur
3. Si un champ n'est pas dans le texte, mets null
4. Ne remplis measurable_benefit que si un chiffre precis est cite
5. Retourne un JSON array, rien d'autre

Pour chaque use case trouve, retourne :
{{
  "title": "string",
  "description": "string (description telle que dans le texte)",
  "sector": "string (secteur mentionne)",
  "functions": ["liste des fonctions metier"],
  "agent_type": "string | null",
  "company_example": "string | null (nom exact de l'entreprise)",
  "business_challenge": "string | null",
  "ai_solution": "string | null",
  "measurable_benefit": "string | null (chiffre precis uniquement)",
  "tech_keywords": ["mots-cles IA/tech"],
  "source_url": "{source_url}",
  "source_name": "{source_name}"
}}

Contenu de la source :
{content}

Retourne UNIQUEMENT un JSON array valide. Zero texte autour."""


# ─── Pydantic Schema for Validation (§6.4 Step 4) ───────────
class RawUseCase(BaseModel):
    """Pydantic model for validating extracted use cases."""

    title: str
    description: str
    sector: str | None = None
    functions: list[str] | None = None
    agent_type: str | None = None
    company_example: str | None = None
    business_challenge: str | None = None
    ai_solution: str | None = None
    measurable_benefit: str | None = None
    tech_keywords: list[str] | None = None

    @field_validator("title", "description")
    @classmethod
    def not_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Field must not be empty")
        return v.strip()


# ═══════════════════════════════════════════════════════════
# PROGRESS TRACKING — Incremental pipeline
# ═══════════════════════════════════════════════════════════
def load_progress() -> dict[str, Any]:
    """Load progress file if it exists."""
    if PROGRESS_FILE.exists():
        return json.loads(PROGRESS_FILE.read_text(encoding="utf-8"))
    return {"processed_sources": [], "total_records": 0, "last_run": None}


def save_progress(progress: dict[str, Any]) -> None:
    """Save progress to file."""
    progress["last_run"] = datetime.utcnow().isoformat()
    PROGRESS_FILE.write_text(
        json.dumps(progress, indent=2, ensure_ascii=False),
        encoding="utf-8",
    )


def load_existing_records() -> list[dict[str, Any]]:
    """Load existing records from seed_use_cases.json if it exists."""
    if SEED_FILE.exists():
        return json.loads(SEED_FILE.read_text(encoding="utf-8"))
    return []


def append_records_to_json(new_records: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Append new records to seed_use_cases.json and return all records."""
    existing = load_existing_records()
    existing.extend(new_records)
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    SEED_FILE.write_text(
        json.dumps(existing, indent=2, ensure_ascii=False, default=str),
        encoding="utf-8",
    )
    return existing


# ═══════════════════════════════════════════════════════════
# STEP 1 — FETCH
# ═══════════════════════════════════════════════════════════
async def fetch_source(
    client: httpx.AsyncClient, source: dict[str, Any]
) -> str | None:
    """Fetch HTML from a source URL with exponential backoff."""
    url = source["url"]
    slug = source["slug"]
    log.info(f"Fetching {source['name']}  ->  {url}")

    headers = {
        "User-Agent": (
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
            "AppleWebKit/537.36 (KHTML, like Gecko) "
            "Chrome/120.0.0.0 Safari/537.36"
        ),
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
    }

    for attempt in range(3):
        try:
            resp = await client.get(url, headers=headers, follow_redirects=True, timeout=30.0)
            if resp.status_code in (429, 503):
                wait = (2**attempt) * 2
                log.warning(f"  -> {resp.status_code} from {slug}, retrying in {wait}s...")
                await asyncio.sleep(wait)
                continue
            resp.raise_for_status()
            html = resp.text
            raw_path = RAW_DIR / f"{slug}.html"
            raw_path.write_text(html, encoding="utf-8")
            log.info(f"  -> Saved {len(html):,} chars -> {raw_path.name}")
            return html
        except httpx.HTTPError as e:
            wait = (2**attempt) * 2
            log.warning(f"  -> HTTP error for {slug}: {e}. Retrying in {wait}s...")
            await asyncio.sleep(wait)

    log.error(f"  X Failed to fetch {slug} after 3 attempts")
    return None


# ═══════════════════════════════════════════════════════════
# STEP 2 — PARSE (BS4 + markdownify)
# ═══════════════════════════════════════════════════════════
def parse_html_to_markdown(html: str, slug: str) -> str:
    """Parse HTML: strip nav/footer/scripts, convert to Markdown."""
    soup = BeautifulSoup(html, "html.parser")

    for tag in soup.find_all(
        ["nav", "footer", "header", "script", "style", "noscript", "iframe", "aside"]
    ):
        tag.decompose()

    for selector in [
        "[class*='cookie']", "[class*='banner']", "[class*='popup']",
        "[class*='modal']", "[class*='newsletter']", "[id*='cookie']",
    ]:
        for el in soup.select(selector):
            el.decompose()

    main = (
        soup.find("main")
        or soup.find("article")
        or soup.find(attrs={"role": "main"})
        or soup.find("div", class_=lambda c: c and "content" in c.lower() if c else False)
        or soup.body
        or soup
    )

    markdown = md_convert(str(main), heading_style="ATX", strip=["img"])

    lines = [line.rstrip() for line in markdown.splitlines()]
    cleaned = "\n".join(lines)
    while "\n\n\n" in cleaned:
        cleaned = cleaned.replace("\n\n\n", "\n\n")

    md_path = RAW_DIR / f"{slug}.md"
    md_path.write_text(cleaned, encoding="utf-8")
    log.info(f"  -> Parsed -> {len(cleaned):,} chars Markdown -> {md_path.name}")
    return cleaned


# ═══════════════════════════════════════════════════════════
# STEP 3 — LLM EXTRACTION (Mistral Small)
# ═══════════════════════════════════════════════════════════
def repair_json(text: str) -> str:
    """Attempt to fix common JSON issues from LLM output."""
    text = text.strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[1] if "\n" in text else text[3:]
    if text.endswith("```"):
        text = text[:-3].strip()
    if text.startswith("json"):
        text = text[4:].strip()

    # Fix trailing commas before } or ]
    text = re.sub(r",\s*([}\]])", r"\1", text)

    return text


def split_into_chunks(text: str, chunk_size: int, overlap: int) -> list[str]:
    """Split text into overlapping chunks."""
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        start = end - overlap
    return chunks


def deduplicate_by_title(records: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Deduplicate records by title (case-insensitive). Keep the richer one."""
    seen: dict[str, dict[str, Any]] = {}
    for record in records:
        key = record.get("title", "").strip().lower()
        if key not in seen or count_non_null(record) > count_non_null(seen[key]):
            seen[key] = record
    return list(seen.values())


async def extract_single_chunk(
    mistral_client: Mistral,
    chunk: str,
    source: dict[str, Any],
    chunk_idx: int,
    total_chunks: int,
) -> list[dict[str, Any]]:
    """Extract use cases from a single chunk via LLM."""
    log.info(f"  -> Chunk {chunk_idx + 1}/{total_chunks}: {len(chunk):,} chars")

    prompt = EXTRACTION_PROMPT.format(
        source_name=source["name"],
        source_url=source["url"],
        content=chunk,
    )

    for attempt in range(2):
        try:
            response = await asyncio.to_thread(
                mistral_client.chat.complete,
                model=LLM_MODEL,
                messages=[{"role": "user", "content": prompt}],
                response_format={"type": "json_object"},
                temperature=0,
            )
            content = response.choices[0].message.content or ""
            text = repair_json(content)
            parsed = json.loads(text)

            if isinstance(parsed, list):
                records = parsed
            elif isinstance(parsed, dict):
                records = []
                for key in ("use_cases", "results", "data", "items"):
                    if key in parsed and isinstance(parsed[key], list):
                        records = parsed[key]
                        break
                if not records:
                    records = [parsed]
            else:
                records = []

            log.info(f"  -> Chunk {chunk_idx + 1}: extracted {len(records)} records")
            return records

        except json.JSONDecodeError as e:
            log.warning(f"  -> Chunk {chunk_idx + 1}: JSON parse error: {e}")
            try:
                text_fixed = text[:text.rfind("}") + 1] + "]"
                if text_fixed.startswith("["):
                    parsed = json.loads(text_fixed)
                    if isinstance(parsed, list):
                        return parsed
            except Exception:
                pass
            return []
        except Exception as e:
            error_str = str(e).lower()
            if ("429" in error_str or "rate" in error_str or "503" in error_str) and attempt == 0:
                log.warning(f"  -> Chunk {chunk_idx + 1}: rate limited. Waiting 60s...")
                await asyncio.sleep(60)
                continue
            log.error(f"  -> Chunk {chunk_idx + 1}: LLM error: {e}")
            return []

    return []


async def extract_from_source(
    mistral_client: Mistral,
    markdown: str,
    source: dict[str, Any],
) -> list[dict[str, Any]]:
    """Extract use cases from a source. Uses chunking if content exceeds MAX_CONTENT_CHARS."""
    # Large content: split into chunks
    if len(markdown) > MAX_CONTENT_CHARS:
        chunks = split_into_chunks(markdown, CHUNK_SIZE, CHUNK_OVERLAP)
        log.info(
            f"  -> Content too large ({len(markdown):,} chars). "
            f"Splitting into {len(chunks)} chunks of ~{CHUNK_SIZE:,} chars"
        )

        all_records: list[dict[str, Any]] = []
        for i, chunk in enumerate(chunks):
            records = await extract_single_chunk(mistral_client, chunk, source, i, len(chunks))
            all_records.extend(records)
            if i < len(chunks) - 1:
                log.info(f"  -> Waiting {INTER_CHUNK_DELAY}s before next chunk...")
                await asyncio.sleep(INTER_CHUNK_DELAY)

        # Deduplicate across chunks (overlap may produce duplicates)
        before = len(all_records)
        all_records = deduplicate_by_title(all_records)
        if before != len(all_records):
            log.info(f"  -> Cross-chunk dedup: {before} -> {len(all_records)} records")

        return all_records

    # Normal path: single LLM call
    log.info(f"  -> Extracting from {source['name']} ({len(markdown):,} chars) in 1 LLM call...")

    prompt = EXTRACTION_PROMPT.format(
        source_name=source["name"],
        source_url=source["url"],
        content=markdown,
    )

    for attempt in range(2):  # 1 retry on 429
        try:
            response = await asyncio.to_thread(
                mistral_client.chat.complete,
                model=LLM_MODEL,
                messages=[{"role": "user", "content": prompt}],
                response_format={"type": "json_object"},
                temperature=0,
            )
            content = response.choices[0].message.content or ""
            log.info("  -> LLM call completed via Mistral API")

            text = repair_json(content)
            parsed = json.loads(text)

            if isinstance(parsed, list):
                records = parsed
            elif isinstance(parsed, dict):
                records = []
                for key in ("use_cases", "results", "data", "items"):
                    if key in parsed and isinstance(parsed[key], list):
                        records = parsed[key]
                        break
                if not records:
                    records = [parsed]
            else:
                records = []

            log.info(f"  -> Extracted {len(records)} records")
            return records

        except json.JSONDecodeError as e:
            log.warning(f"  -> JSON parse error from LLM: {e}")
            try:
                text_fixed = text[:text.rfind("}") + 1] + "]"
                if text_fixed.startswith("["):
                    parsed = json.loads(text_fixed)
                    if isinstance(parsed, list):
                        log.info(f"  -> Recovered {len(parsed)} records from partial JSON")
                        return parsed
            except Exception:
                pass
            return []
        except Exception as e:
            error_str = str(e).lower()
            if "429" in error_str or "rate" in error_str:
                if attempt == 0:
                    log.warning("  -> Rate limited (429). Waiting 60s before retry...")
                    await asyncio.sleep(60)
                    continue
            log.error(f"  -> LLM extraction error: {e}")
            return []

    return []


# ═══════════════════════════════════════════════════════════
# STEP 4 — VALIDATE (Pydantic)
# ═══════════════════════════════════════════════════════════
def validate_records(
    raw_records: list[dict[str, Any]],
    source: dict[str, Any],
    today: str,
) -> tuple[list[dict[str, Any]], list[dict[str, str]]]:
    """Validate records with Pydantic. Returns (valid, rejected)."""
    valid: list[dict[str, Any]] = []
    rejected: list[dict[str, str]] = []

    for i, raw in enumerate(raw_records):
        try:
            record = RawUseCase.model_validate(raw)
            validated = record.model_dump()
            validated["source_url"] = source["url"]
            validated["source_name"] = source["name"]
            validated["scrape_date"] = today
            valid.append(validated)
        except Exception as e:
            rejected.append({
                "source": source["name"],
                "index": str(i),
                "reason": str(e),
                "title": raw.get("title", "<missing>"),
            })

    return valid, rejected


# ═══════════════════════════════════════════════════════════
# STEP 5 — NORMALIZE SECTORS
# ═══════════════════════════════════════════════════════════
def normalize_sector(raw_sector: str | None) -> str:
    """Map raw sector string to controlled vocabulary."""
    if not raw_sector:
        return "cross_industry"

    lower = raw_sector.strip().lower()

    if lower in SECTOR_MAPPING:
        return SECTOR_MAPPING[lower]

    for key, normalized in SECTOR_MAPPING.items():
        if key in lower or lower in key:
            return normalized

    return "cross_industry"


def apply_sector_normalization(records: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Apply sector normalization to all records."""
    for record in records:
        record["sector_normalized"] = normalize_sector(record.get("sector"))
    return records


# ═══════════════════════════════════════════════════════════
# STEP 6 — DEDUPLICATE
# ═══════════════════════════════════════════════════════════
def count_non_null(record: dict[str, Any]) -> int:
    """Count non-null fields in a record."""
    return sum(
        1 for v in record.values()
        if v is not None and v != [] and v != ""
    )


def deduplicate(records: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Deduplicate on title.lower() + sector_normalized. Keep the richer record."""
    seen: dict[str, dict[str, Any]] = {}

    for record in records:
        key = hashlib.md5(
            (record.get("title", "").lower() + record.get("sector_normalized", "")).encode()
        ).hexdigest()

        if key not in seen or count_non_null(record) > count_non_null(seen[key]):
            seen[key] = record

    return list(seen.values())


# ═══════════════════════════════════════════════════════════
# STEP 7 — ASSIGN IDs + WRITE OUTPUT
# ═══════════════════════════════════════════════════════════
def assign_ids(records: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Assign sequential IDs to use cases."""
    for i, record in enumerate(records, start=1):
        record["id"] = f"uc_{i:03d}"
    return records


def write_seed_json(records: list[dict[str, Any]]) -> None:
    """Write validated use cases to seed_use_cases.json."""
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    SEED_FILE.write_text(
        json.dumps(records, indent=2, ensure_ascii=False, default=str),
        encoding="utf-8",
    )
    log.info(f"Wrote {len(records)} records -> {SEED_FILE}")


def write_report(
    source_stats: list[dict[str, Any]],
    rejected: list[dict[str, str]],
    total_records: int,
    records: list[dict[str, Any]],
    duration_s: float,
) -> None:
    """Generate SCRAPING_REPORT.md with per-source stats."""
    sector_counts: dict[str, int] = {}
    for r in records:
        s = r.get("sector_normalized", "unknown")
        sector_counts[s] = sector_counts.get(s, 0) + 1

    report_lines = [
        "# Scraping Report -- AI Radar DXC",
        "",
        f"**Generated:** {datetime.utcnow().isoformat()}Z",
        f"**Duration:** {duration_s:.1f}s",
        f"**Total records:** {total_records}",
        f"**Records after dedup:** {len(records)}",
        "",
        "---",
        "",
        "## Per-Source Statistics",
        "",
        "| Source | Extracted | Rejected | Valid |",
        "|---|---|---|---|",
    ]

    for stat in source_stats:
        report_lines.append(
            f"| {stat['name']} | {stat['extracted']} | {stat['rejected']} | {stat['valid']} |"
        )

    report_lines.extend([
        "",
        "---",
        "",
        "## Records by Sector",
        "",
        "| Sector | Count |",
        "|---|---|",
    ])

    for sector, count in sorted(sector_counts.items(), key=lambda x: -x[1]):
        report_lines.append(f"| {sector} | {count} |")

    if rejected:
        report_lines.extend([
            "",
            "---",
            "",
            "## Rejected Records",
            "",
            "| Source | Title | Reason |",
            "|---|---|---|",
        ])
        for rej in rejected[:50]:
            title = rej.get("title", "?")[:60]
            reason = rej.get("reason", "?")[:80]
            report_lines.append(f"| {rej['source']} | {title} | {reason} |")

    report = "\n".join(report_lines) + "\n"
    REPORT_FILE.write_text(report, encoding="utf-8")
    log.info(f"Report -> {REPORT_FILE}")


# ═══════════════════════════════════════════════════════════
# MAIN — Incremental Orchestrator
# ═══════════════════════════════════════════════════════════
async def run_pipeline() -> None:
    """Run the incremental scraping pipeline, source by source."""
    start = time.time()
    today = date.today().isoformat()

    RAW_DIR.mkdir(parents=True, exist_ok=True)
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    api_key = os.getenv("MISTRAL_API_KEY", "")
    if not api_key:
        log.error("MISTRAL_API_KEY not set. Set it in .env before running the pipeline.")
        sys.exit(1)

    mistral_client = Mistral(api_key=api_key)

    # Load progress for incremental processing
    progress = load_progress()
    processed_sources = set(progress.get("processed_sources", []))

    all_records: list[dict[str, Any]] = []
    all_rejected: list[dict[str, str]] = []
    source_stats: list[dict[str, Any]] = []

    async with httpx.AsyncClient() as http_client:
        for source in SOURCES:
            # Skip already processed sources
            if source["name"] in processed_sources:
                log.info(f"[SKIP] {source['name']} already processed")
                continue

            log.info(f"\n{'=' * 60}")
            log.info(f"Processing: {source['name']}")
            log.info(f"{'=' * 60}")

            # Step 1 -- Fetch
            html = await fetch_source(http_client, source)
            if not html:
                source_stats.append({
                    "name": source["name"],
                    "extracted": 0,
                    "rejected": 0,
                    "valid": 0,
                    "error": "Fetch failed",
                })
                continue

            # Step 2 -- Parse
            markdown = parse_html_to_markdown(html, source["slug"])

            if len(markdown.strip()) < 200:
                log.warning(f"  -> Very little content extracted from {source['slug']}")
                source_stats.append({
                    "name": source["name"],
                    "extracted": 0,
                    "rejected": 0,
                    "valid": 0,
                    "error": "Insufficient content",
                })
                continue

            # Step 3 -- LLM Extraction (1 call per source)
            raw_records = await extract_from_source(mistral_client, markdown, source)
            log.info(f"  -> Raw extracted: {len(raw_records)} records")

            # Step 4 -- Validate
            valid, rejected = validate_records(raw_records, source, today)
            log.info(f"  -> Validated: {len(valid)} valid, {len(rejected)} rejected")

            # Step 5 -- Normalize sectors immediately
            valid = apply_sector_normalization(valid)

            all_records.extend(valid)
            all_rejected.extend(rejected)
            source_stats.append({
                "name": source["name"],
                "extracted": len(raw_records),
                "rejected": len(rejected),
                "valid": len(valid),
            })

            # Save progress after each source (incremental)
            append_records_to_json(valid)
            progress["processed_sources"] = list(processed_sources | {source["name"]})
            processed_sources.add(source["name"])
            progress["total_records"] = progress.get("total_records", 0) + len(valid)
            save_progress(progress)
            log.info(f"  -> Saved {len(valid)} records. Progress saved.")

            # Rate limit between sources
            log.info(f"  -> Waiting {INTER_SOURCE_DELAY}s before next source...")
            await asyncio.sleep(INTER_SOURCE_DELAY)

    # ── Final post-processing on ALL records ──
    log.info(f"\n{'=' * 60}")
    log.info("Final post-processing")
    log.info(f"{'=' * 60}")

    # Reload all records (including previously saved ones)
    final_records = load_existing_records()
    log.info(f"  -> Total records loaded: {len(final_records)}")

    # Ensure all records have sector_normalized
    final_records = apply_sector_normalization(final_records)

    # Step 6 -- Deduplicate across all sources
    before_dedup = len(final_records)
    final_records = deduplicate(final_records)
    log.info(f"  -> Deduplicated: {before_dedup} -> {len(final_records)} records")

    # Assign IDs
    final_records = assign_ids(final_records)

    # Step 7 -- Write final output
    duration = time.time() - start
    write_seed_json(final_records)
    write_report(source_stats, all_rejected, len(final_records), final_records, duration)

    # Threshold check (warning, not blocking)
    if len(final_records) < MIN_RECORDS:
        log.warning(
            f"Pipeline produced {len(final_records)} records "
            f"(minimum target: {MIN_RECORDS}). Check SCRAPING_REPORT.md."
        )
    else:
        log.info(f"Target met: {len(final_records)} >= {MIN_RECORDS} records")

    log.info(f"\nPipeline complete: {len(final_records)} records in {duration:.1f}s")


if __name__ == "__main__":
    asyncio.run(run_pipeline())
