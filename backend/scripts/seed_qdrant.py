"""Seed Qdrant from seed_use_cases_enriched.json.

Builds embedding text, generates local embeddings with Qwen3-Embedding-0.6B,
and indexes all use cases into Qdrant with metadata.

Usage:
    python scripts/seed_qdrant.py
"""

from __future__ import annotations

import json
import hashlib
import logging
import sys
import time
from pathlib import Path

from dotenv import load_dotenv

# ─── Setup paths ────────────────────────────────────────────
ROOT_DIR = Path(__file__).resolve().parent.parent.parent
load_dotenv(ROOT_DIR / ".env")

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.config import settings  # noqa: E402

# ─── Config ─────────────────────────────────────────────────
DATA_DIR = Path(__file__).resolve().parent.parent / "data"
ENRICHED_FILE = DATA_DIR / "seed_use_cases_anonymized.json"

EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"
VECTOR_DIM = 384
BATCH_SIZE = 32
COLLECTION_NAME = settings.QDRANT_COLLECTION

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-7s | %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("seed_qdrant")


def stable_point_id(raw_id: str) -> int:
    """Return a deterministic positive int64 id from a string id."""
    digest = hashlib.sha256(raw_id.encode("utf-8")).digest()
    return int.from_bytes(digest[:8], "big") & ((1 << 63) - 1)


def build_embedding_text(record: dict) -> str:
    """Build the text to embed from use case fields."""
    parts = [
        record.get("title") or "",
        record.get("description") or "",
        record.get("sector_normalized") or "",
        " ".join(record.get("functions") or []),
        record.get("business_challenge") or "",
        record.get("ai_solution") or "",
        " ".join(record.get("tech_keywords") or []),
        record.get("archetype") or "",
    ]
    return " ".join(p for p in parts if p).strip()


def build_payload(record: dict) -> dict:
    """Build the Qdrant metadata payload."""
    return {
        "sector_normalized": record.get("sector_normalized"),
        "archetype": record.get("archetype"),
        "functions": record.get("functions"),
        "source_url": record.get("source_url"),
        "weighted_score": record.get("weighted_score"),
        "quick_win": record.get("quick_win"),
        "complexity_level": record.get("complexity_level"),
        "estimated_roi": record.get("estimated_roi"),
    }


def main() -> None:
    start = time.time()

    # ─── Load data ───────────────────────────────────────────
    if not ENRICHED_FILE.exists():
        log.error(f"File not found: {ENRICHED_FILE}")
        sys.exit(1)

    records = json.loads(ENRICHED_FILE.read_text(encoding="utf-8"))
    log.info(f"Loaded {len(records)} records from {ENRICHED_FILE.name}")

    # ─── Load embedding model ────────────────────────────────
    log.info(f"Loading embedding model: {EMBEDDING_MODEL}")
    from sentence_transformers import SentenceTransformer

    model = SentenceTransformer(EMBEDDING_MODEL)
    log.info(f"Model loaded (dim={model.get_sentence_embedding_dimension()})")

    assert model.get_sentence_embedding_dimension() == VECTOR_DIM, (
        f"Expected {VECTOR_DIM} dims, got {model.get_sentence_embedding_dimension()}"
    )

    # ─── Build texts ─────────────────────────────────────────
    texts = [build_embedding_text(r) for r in records]
    ids = [r["id"] for r in records]
    payloads = [build_payload(r) for r in records]

    # ─── Generate embeddings in batches ──────────────────────
    log.info(f"Generating embeddings for {len(texts)} records (batch_size={BATCH_SIZE})...")
    all_embeddings = model.encode(
        texts,
        batch_size=BATCH_SIZE,
        show_progress_bar=True,
        normalize_embeddings=True,
    )
    log.info(f"Embeddings generated: shape={all_embeddings.shape}")

    # ─── Connect to Qdrant ───────────────────────────────────
    from qdrant_client import QdrantClient
    from qdrant_client.models import (
        Distance,
        PointStruct,
        VectorParams,
    )

    qdrant = QdrantClient(host=settings.QDRANT_HOST, port=settings.QDRANT_PORT)
    log.info(f"Connected to Qdrant at {settings.QDRANT_HOST}:{settings.QDRANT_PORT}")

    # ─── Recreate collection for clean/idempotent reseeds ────
    collections = [c.name for c in qdrant.get_collections().collections]
    if COLLECTION_NAME in collections:
        qdrant.delete_collection(collection_name=COLLECTION_NAME)
        log.info(f"Deleted existing collection '{COLLECTION_NAME}'")

    qdrant.create_collection(
        collection_name=COLLECTION_NAME,
        vectors_config=VectorParams(
            size=VECTOR_DIM,
            distance=Distance.COSINE,
        ),
    )
    log.info(f"Created collection '{COLLECTION_NAME}' (dim={VECTOR_DIM}, cosine)")

    # ─── Upsert in batches ───────────────────────────────────
    total_upserted = 0
    for batch_start in range(0, len(records), BATCH_SIZE):
        batch_end = min(batch_start + BATCH_SIZE, len(records))
        points = [
            PointStruct(
                id=stable_point_id(ids[i]),
                vector=all_embeddings[i].tolist(),
                payload={**payloads[i], "use_case_id": ids[i]},
            )
            for i in range(batch_start, batch_end)
        ]

        qdrant.upsert(collection_name=COLLECTION_NAME, points=points)
        total_upserted += len(points)

        if total_upserted % (BATCH_SIZE * 5) == 0 or batch_end == len(records):
            log.info(f"  Upserted {total_upserted}/{len(records)} points")

    duration = time.time() - start

    # ─── Report ──────────────────────────────────────────────
    collection_info = qdrant.get_collection(COLLECTION_NAME)
    log.info(f"\nSeed complete:")
    log.info(f"  Records processed: {len(records)}")
    log.info(f"  Points in Qdrant:  {collection_info.points_count}")
    log.info(f"  Vector dimension:  {VECTOR_DIM}")
    log.info(f"  Collection:        {COLLECTION_NAME}")
    log.info(f"  Duration:          {duration:.1f}s")


if __name__ == "__main__":
    main()
