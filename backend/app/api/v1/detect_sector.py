"""Endpoint — Auto-detect client industry sector using Mistral."""

import asyncio
import json

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from mistralai.client import Mistral

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


@router.post("/detect-sector", response_model=DetectSectorResponse)
async def detect_sector(request: DetectSectorRequest):
    """Detect the industry sector of a client from its name using Mistral Small."""
    if not request.client_name or len(request.client_name.strip()) < 2:
        raise HTTPException(status_code=400, detail="Client name too short")

    if not settings.MISTRAL_API_KEY:
        raise HTTPException(status_code=500, detail="MISTRAL_API_KEY not configured")

    client = Mistral(api_key=settings.MISTRAL_API_KEY)

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

    try:
        response = await client.chat.complete_async(
            model="mistral-small-latest",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
            max_tokens=200,
        )

        result_text = response.choices[0].message.content.strip()

        # Clean potential markdown formatting
        if result_text.startswith("```"):
            result_text = result_text.split("\n", 1)[1] if "\n" in result_text else result_text
            result_text = result_text.rsplit("```", 1)[0] if "```" in result_text else result_text
            result_text = result_text.strip()

        result = json.loads(result_text)

        # Validate sector_label
        if result["sector_label"] not in VALID_SECTORS:
            # Try case-insensitive match
            for s in VALID_SECTORS:
                if s.lower() == result["sector_label"].lower():
                    result["sector_label"] = s
                    break
            else:
                raise HTTPException(status_code=422, detail="Could not determine sector")

        return DetectSectorResponse(**result)

    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Failed to parse LLM response")
    except HTTPException:
        raise
    except Exception as e:
        err = str(e)
        if "429" in err or "capacity exceeded" in err or "rate limit" in err.lower():
            raise HTTPException(status_code=429, detail="AI service rate limit reached. Please try again shortly.")
        raise HTTPException(status_code=500, detail=err)
