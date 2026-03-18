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
