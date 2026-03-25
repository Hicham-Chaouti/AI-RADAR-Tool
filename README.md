# 🎯 AI Radar DXC — Radar Tool V1 POC

> AI-augmented SaaS platform for DXC Technology's Managers and Pre-sales Consultants.
> Identify, score, and prioritize the most relevant AI use cases for a client and industry **in under 60 seconds**.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  LAYER 0 — SCRAPING PIPELINE (runs once at setup)           │
│  Sources: Google Cloud · IBM · Salesforce · McKinsey        │
│  Tools: httpx + BeautifulSoup + LLM Extractor               │
│  Output: raw_use_cases.json → seed_use_cases.json           │
└────────────────────────────┬────────────────────────────────┘
                             │ seed scripts
┌────────────────────────────▼────────────────────────────────┐
│  LAYER 1 — USER INPUT                                       │
│  Onboarding form: Sector · Client Name · Capabilities       │
└────────────────────────────┬────────────────────────────────┘
                             │ HTTP POST /api/v1/session
┌────────────────────────────▼────────────────────────────────┐
│  LAYER 2 — KNOWLEDGE BASE                                   │
│  60–200 real AI use cases from scraped public sources       │
│  Stored: PostgreSQL (structured) + Qdrant (vectors)          │
└────────────────────────────┬────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────┐
│  LAYER 3 — BACKEND & AI ENGINE                              │
│  FastAPI · Classic RAG (LlamaIndex) · LLM Router            │
│  Scoring Engine: 4 criteria computed at query time          │
└────────────────────────────┬────────────────────────────────┘
                             │ REST API
┌────────────────────────────▼────────────────────────────────┐
│  LAYER 4 — FRONTEND                                         │
│  React + TypeScript + Tailwind · Apache ECharts Radar       │
└────────────────────────────┬────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────┐
│  LAYER 5 — DELIVERABLES                                     │
│  PDF Report (WeasyPrint + Jinja2) · Top 10 · Radar Score    │
└─────────────────────────────────────────────────────────────┘
```

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 · TypeScript 5 · Tailwind 3 · Apache ECharts 5 |
| Backend | Python 3.11+ · FastAPI · Pydantic v2 |
| AI / RAG | LlamaIndex 0.10+ · OpenAI GPT-4o · Claude Sonnet |
| Embeddings | OpenAI `text-embedding-3-small` |
| Scraping | httpx · BeautifulSoup4 · markdownify |
| Vector DB | Qdrant |
| Relational DB | PostgreSQL 15 (asyncpg + SQLAlchemy async) |
| Cache | Redis 7 |
| PDF Export | WeasyPrint + Jinja2 |
| Infrastructure | Docker + Docker Compose |

## 🚀 Quickstart

### Prerequisites
- Docker & Docker Compose
- OpenAI API key
- Anthropic API key

### Setup

```bash
# 1. Clone and configure
cp .env.example .env
# Fill OPENAI_API_KEY, ANTHROPIC_API_KEY in .env

# 2. Start infrastructure
docker-compose up -d postgres redis qdrant

# 3. Run scraping pipeline (one-time, ~5 min)
docker-compose run backend python scripts/scrape_pipeline.py

# 4. Seed database and vector store
docker-compose run backend alembic upgrade head
docker-compose run backend python scripts/seed_db.py
docker-compose run backend python scripts/seed_qdrant.py

# 5. Start full stack
docker-compose up
```

### Access
- **Frontend:** http://localhost:5173
- **Backend API docs:** http://localhost:8000/docs
- **Qdrant dashboard:** http://localhost:6333/dashboard

## 📊 V1 Features

| # | Feature | Description |
|---|---|---|
| F0 | Scraping Pipeline | Builds KB from real public sources |
| F1 | Client Onboarding | Sector, capabilities, strategic objectives |
| F2 | Use Case Catalogue | 1,068 anonymized use cases in PostgreSQL + Qdrant |
| F3 | Sector Filters & Search | Qdrant vector similarity + metadata filters |
| F4 | Interactive Radar Chart | 5-axis ECharts radar with DXC branding |
| F5 | Scoring Engine | 4-criteria weighted formula (query-time) |
| F6 | Use Case Detail Cards | Challenge, solution, benefits, source URL |
| F7 | Top 10 Prioritized | Ranked by Radar Score + LLM justification |
| F8 | PDF Export | DXC branded report with source citations |
| F9 | Semantic Search | Natural language → Qdrant ranked results |
| F10 | Feedback System | Decision & outcome feedback with KPI tracking |
| F11 | Data Anonymization | Commercial name removal + generic descriptions |

## 🎉 Latest Release (v1.0.0)

### ✨ New Features
- **Decision Feedback System**: Track strategic decisions and confidence scores
- **Outcome Tracking**: Record implementation results and KPI metrics
- **Fully Anonymized Catalog**: 1,068 use cases without commercial brand names
- **Enhanced Radar Axes**: Aligned with 4-factor scoring engine

### 🔧 Improvements
- Upgraded ESLint to v9 with modern rules
- Improved UI with gradient effects and optimized spacing
- Better search parity between regular and session-aware endpoints
- Comprehensive data anonymization pipeline

### 🐛 Bug Fixes
- Fixed npm security vulnerabilities (3 resolved)
- Corrected sector normalization in search
- Enhanced error handling in API endpoints
- Fixed visibility of updated use cases

### 📦 Data Changes
- Removed all company-specific references (Wells Fargo, Salesforce, Google Cloud, etc.)
- Anonymized 457 descriptions with generic use case intent
- Removed company_example field references
- Updated AI solution descriptions to be platform-agnostic

**See [DEPLOYMENT.md](DEPLOYMENT.md) for professional deployment steps.**

## 📁 Project Structure

```
ai-radar-dxc/
├── backend/          Python FastAPI application
│   ├── app/          Core application (routes, models, services)
│   ├── scripts/      Scraping pipeline + DB seed scripts
│   ├── templates/    PDF report templates
│   └── tests/        pytest test suite
├── frontend/         React + TypeScript SPA
│   └── src/          Components, pages, store, API client
└── docs/             Architecture & API documentation
```

## 📄 License

Internal — DXC Technology
