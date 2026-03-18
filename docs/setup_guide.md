# Setup Guide — AI Radar DXC

> Step-by-step guide to set up and run the Radar Tool V1 POC.

## Prerequisites

- Docker & Docker Compose
- OpenAI API key (for GPT-4o + embeddings)
- Anthropic API key (for Claude Sonnet PDF summaries)

## Setup Steps

### 1. Configure Environment

```bash
cp .env.example .env
# Edit .env and fill in:
# - OPENAI_API_KEY=sk-...
# - ANTHROPIC_API_KEY=sk-ant-...
```

### 2. Start Infrastructure

```bash
docker-compose up -d postgres redis qdrant
```

### 3. Run Scraping Pipeline (one-time, ~5 min)

```bash
docker-compose run backend python scripts/scrape_pipeline.py
```

This will:
- Fetch HTML from 5 public sources
- Extract use cases via GPT-4o (extraction only)
- Validate and deduplicate
- Output `backend/data/seed_use_cases.json` (≥ 60 records)
- Generate `backend/data/SCRAPING_REPORT.md`

### 4. Seed Database and Vector Store

```bash
docker-compose run backend alembic upgrade head
docker-compose run backend python scripts/seed_db.py
docker-compose run backend python scripts/seed_qdrant.py
```

### 5. Start Full Stack

```bash
docker-compose up
```

### 6. Access

| Service | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API docs | http://localhost:8000/docs |
| Qdrant dashboard | http://localhost:6333/dashboard |
