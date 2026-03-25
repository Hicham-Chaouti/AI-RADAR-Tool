# DECISIONS.md — AI Radar DXC

Architectural and design decisions for the Radar Tool V1 POC.

---

## D001 — Knowledge Base: Scraping vs Manual Entry

**Date:** 2026-03-10
**Status:** Confirmed
**Decision:** The Knowledge Base is built entirely via an automated scraping pipeline from public sources (Google Cloud, IBM, Salesforce, McKinsey). No manual entry, no LLM-generated values.
**Rationale:** Ensures data traceability and reproducibility. Every field must be linked to a `source_url`. The LLM is used only as a structured extractor — it reads source text and outputs only what is explicitly stated.

---

## D002 — Scoring Engine: Query-Time Computation vs Pre-Stored Scores

**Date:** 2026-03-10
**Status:** Confirmed
**Decision:** All scoring (Radar Score, Trend Strength, Client Relevance, Capability Match, Market Momentum) is computed at query time, never pre-stored.
**Rationale:** Pre-computed scores would require either manual estimation (forbidden by data integrity rules) or LLM inference (unreliable and not personalized). Query-time computation ensures scores are always tailored to the specific client profile and improve automatically as the KB grows.

---

## D003 — RAG Framework: LlamaIndex over LangChain

**Date:** 2026-03-10
**Status:** Confirmed
**Decision:** Use `llama-index-core 0.10+` with `VectorStoreIndex` and `llama-index-vector-stores-qdrant` for RAG retrieval.
**Rationale:** LlamaIndex provides a simpler, more focused API for vector store retrieval with metadata filtering. LangChain/LangGraph are explicitly excluded from V1 scope per master prompt §5.

---

## D004 — LLM Selection: Dual-Model Strategy

**Date:** 2026-03-10
**Status:** Confirmed
**Decision:** Use GPT-4o (OpenAI) for scoring justifications and structured extraction, Claude Sonnet (Anthropic) for PDF report summaries.
**Rationale:** GPT-4o excels at structured JSON extraction and concise scoring justifications. Claude Sonnet produces higher-quality long-form prose for executive PDF reports. Both via official SDKs with API keys from environment variables.

---

## D005 — Frontend Stack: Vite + React + Tailwind + ECharts

**Date:** 2026-03-10
**Status:** Confirmed
**Decision:** React 18 + TypeScript 5 + Tailwind CSS 3 + Apache ECharts 5 (`echarts-for-react`), state via Zustand, routing via React Router v6.
**Rationale:** Vite provides fast dev experience. Tailwind aligns with rapid prototyping. ECharts is the most flexible open-source radar chart library. Zustand is minimal and sufficient for V1's state needs.

---

## D006 — Database: PostgreSQL + Qdrant Dual Storage

**Date:** 2026-03-10
**Status:** Confirmed
**Decision:** Store structured use case data in PostgreSQL 15 (async via SQLAlchemy + asyncpg), vector embeddings in Qdrant, LLM response cache in Redis 7.
**Rationale:** PostgreSQL handles relational queries and session management. Qdrant handles semantic similarity search with metadata filters. Redis provides fast TTL-based caching for LLM responses to prevent duplicate API calls.

---

## D007 — Data Anonymization: Remove Commercial Brand References

**Date:** 2026-03-25
**Status:** Confirmed
**Decision:** Remove all commercial company and product names from use case catalog. Replace company-specific examples with generic, use-case-focused descriptions.
**Rationale:** Ensures catalog is vendor-neutral and client-agnostic. Removes bias toward specific vendors and allows customers to evaluate solutions on merit rather than brand reputation. Increases applicability across different customer contexts.
**Implementation:** 
- Automated script removes 26+ brand names (Wells Fargo, Google Cloud, Salesforce, etc.)
- Anonymizes 457 descriptions focusing on use case intent vs vendor tools
- Maintains source URLs for traceability
- Updated all 1,068 use cases without data loss
- Data integrity: Full backup created before transformation

---

## D008 — Feedback System: Decision + Outcome Tracking

**Date:** 2026-03-25
**Status:** Confirmed
**Decision:** Implement two-phase feedback: (1) Decision feedback (capture strategic assessment at recommendation time), (2) Outcome feedback (track results after implementation).
**Rationale:** Enables continuous learning from past recommendations. Decision feedback captures context and reasoning. Outcome feedback provides ground truth for model improvement.
**Fields:**
- **Decision**: status (approve/defer/reject), confidence, strategic_fit, business_value, feasibility, time_to_value, blockers, rationale, owner, next_step_date
- **Outcome**: implementation flag, KPI metrics, adoption %, satisfaction, delivery difficulty, risk incidents, notes
**API:** POST /api/v1/feedback/decision, POST /api/v1/feedback/outcome

---

## D009 — Frontend State Management: Zustand for Session & Radar

**Date:** 2026-03-25
**Status:** Confirmed
**Decision:** Use separate Zustand stores for session management (client profile) and radar visualization state.
**Rationale:** Clear separation of concerns. Session store persists user input across navigation. Radar store manages chart axes and visibility. Avoids prop drilling and simplifies component composition.
**Stores:** `sessionStore.ts` (sector, capabilities, client_name), `radarStore.ts` (chart state, selected use cases)

---

## D010 — Deployment: Docker Compose with Health Checks

**Date:** 2026-03-25
**Status:** Confirmed
**Decision:** Use Docker Compose for local development and staging. All services include health checks. Production deployment via separate infrastructure (e.g., Kubernetes, Cloud Run).
**Rationale:** Docker Compose ensures reproducible local environments. Health checks prevent cascading failures. Separates development convenience from production scalability.
**Services:** backend (FastAPI), frontend (Node.js), postgres (with health check), redis, qdrant
**Monitoring:** All services restart on failure via `restart_policy: unless-stopped`
