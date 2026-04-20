"""Endpoint — Auto-detect client industry sector using Mistral."""

import asyncio
import json
import re
import unicodedata

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import httpx

from app.config import settings

router = APIRouter()

# Must match INDUSTRIES in frontend/src/utils/constants.ts exactly
VALID_SECTORS = [
    "Agriculture & Food",
    "Automotive & Mobility",
    "Banking & Financial Services",
    "Construction & Real Estate",
    "Consumer Goods & Retail",
    "Education & Research",
    "Energy & Utilities",
    "Government & Public Sector",
    "Healthcare & Life Sciences",
    "Insurance",
    "Logistics & Supply Chain",
    "Manufacturing & Industry 4.0",
    "Media & Entertainment",
    "Mining & Natural Resources",
    "Professional Services",
    "Telecommunications",
    "Travel & Hospitality",
]


class DetectSectorRequest(BaseModel):
    client_name: str


class DetectSectorResponse(BaseModel):
    sector_label: str
    confidence: str  # "high", "medium", "low"
    reasoning: str


def normalize_text(text: str) -> str:
    normalized = unicodedata.normalize('NFKD', text)
    normalized = ''.join(ch for ch in normalized if not unicodedata.combining(ch))
    return re.sub(r"[^a-z0-9 ]+", "", normalized.lower()).strip()


SECTOR_PATTERNS: list[tuple[str, list[str], str]] = [
    ("Banking & Financial Services", ["bank", "banque", "finance", "capital", "loan", "credit", "investment", "financial", "trust", "mortgage", "savings", "asset"], "high"),
    ("Healthcare & Life Sciences", ["health", "healthcare", "clinic", "hospital", "pharma", "pharm", "medical", "lab", "biotech", "wellness", "care", "sante", "sante"], "high"),
    ("Consumer Goods & Retail", ["retail", "store", "shop", "market", "supermarket", "grocery", "fashion", "cosmetics", "apparel", "consumer", "commerce", "e commerce", "ecole"], "medium"),
    ("Energy & Utilities", ["energy", "energie", "power", "oil", "gas", "electric", "utility", "renewable", "solar", "wind", "hydro", "nuclear"], "high"),
    ("Manufacturing & Industry 4.0", ["manufactur", "factory", "industrial", "production", "assembly", "electronics", "automotive", "machinery", "industrie", "usine"], "medium"),
    ("Logistics & Supply Chain", ["logistics", "shipping", "transport", "cargo", "freight", "supply chain", "warehouse", "distribution", "logistique", "transport", "camion", "route"], "high"),
    ("Travel & Hospitality", ["travel", "hotel", "resort", "hospitality", "airline", "cruise", "tourism", "vacation", "voyage", "hotel", "resort"], "medium"),
    ("Media & Entertainment", ["media", "entertainment", "studio", "film", "tv", "radio", "music", "gaming", "theatre", "spectacle"], "medium"),
    ("Government & Public Sector", ["gov", "government", "public sector", "city", "municipal", "agency", "authority", "ministry", "department", "etat", "publique", "collectivite"], "medium"),
    ("Construction & Real Estate", ["construction", "real estate", "property", "estate", "building", "development", "architecture", "contractor", "immobilier", "bâtiment", "promotion"], "medium"),
    ("Insurance", ["insurance", "assurance", "insure", "coverage", "risk management", "assure"], "high"),
    ("Telecommunications", ["telecom", "communications", "network", "internet service", "isp", "mobile", "telephony", "telephonie", "fibre"], "medium"),
    ("Education & Research", ["education", "school", "university", "college", "academy", "institute", "research", "learning", "universite", "ecole", "formation"], "medium"),
    ("Mining & Natural Resources", ["mining", "resources", "minerals", "ore", "quarry", "metals", "minerai", "mines"], "high"),
    ("Agriculture & Food", ["agri", "farm", "food", "beverage", "dairy", "produce", "agriculture", "farming", "alimentaire", "agro"], "medium"),
    ("Professional Services", ["consult", "solutions", "services", "group", "partners", "advisory", "tech", "systems", "enterprise", "experts", "marketing", "digital"], "low"),
]


def heuristic_sector(client_name: str) -> DetectSectorResponse:
    normalized = normalize_text(client_name)
    for sector, keywords, confidence in SECTOR_PATTERNS:
        if any(keyword in normalized for keyword in keywords):
            return DetectSectorResponse(
                sector_label=sector,
                confidence=confidence,
                reasoning=f"Detected sector from the client name using keyword matching.",
            )

    return DetectSectorResponse(
        sector_label="Professional Services",
        confidence="low",
        reasoning="No strong sector keyword found in the client name. Returning a default sector for fast response.",
    )


@router.post("/detect-sector", response_model=DetectSectorResponse)
async def detect_sector(request: DetectSectorRequest):
    """Detect the industry sector of a client from its name using Mistral Small."""
    if not request.client_name or len(request.client_name.strip()) < 2:
        raise HTTPException(status_code=400, detail="Client name too short")

    # Fast local heuristic before fallback to remote LLM.
    local = heuristic_sector(request.client_name)
    if local.confidence in {"high", "medium"}:
        return local

    if not settings.MISTRAL_API_KEY:
        return local

    sectors_list = "\n".join(f"- {s}" for s in VALID_SECTORS)

    prompt = f"""You are a business intelligence agent. Given a company name, identify its primary industry sector.

Company name: "{request.client_name}"

Available sectors (you MUST choose exactly one):
{sectors_list}

Respond ONLY with a JSON object, no markdown, no explanation:
{{
  "sector_label": "the exact sector label from the list above",
  "confidence": "high" or "medium" or "low",
  "reasoning": "one sentence explaining why"
}}

Rules:
- If you recognize the company, use your knowledge to determine the sector. confidence = "high"
- If you don't recognize the company but can infer from the name (e.g. "Bank" → Banking & Financial Services), confidence = "medium"
- If unsure, make your best guess. confidence = "low"
- You MUST return one of the exact sector labels listed above
- Respond with ONLY the JSON, nothing else"""

    def normalize_sector_label(label: str) -> str:
        normalized = label.lower().strip()
        normalized = re.sub(r"\band\b", "&", normalized)
        normalized = re.sub(r"[^a-z0-9& ]+", "", normalized)
        normalized = re.sub(r"\s+", " ", normalized)
        return normalized

    def find_valid_sector(label: str) -> str | None:
        normalized_label = normalize_sector_label(label)
        for sector in VALID_SECTORS:
            if normalize_sector_label(sector) == normalized_label:
                return sector
        for sector in VALID_SECTORS:
            if normalized_label in normalize_sector_label(sector) or normalize_sector_label(sector) in normalized_label:
                return sector
        return None

    try:
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                "https://api.mistral.ai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {settings.MISTRAL_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": "mistral-small-latest",
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.1,
                    "max_tokens": 200,
                },
                timeout=8.0,
            )
            resp.raise_for_status()
            data = resp.json()

        result_text = data["choices"][0]["message"]["content"].strip()

        # Clean potential markdown formatting
        if result_text.startswith("```"):
            result_text = result_text.split("\n", 1)[1] if "\n" in result_text else result_text
            result_text = result_text.rsplit("```", 1)[0] if "```" in result_text else result_text
            result_text = result_text.strip()

        try:
            result = json.loads(result_text)
        except json.JSONDecodeError:
            match = re.search(r"\{.*\}", result_text, re.DOTALL)
            if not match:
                raise
            result = json.loads(match.group(0))

        # Validate sector_label
        if result["sector_label"] not in VALID_SECTORS:
            valid_sector = find_valid_sector(result["sector_label"])
            if valid_sector:
                result["sector_label"] = valid_sector
            else:
                return heuristic_sector(request.client_name)

        return DetectSectorResponse(**result)

    except Exception as e:
        err = str(e)
        if "429" in err or "capacity exceeded" in err or "rate limit" in err.lower():
            # Still catch rate limit for specific frontend handling if desired,
            # but default to fallback instead of failing completely.
            pass

        return heuristic_sector(request.client_name)
