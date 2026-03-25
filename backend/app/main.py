"""AI Radar DXC — FastAPI application entry point."""

import asyncio
from contextlib import asynccontextmanager

import redis.asyncio as aioredis
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from qdrant_client import QdrantClient

from app.config import settings
from app.api.v1.router import api_router
from app.dependencies import set_redis, set_qdrant
from app.services.embedding_service import init_embedding_model
from app.utils.logger import get_logger

logger = get_logger(__name__)


async def _load_embedding_model_background():
    """Load embedding model in a background thread so it doesn't block startup."""
    try:
        logger.info("Loading embedding model in background...")
        await asyncio.to_thread(init_embedding_model)
        logger.info("Embedding model loaded successfully")
    except Exception as e:
        logger.error(f"Failed to load embedding model: {e}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: startup and shutdown events."""
    logger.info("Starting AI Radar DXC backend", extra={"environment": settings.ENVIRONMENT})

    # ── Redis ────────────────────────────────────────────────
    redis_client = aioredis.from_url(settings.REDIS_URL, decode_responses=True)
    await redis_client.ping()
    set_redis(redis_client)
    logger.info("Redis connected")

    # ── Qdrant ───────────────────────────────────────────────
    qdrant_client = QdrantClient(host=settings.QDRANT_HOST, port=settings.QDRANT_PORT)
    set_qdrant(qdrant_client)
    logger.info("Qdrant connected")

    # ── Embedding model — load in background, non-blocking ──
    asyncio.create_task(_load_embedding_model_background())

    logger.info("Backend started (embedding model loading in background)")
    yield

    # ── Shutdown ─────────────────────────────────────────────
    logger.info("Shutting down AI Radar DXC backend")
    await redis_client.aclose()
    qdrant_client.close()


app = FastAPI(
    title="AI Radar DXC",
    description="AI Use Cases Scoring & Prioritization — DXC Technology",
    version="1.0",
    lifespan=lifespan,
)

# ─── CORS ───────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routes ─────────────────────────────────────────────────
app.include_router(api_router, prefix="/api/v1")


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok", "version": "1.0"}
