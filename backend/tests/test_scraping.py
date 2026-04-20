"""Tests for the scraping pipeline — verify data integrity.

These tests validate the output of scrape_pipeline.py
after it has been run against real sources.
"""

import json
from pathlib import Path

import pytest

# ─── Paths ──────────────────────────────────────────────────
DATA_DIR = Path(__file__).resolve().parent.parent / "data"
SEED_FILE = DATA_DIR / "seed_use_cases.json"

# ─── Controlled vocabulary ──────────────────────────────────
VALID_SECTORS = {
    "banking_finance", "healthcare", "retail_ecommerce",
    "energy_utilities", "manufacturing", "telecom",
    "media_entertainment", "technology", "public_sector",
    "transportation_logistics", "agriculture", "real_estate",
    "cross_industry",
}

VALID_FUNCTIONS = {
    "customer_service", "operations", "finance", "hr",
    "marketing", "it", "compliance", "supply_chain",
}

VALID_AGENT_TYPES = {
    "customer", "employee", "creative", "code", "data", "security",
    None,
}


@pytest.fixture
def use_cases() -> list[dict]:
    """Load seed use cases from JSON file."""
    if not SEED_FILE.exists():
        pytest.skip("seed_use_cases.json not found — run scrape_pipeline.py first")
    with open(SEED_FILE) as f:
        data = json.load(f)
    assert isinstance(data, list), "seed_use_cases.json must contain a JSON array"
    return data


class TestDataIntegrity:
    """Verify that scraped data meets integrity requirements."""

    def test_minimum_records(self, use_cases: list[dict]) -> None:
        """Pipeline must produce >= 60 records."""
        assert len(use_cases) >= 60, (
            f"Only {len(use_cases)} records, minimum 60 required"
        )

    def test_no_null_source_url(self, use_cases: list[dict]) -> None:
        """Every record must have a non-null, non-empty source_url."""
        for uc in use_cases:
            assert uc.get("source_url"), (
                f"Record '{uc.get('title', '?')}' has no source_url"
            )
            assert uc["source_url"].startswith("http"), (
                f"Invalid source_url: {uc['source_url']}"
            )

    def test_no_null_title(self, use_cases: list[dict]) -> None:
        """Every record must have a non-empty title."""
        for uc in use_cases:
            assert uc.get("title") and uc["title"].strip(), (
                f"Record {uc.get('id', '?')} has empty title"
            )

    def test_no_null_description(self, use_cases: list[dict]) -> None:
        """Every record must have a non-empty description."""
        for uc in use_cases:
            assert uc.get("description") and uc["description"].strip(), (
                f"Record '{uc.get('title', '?')}' has empty description"
            )

    def test_has_source_name(self, use_cases: list[dict]) -> None:
        """Every record must have a source_name."""
        for uc in use_cases:
            assert uc.get("source_name"), (
                f"Record '{uc.get('title', '?')}' has no source_name"
            )

    def test_has_scrape_date(self, use_cases: list[dict]) -> None:
        """Every record must have a scrape_date."""
        for uc in use_cases:
            assert uc.get("scrape_date"), (
                f"Record '{uc.get('title', '?')}' has no scrape_date"
            )

    def test_unique_ids(self, use_cases: list[dict]) -> None:
        """All use case IDs must be unique."""
        ids = [uc["id"] for uc in use_cases]
        assert len(ids) == len(set(ids)), "Duplicate IDs found"

    def test_id_format(self, use_cases: list[dict]) -> None:
        """IDs must follow the uc_NNN pattern."""
        for uc in use_cases:
            assert uc["id"].startswith("uc_"), f"Invalid ID format: {uc['id']}"


class TestSectorNormalization:
    """Verify sector normalization to controlled vocabulary."""

    def test_all_sectors_normalized(self, use_cases: list[dict]) -> None:
        """Every record must have a sector_normalized in the controlled vocab."""
        for uc in use_cases:
            assert uc.get("sector_normalized") in VALID_SECTORS, (
                f"Invalid sector_normalized: '{uc.get('sector_normalized')}' "
                f"for record '{uc.get('title', '?')}'"
            )


class TestDeduplication:
    """Verify no duplicates in the output."""

    def test_no_duplicate_title_sector(self, use_cases: list[dict]) -> None:
        """No two records should share the same title+sector_normalized."""
        seen: set[str] = set()
        for uc in use_cases:
            key = uc.get("title", "").lower() + uc.get("sector_normalized", "")
            assert key not in seen, (
                f"Duplicate found: '{uc.get('title')}' in sector "
                f"'{uc.get('sector_normalized')}'"
            )
            seen.add(key)


class TestAntiHallucination:
    """Verify no fields contain suspicious LLM-generated content."""

    def test_no_placeholder_values(self, use_cases: list[dict]) -> None:
        """Check for common LLM placeholder patterns."""
        placeholders = [
            "example company", "company xyz", "acme", "lorem ipsum",
            "placeholder", "[insert", "tbd", "n/a", "not available",
        ]
        for uc in use_cases:
            for field in ("company_example", "title", "description"):
                val = uc.get(field) or ""
                lower = val.lower()
                for ph in placeholders:
                    assert ph not in lower, (
                        f"Suspicious placeholder '{ph}' in {field} "
                        f"of record '{uc.get('title', '?')}'"
                    )

    def test_measurable_benefit_or_null(self, use_cases: list[dict]) -> None:
        """measurable_benefit should be null or contain specific content."""
        for uc in use_cases:
            benefit = uc.get("measurable_benefit")
            if benefit:
                assert len(benefit) > 10, (
                    f"measurable_benefit too short (likely hallucinated): "
                    f"'{benefit}' in '{uc.get('title', '?')}'"
                )
