"""Embedding service — Qwen3-Embedding-0.6B singleton, loaded once at startup."""

from __future__ import annotations

import asyncio
from functools import lru_cache

from app.utils.logger import get_logger

log = get_logger(__name__)

EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"
VECTOR_DIM = 384

# Module-level singleton — set by init_embedding_model()
_model = None


def init_embedding_model() -> None:
    """Load the embedding model into memory (call once at startup)."""
    global _model
    if _model is not None:
        return
    from sentence_transformers import SentenceTransformer

    log.info(f"Loading embedding model: {EMBEDDING_MODEL}")
    _model = SentenceTransformer(EMBEDDING_MODEL)
    dim = _model.get_sentence_embedding_dimension()
    assert dim == VECTOR_DIM, f"Expected {VECTOR_DIM} dims, got {dim}"
    log.info(f"Embedding model loaded (dim={dim})")


def is_model_ready() -> bool:
    """Check if the embedding model has finished loading."""
    return _model is not None


async def wait_for_model(timeout: int = 120) -> None:
    """Wait for the embedding model to finish loading (async, max 120 seconds)."""
    for _ in range(timeout):
        if is_model_ready():
            return
        await asyncio.sleep(1)
    from fastapi import HTTPException
    raise HTTPException(status_code=503, detail="Embedding model failed to load within timeout")


def get_model():
    """Return the loaded SentenceTransformer model."""
    if _model is None:
        from fastapi import HTTPException
        raise HTTPException(status_code=503, detail="Embedding model still loading, please wait...")
    return _model


async def encode(text: str) -> list[float]:
    """Encode a single text into a normalized embedding vector."""
    model = get_model()
    vector = await asyncio.to_thread(
        model.encode, text, normalize_embeddings=True
    )
    return vector.tolist()


def build_query_text(
    sector: str,
    capabilities: list[str] | None = None,
    objectives: list[str] | None = None,
) -> str:
    """Build the query text for semantic search from session context."""
    parts = [f"AI use cases for {sector} sector"]
    if capabilities:
        parts.append(f"capabilities: {', '.join(capabilities)}")
    if objectives:
        parts.append(f"objectives: {', '.join(objectives)}")
    return " ".join(parts)
