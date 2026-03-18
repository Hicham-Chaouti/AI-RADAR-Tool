"""FastAPI dependency injection for DB, Redis, Qdrant, and services."""

from __future__ import annotations

from collections.abc import AsyncGenerator

import redis.asyncio as aioredis
from fastapi import Depends
from qdrant_client import QdrantClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models.database import async_session_factory
from app.services.cache_service import CacheService
from app.services.llm_router import LLMRouter
from app.services.rag_service import RAGService
from app.services.scoring_service import ScoringEngine

# ─── Singletons (set during lifespan startup) ───────────────
_redis_client: aioredis.Redis | None = None
_qdrant_client: QdrantClient | None = None


def set_redis(client: aioredis.Redis) -> None:
    global _redis_client
    _redis_client = client


def set_qdrant(client: QdrantClient) -> None:
    global _qdrant_client
    _qdrant_client = client


# ─── DB dependency ───────────────────────────────────────────
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Yield an async DB session."""
    async with async_session_factory() as session:
        yield session


# ─── Redis dependency ────────────────────────────────────────
async def get_redis() -> aioredis.Redis:
    """Return the Redis async client."""
    if _redis_client is None:
        raise RuntimeError("Redis not initialized")
    return _redis_client


# ─── Qdrant dependency ──────────────────────────────────────
async def get_qdrant() -> QdrantClient:
    """Return the QdrantClient."""
    if _qdrant_client is None:
        raise RuntimeError("Qdrant not initialized")
    return _qdrant_client


# ─── Service dependencies ───────────────────────────────────
async def get_cache_service(
    redis_client: aioredis.Redis = Depends(get_redis),
) -> CacheService:
    return CacheService(redis_client)


async def get_rag_service(
    qdrant: QdrantClient = Depends(get_qdrant),
) -> RAGService:
    return RAGService(qdrant, settings.QDRANT_COLLECTION)


async def get_scoring_service() -> ScoringEngine:
    return ScoringEngine()


async def get_llm_router(
    cache: CacheService = Depends(get_cache_service),
) -> LLMRouter:
    return LLMRouter(cache)
