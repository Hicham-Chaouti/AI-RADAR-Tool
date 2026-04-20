# Architecture — AI Radar DXC

> Detailed architecture documentation for the Radar Tool V1 POC.

## System Overview

See [README.md](../README.md) for the high-level architecture diagram.

## Layers

### Layer 0 — Scraping Pipeline
- **Purpose:** Build the Knowledge Base from real public sources
- **Components:** `scrape_pipeline.py`, httpx, BeautifulSoup4, markdownify, GPT-4o (extraction only)
- **Output:** `seed_use_cases.json`

### Layer 1 — User Input
- **Purpose:** Onboarding form to capture client context
- **Components:** React frontend form → POST /api/v1/session

### Layer 2 — Knowledge Base
- **Purpose:** 60–200 real AI use cases with guaranteed source traceability
- **Storage:** PostgreSQL (structured) + Qdrant (vectors)

### Layer 3 — Backend & AI Engine
- **Purpose:** Scoring, RAG retrieval, LLM justification
- **Components:** FastAPI, LlamaIndex, Scoring Engine, LLM Router

### Layer 4 — Frontend
- **Purpose:** Interactive visualization and export
- **Components:** React + TypeScript + Tailwind + ECharts radar

### Layer 5 — Deliverables
- **Purpose:** PDF report for client meetings
- **Components:** WeasyPrint + Jinja2 templates

## Data Flow

1. Scraping → `seed_use_cases.json` → PostgreSQL + Qdrant
2. User submits onboarding form → session created
3. POST /score → RAG retrieval → Scoring Engine → Top 10 → LLM justification (cached)
4. Frontend displays radar + top 10 → PDF export
