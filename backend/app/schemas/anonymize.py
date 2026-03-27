"""Pydantic schemas for the use case anonymization endpoint."""

from pydantic import BaseModel


class AnonymizeResponse(BaseModel):
    title: str
    description: str
