"""Translation endpoints for dynamic frontend content."""

from __future__ import annotations

import asyncio
import hashlib
import re

from fastapi import APIRouter, Depends
from mistralai.client import Mistral

from app.config import settings
from app.dependencies import get_cache_service
from app.schemas.translation import (
    TranslateBatchRequest,
    TranslateBatchResponse,
    TranslateDescriptionRequest,
    TranslateDescriptionResponse,
)
from app.services.cache_service import CacheService

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


def _normalize_translated_output(text: str) -> str:
    cleaned = text.replace("**", "").strip()
    lines = [line.strip() for line in cleaned.splitlines() if line.strip()]
    filtered: list[str] = []
    for line in lines:
        lowered = line.lower()
        if lowered.startswith("voici la traduction"):
            continue
        if lowered in {"cas d'usage :", "cas d’usage :", "description:", "traduction:"}:
            continue
        filtered.append(line)
    if not filtered:
        return cleaned
    return "\n".join(filtered).strip()


def _cache_key(target_language: str, source_language: str, text: str) -> str:
    digest = hashlib.sha256(text.encode("utf-8")).hexdigest()
    return f"translate:v2:{target_language}:{source_language}:{digest}"


async def _translate_text(
    *,
    text: str,
    target_language: str,
    source_language: str,
    cache: CacheService,
) -> tuple[str, str, bool]:
    sanitized = _sanitize_names(text.strip())
    if not sanitized:
        return "", "unknown", False

    detected = source_language if source_language != "unknown" else _detect_language(sanitized)
    key = _cache_key(target_language, detected, sanitized)
    cached = await cache.get(key)
    if isinstance(cached, dict):
        cached_text = cached.get("text")
        cached_detected = cached.get("detected_language")
        cached_translated = cached.get("translated")
        if isinstance(cached_text, str) and isinstance(cached_detected, str) and isinstance(cached_translated, bool):
            return cached_text, cached_detected, cached_translated

    if detected == target_language or not settings.MISTRAL_API_KEY:
        await cache.set(
            key,
            {
                "text": sanitized,
                "detected_language": detected,
                "translated": False,
            },
        )
        return sanitized, detected, False

    client = Mistral(api_key=settings.MISTRAL_API_KEY)
    target_label = "English" if target_language == "en" else "French"
    prompt = (
        "Translate the following use case description into "
        f"{target_label}. Remove or generalize all company, product, and brand names. "
        "Keep the text concise and business-oriented. Return plain text only.\n\n"
        f"Description:\n{sanitized}"
    )
    model_name = getattr(settings, "LLM_MODEL", None) or "mistral-small-latest"

    try:
        response = await asyncio.to_thread(
            client.chat.complete,
            model=model_name,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
        )
        translated_text = (response.choices[0].message.content or "").strip() or sanitized
        final_text = _sanitize_names(_normalize_translated_output(translated_text))
        await cache.set(
            key,
            {
                "text": final_text,
                "detected_language": detected,
                "translated": True,
            },
        )
        return final_text, detected, True
    except Exception:
        await cache.set(
            key,
            {
                "text": sanitized,
                "detected_language": detected,
                "translated": False,
            },
        )
        return sanitized, detected, False


@router.post("/description", response_model=TranslateDescriptionResponse)
async def translate_description(
    payload: TranslateDescriptionRequest,
    cache: CacheService = Depends(get_cache_service),
) -> TranslateDescriptionResponse:
    text, detected, translated = await _translate_text(
        text=payload.text,
        target_language=payload.target_language,
        source_language=payload.source_language,
        cache=cache,
    )
    return TranslateDescriptionResponse(
        text=text,
        detected_language=detected,
        translated=translated,
    )


@router.post("/batch", response_model=TranslateBatchResponse)
async def translate_batch(
    payload: TranslateBatchRequest,
    cache: CacheService = Depends(get_cache_service),
) -> TranslateBatchResponse:
    translated_count = 0
    output_items: list[str] = []
    detected_language = payload.source_language

    for text in payload.items:
        translated_text, detected, translated = await _translate_text(
            text=text,
            target_language=payload.target_language,
            source_language=payload.source_language,
            cache=cache,
        )
        output_items.append(translated_text)
        detected_language = detected
        if translated:
            translated_count += 1

    return TranslateBatchResponse(
        items=output_items,
        detected_language=detected_language,
        translated_count=translated_count,
    )
