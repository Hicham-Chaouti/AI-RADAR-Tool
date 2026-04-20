"""001 — Initial schema for AI Radar DXC.

Creates the use_cases and client_sessions tables.

Revision ID: 001_initial_schema
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, ARRAY, JSONB
import uuid


revision = "001_initial_schema"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ─── use_cases table ────────────────────────────────────
    op.create_table(
        "use_cases",
        # Identity
        sa.Column("id", sa.String(length=20), primary_key=True),
        sa.Column("title", sa.String(length=500), nullable=False),
        sa.Column("original_title", sa.String(length=500), nullable=True),
        sa.Column("description", sa.Text, nullable=False),
        # Classification
        sa.Column("sector", sa.String(length=100), nullable=True),
        sa.Column("sector_normalized", sa.String(length=50), nullable=False),
        sa.Column("functions", ARRAY(sa.String), nullable=True),
        sa.Column("agent_type", sa.String(length=50), nullable=True),
        sa.Column("archetype", sa.String(length=60), nullable=True),
        # Business context
        sa.Column("company_example", sa.String(length=300), nullable=True),
        sa.Column("business_challenge", sa.Text, nullable=True),
        sa.Column("ai_solution", sa.Text, nullable=True),
        sa.Column("measurable_benefit", sa.Text, nullable=True),
        # Technical
        sa.Column("tech_keywords", ARRAY(sa.String), nullable=True),
        # Source
        sa.Column("source_url", sa.String(length=1000), nullable=False),
        sa.Column("source_name", sa.String(length=300), nullable=False),
        sa.Column("scrape_date", sa.Date, nullable=False),
        # Enriched
        sa.Column("benefits", ARRAY(sa.String), nullable=True),
        sa.Column("tools_and_technologies", ARRAY(sa.String), nullable=True),
        # Scoring
        sa.Column("trend_strength", sa.Integer, nullable=True),
        sa.Column("client_relevance", sa.Integer, nullable=True),
        sa.Column("capability_match", sa.Integer, nullable=True),
        sa.Column("market_momentum", sa.Integer, nullable=True),
        sa.Column("roi_potential", sa.Integer, nullable=True),
        sa.Column("technical_complexity", sa.Integer, nullable=True),
        sa.Column("market_maturity", sa.Integer, nullable=True),
        sa.Column("regulatory_risk", sa.Integer, nullable=True),
        sa.Column("quick_win_potential", sa.Integer, nullable=True),
        sa.Column("weighted_score", sa.Float, nullable=True),
        # Derived
        sa.Column("estimated_roi", sa.String(length=20), nullable=True),
        sa.Column("complexity_level", sa.String(length=20), nullable=True),
        sa.Column("quick_win", sa.Boolean, nullable=True),
        # Timestamps
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # ─── Indexes on use_cases ────────────────────────────────
    op.create_index("ix_use_cases_sector_normalized", "use_cases", ["sector_normalized"])
    op.create_index("ix_use_cases_archetype", "use_cases", ["archetype"])
    op.create_index("ix_use_cases_weighted_score", "use_cases", ["weighted_score"])
    op.create_index("ix_use_cases_quick_win", "use_cases", ["quick_win"])

    # ─── client_sessions table ───────────────────────────────
    op.create_table(
        "client_sessions",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, default=uuid.uuid4),
        sa.Column("sector", sa.String(length=50), nullable=False),
        sa.Column("client_name", sa.String(length=300), nullable=False),
        sa.Column("relationship_level", sa.String(length=50), nullable=True),
        sa.Column("business_proximity", sa.String(length=50), nullable=True),
        sa.Column("capabilities", ARRAY(sa.String), nullable=True),
        sa.Column("data_maturity", sa.String(length=50), nullable=True),
        sa.Column("strategic_objectives", ARRAY(sa.String), nullable=True),
        sa.Column("results", JSONB, nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )


def downgrade() -> None:
    op.drop_table("client_sessions")
    op.drop_index("ix_use_cases_quick_win", table_name="use_cases")
    op.drop_index("ix_use_cases_weighted_score", table_name="use_cases")
    op.drop_index("ix_use_cases_archetype", table_name="use_cases")
    op.drop_index("ix_use_cases_sector_normalized", table_name="use_cases")
    op.drop_table("use_cases")
