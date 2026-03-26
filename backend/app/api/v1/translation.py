"""Translation endpoints for dynamic frontend content."""

from __future__ import annotations

import asyncio
import re

from fastapi import APIRouter
from mistralai.client import Mistral

from app.config import settings
from app.schemas.translation import TranslateDescriptionRequest, TranslateDescriptionResponse

router = APIRouter()

COMMERCIAL_PATTERNS = [
    re.compile(r"\\bgoogle\\b", re.IGNORECASE),
    re.compile(r"\\bspotify\\b", re.IGNORECASE),
    re.compile(r"\\bwhatsapp\\b", re.IGNORECASE),
    re.compile(r"\\bsalesforce\\b", re.IGNORECASE),
    re.compile(r"\\bamazon\\b", re.IGNORECASE),
    re.compile(r"\\bmicrosoft\\b", re.IGNORECASE),
    re.compile(r"\\bmeta\\b", re.IGNORECASE),
    re.compile(r"\\bapple\\b", re.IGNORECASE),
]


def _sanitize_names(text: str) -> str:
    sanitized = text
    for pattern in COMMERCIAL_PATTERNS:
        sanitized = pattern.sub("organization", sanitized)
    return sanitized


def _detect_language(text: str) -> str:
    normalized = f" {text.lower()} "
    en_tokens = [" the ", " and ", " for ", " with ", " using ", " customer "]
    fr_tokens = [" le ", " la ", " les ", " des ", " pour ", " avec ", " donnees "]

    en_score = sum(token in normalized for token in en_tokens)
    fr_score = sum(token in normalized for token in fr_tokens)

    if en_score >= fr_score + 1:
        return "en"
    if fr_score >= en_score + 1:
        return "fr"
    return "unknown"


@router.post("/description", response_model=TranslateDescriptionResponse)
async def translate_description(payload: TranslateDescriptionRequest) -> TranslateDescriptionResponse:
    sanitized = _sanitize_names(payload.text.strip())
    detected = payload.source_language if payload.source_language != "unknown" else _detect_language(sanitized)

    if detected == payload.target_language:
        return TranslateDescriptionResponse(
            text=sanitized,
            detected_language=detected,
            translated=False,
        )

    if not settings.MISTRAL_API_KEY:
        return TranslateDescriptionResponse(
            text=sanitized,
            detected_language=detected,
            translated=False,
        )

    client = Mistral(api_key=settings.MISTRAL_API_KEY)
    target_label = "English" if payload.target_language == "en" else "French"

    prompt = (
        "Translate the following use case description into "
        f"{target_label}. Remove or generalize all company, product, and brand names. "
        "Keep the text concise and business-oriented. Return plain text only.\n\n"
        f"Description:\n{sanitized}"
    )

    response = await asyncio.to_thread(
        client.chat.complete,
        model=settings.LLM_MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.2,
    )
    translated_text = (response.choices[0].message.content or "").strip() or sanitized

    return TranslateDescriptionResponse(
        text=_sanitize_names(translated_text),
        detected_language=detected,
        translated=True,
    )
