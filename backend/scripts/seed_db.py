"""Seed PostgreSQL from seed_use_cases_enriched.json.

Reads the enriched JSON and upserts all use cases into the
PostgreSQL use_cases table.

Usage:
    python scripts/seed_db.py
"""

from __future__ import annotations

import asyncio
import json
import logging
import sys
from pathlib import Path

from dotenv import load_dotenv
from pydantic import ValidationError
from sqlalchemy import text
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.ext.asyncio import AsyncSession

# ─── Setup paths ────────────────────────────────────────────
ROOT_DIR = Path(__file__).resolve().parent.parent.parent
load_dotenv(ROOT_DIR / ".env")

# Add backend to sys.path so app imports work
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.models.database import async_session_factory, engine  # noqa: E402
from app.models.use_case import UseCase  # noqa: E402
from app.schemas.use_case import UseCaseCreate  # noqa: E402

# ─── Config ─────────────────────────────────────────────────
DATA_DIR = Path(__file__).resolve().parent.parent / "data"
ENRICHED_FILE = DATA_DIR / "seed_use_cases_enriched.json"

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-7s | %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("seed_db")


async def seed() -> None:
    if not ENRICHED_FILE.exists():
        log.error(f"File not found: {ENRICHED_FILE}")
        sys.exit(1)

    raw_records = json.loads(ENRICHED_FILE.read_text(encoding="utf-8"))
    log.info(f"Loaded {len(raw_records)} records from {ENRICHED_FILE.name}")

    # Validate via Pydantic
    valid_records: list[dict] = []
    rejected = 0
    reject_reasons: list[str] = []

    for i, raw in enumerate(raw_records):
        try:
            uc = UseCaseCreate.model_validate(raw)
            valid_records.append(uc.model_dump())
        except ValidationError as e:
            rejected += 1
            reason = f"Record {i} (id={raw.get('id', '?')}): {e.error_count()} validation errors"
            if rejected <= 10:
                reject_reasons.append(reason)
                log.warning(f"  Rejected: {reason}")

    log.info(f"Validated: {len(valid_records)} valid, {rejected} rejected")

    if not valid_records:
        log.error("No valid records to insert")
        sys.exit(1)

    # Upsert into PostgreSQL
    inserted = 0
    updated = 0

    async with async_session_factory() as session:
        # Process in batches of 100
        batch_size = 100
        for batch_start in range(0, len(valid_records), batch_size):
            batch = valid_records[batch_start : batch_start + batch_size]

            stmt = pg_insert(UseCase).values(batch)
            # On conflict (id), update all columns except id and created_at
            update_cols = {
                col.name: stmt.excluded[col.name]
                for col in UseCase.__table__.columns
                if col.name not in ("id", "created_at")
            }
            stmt = stmt.on_conflict_do_update(
                index_elements=["id"],
                set_=update_cols,
            )

            result = await session.execute(stmt)
            await session.commit()

            batch_count = len(batch)
            log.info(f"  Batch {batch_start // batch_size + 1}: {batch_count} records upserted")

        # Count final totals
        row = await session.execute(text("SELECT COUNT(*) FROM use_cases"))
        total_in_db = row.scalar()

    log.info(f"\nSeed complete:")
    log.info(f"  Records in JSON: {len(valid_records)}")
    log.info(f"  Records in DB:   {total_in_db}")
    log.info(f"  Rejected:        {rejected}")
    if reject_reasons:
        log.info(f"  First rejection reasons:")
        for r in reject_reasons[:5]:
            log.info(f"    - {r}")


async def main() -> None:
    try:
        await seed()
    finally:
        await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())
