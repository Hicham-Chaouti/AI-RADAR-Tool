"""Cache service — Redis async get/set/delete with TTL."""

from __future__ import annotations

import json

import redis.asyncio as aioredis

from app.config import settings
from app.utils.logger import get_logger

log = get_logger(__name__)


class CacheService:
    """Async Redis wrapper for JSON-serialized cache entries."""

    def __init__(self, redis_client: aioredis.Redis) -> None:
        self._redis = redis_client

    async def get(self, key: str) -> dict | list | None:
        """Get a cached value. Returns None on miss."""
        raw = await self._redis.get(key)
        if raw is None:
            return None
        return json.loads(raw)

    async def set(self, key: str, value: dict | list, ttl: int | None = None) -> None:
        """Set a cache entry with TTL (seconds). Defaults to config TTL."""
        if ttl is None:
            ttl = settings.CACHE_TTL_SECONDS
        await self._redis.set(key, json.dumps(value, default=str), ex=ttl)

    async def delete(self, key: str) -> None:
        """Delete a cache entry."""
        await self._redis.delete(key)
