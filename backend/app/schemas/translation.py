from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field


class TranslateDescriptionRequest(BaseModel):
    text: str = Field(min_length=1)
    target_language: Literal['en', 'fr']
    source_language: Literal['en', 'fr', 'unknown'] = 'unknown'


class TranslateDescriptionResponse(BaseModel):
    text: str
    detected_language: Literal['en', 'fr', 'unknown']
    translated: bool
