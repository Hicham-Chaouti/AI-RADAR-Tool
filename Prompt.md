# MASTER PROMPT — Radar Tool V1 POC
## AI Use Cases par Industrie | DXC Technology
### Autonomous Development Agent Instructions — v4.0

---

## 0. PREAMBLE — READ THIS FIRST

You are an autonomous AI development agent. You will receive an **empty project folder** named `ai-radar-dxc`. Your mission is to **design, architect, and fully implement** the Radar Tool V1 POC from scratch.

### Decision Protocol
When you encounter a design ambiguity, **do not silently pick one**. Present the options with tradeoffs, ask the project owner to choose, then document the confirmed decision in `DECISIONS.md` before continuing.

### Absolute Data Integrity Rule
**This rule overrides everything else regarding the Knowledge Base:**
The system must never generate, estimate, invent, or hallucinate any information that ends up in the knowledge base. Every data point stored in the system must be traceable to a real, named, publicly accessible source. If a field cannot be extracted from a source, it is left `null`. It is never filled by inference or model estimation.

---

## 1. PROJECT CONTEXT & OBJECTIVE

The **Radar Tool** is an AI-augmented SaaS platform for **DXC Technology's Managers and Pre-sales Consultants**. It lets them identify, score, and prioritize the most relevant AI use cases for a client and industry **in under 60 seconds** (target: 30 seconds for core result).

### Business Problem
- Consultants spend 2–3 weeks manually building AI roadmaps per client.
- No shared knowledge base or reproducible scoring methodology exists.
- 62% of executives have no structured AI roadmap (McKinsey 2024).
- Pre-sales teams lose deals because they cannot produce credible AI analysis fast enough.

### V1 POC Deliverables
1. Scraping pipeline that builds the knowledge base from real public sources
2. Structured use case catalogue in PostgreSQL + Qdrant
3. Scoring engine (4 weighted criteria)
4. Interactive radar chart + Top 10 results
5. One-click personalized PDF export

**Demo-ready: end of March 2026.**

---

## 2. PRIMARY USERS

| Persona | Role | Key Features |
|---|---|---|
| **Pre-sales Consultant** | Client pitches and proposals | Radar + Scoring + PDF Export |
| **Manager / Account Manager** | Qualify AI opportunities | Top 10 + Search + Sector Benchmark |

The end client never uses the platform. The PDF/radar output is what goes to the client meeting.

---

## 3. CRITICAL CONSTRAINTS

1. **Empty project folder.** Create everything from scratch.
2. **Knowledge Base = scraping only.** No manual entry, no LLM-generated values, no estimated scores. Every field in every use case must be traceable to a real public source URL.
3. **Only real, verified libraries.** Never invent a package name.
4. **All LLM calls via official SDKs** with API keys from environment variables.
5. **Single command startup:** `docker-compose up` after `.env` setup.
6. **V1 scope only.** Do not implement V2/V3 features.
7. **Speed as a UX requirement.** POST /score → Top 10 in under 30 seconds.

---

## 4. SYSTEM ARCHITECTURE

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
│  Onboarding form: Sector · Client Name · Relationship ·     │
│  Business Proximity · Internal AI Capabilities              │
└────────────────────────────┬────────────────────────────────┘
                             │ HTTP POST /api/v1/session
┌────────────────────────────▼────────────────────────────────┐
│  LAYER 2 — KNOWLEDGE BASE                                   │
│  60–200 real AI use cases from scraped public sources       │
│  Stored: PostgreSQL (structured) + Qdrant (vectors)          │
└────────────────────────────┬────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────┐
│  LAYER 3 — STORAGE                                          │
│  Qdrant · PostgreSQL · Redis (LLM cache)                     │
└────────────────────────────┬────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────┐
│  LAYER 4 — BACKEND & AI ENGINE                              │
│  FastAPI · Classic RAG (LlamaIndex) · LLM Router            │
│  Scoring Engine: 4 criteria computed at query time          │
│  Semantic Matching + Sector Filters + Top-10 Ranking         │
└────────────────────────────┬────────────────────────────────┘
                             │ REST API
┌────────────────────────────▼────────────────────────────────┐
│  LAYER 5 — FRONTEND                                         │
│  React + TypeScript + Tailwind · Apache ECharts Radar       │
└────────────────────────────┬────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────┐
│  LAYER 6 — DELIVERABLES                                     │
│  PDF Report (WeasyPrint + Jinja2) · Top 10 · Radar Score    │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. TECHNOLOGY STACK

| Layer | Technology | Notes |
|---|---|---|
| Frontend | React 18 + TypeScript 5 + Tailwind 3 | |
| Frontend | Apache ECharts 5 (echarts-for-react) | Radar chart |
| Frontend | Axios + Zustand + React Router v6 | |
| Backend | Python 3.11+ · FastAPI 0.110+ · Pydantic v2 | |
| AI / RAG | llama-index-core 0.10+ | VectorStoreIndex |
| AI / RAG | llama-index-vector-stores-qdrant | |
| AI / LLM | openai SDK (GPT-4o) | Scoring justifications |
| AI / LLM | anthropic SDK (Claude Sonnet) | PDF summaries |
| AI / Embeddings | OpenAI text-embedding-3-small | |
| **Scraping** | **httpx + BeautifulSoup4** | HTTP requests + HTML parsing |
| **Scraping** | **markdownify** | HTML → clean Markdown |
| Vector DB | Qdrant (qdrant-client) | |
| Relational DB | PostgreSQL 15 (asyncpg + SQLAlchemy async) | |
| Cache | Redis 7 (redis-py async) | |
| PDF | WeasyPrint + Jinja2 | |
| Infrastructure | Docker + Docker Compose | |

**NOT in V1 scope:** LangChain, LangGraph, Neo4j, Airflow, Playwright, Firecrawl.

---

## 6. KNOWLEDGE BASE — SCRAPING PIPELINE (CRITICAL SECTION)

### 6.1 Architecture Overview

The Knowledge Base is built entirely from real public sources via an automated scraping pipeline. **No value is invented, estimated, or generated by an LLM.** The LLM is only used as a structured **extractor** — it reads source text and outputs only what is explicitly stated in that text.

```
┌──────────────────────────────────────────────────────────────┐
│  SCRAPING PIPELINE  (backend/scripts/scrape_pipeline.py)     │
│                                                              │
│  Step 1 — FETCH          Step 2 — EXTRACT                    │
│  httpx GET each URL  →   LLM reads page text,               │
│  save raw HTML/text      outputs ONLY what's stated          │
│                                                              │
│  Step 3 — STRUCTURE      Step 4 — VALIDATE                   │
│  Map to use case schema  Pydantic strict validation          │
│  null if not in source   Reject if source_url missing        │
│                                                              │
│  Step 5 — DEDUPLICATE    Step 6 — OUTPUT                     │
│  Hash on title+sector    seed_use_cases.json                 │
│  drop duplicates         + SCRAPING_REPORT.md                │
└──────────────────────────────────────────────────────────────┘
```

### 6.2 Target Sources — Confirmed Public URLs

| Priority | Source | URL | What it contains | Scraping strategy |
|---|---|---|---|---|
| ⭐⭐⭐⭐⭐ | **Google Cloud 1001 Use Cases** | `https://cloud.google.com/transform/101-real-world-generative-ai-use-cases-from-industry-leaders` | 1001 real cases: company name, description, sector, agent type | Single page, paginate if needed, BS4 parse |
| ⭐⭐⭐⭐⭐ | **Google Cloud AI Blueprints** | `https://cloud.google.com/blog/products/ai-machine-learning/real-world-gen-ai-use-cases-with-technical-blueprints` | Business challenge + tech stack + solution blueprint | BS4 parse structured sections |
| ⭐⭐⭐⭐ | **IBM watsonx Use Cases** | `https://www.ibm.com/products/watsonx/use-cases` | Transversal enterprise use cases with descriptions | BS4 parse use case cards |
| ⭐⭐⭐ | **Salesforce AI Use Cases** | `https://www.salesforce.com/artificial-intelligence/use-cases/` | Front-office use cases (CRM, sales, service) | BS4 parse |
| ⭐⭐⭐ | **McKinsey AI Insights** | `https://www.mckinsey.com/capabilities/quantumblack/our-insights/the-state-of-ai` | Adoption data, function-level use cases by industry | Fetch public article, extract text |

### 6.3 Use Case Schema — Two Tiers

The schema is split into two tiers. **Only Tier 1 is populated by scraping.** Tier 2 is computed dynamically by the Scoring Engine at query time.

#### Tier 1 — Scraped Fields (100% from source, never invented)

```json
{
  "id": "uc_001",
  "title": "Conversational AI for Customer Service",
  "description": "General Motors OnStar augmented with new AI features including a virtual assistant powered by Google Cloud conversational AI technologies, better able to recognize speaker intent.",
  "sector": "automotive",
  "sector_normalized": "manufacturing",
  "functions": ["customer_service"],
  "agent_type": "customer",
  "company_example": "General Motors — OnStar",
  "business_challenge": "Customers struggle with traditional IVR systems that fail to understand natural language queries.",
  "ai_solution": "Conversational AI virtual assistant powered by large language model to recognize intent and provide contextual responses.",
  "measurable_benefit": "Improved intent recognition accuracy, reduced call handling time.",
  "tech_keywords": ["conversational AI", "NLP", "virtual assistant", "LLM"],
  "source_url": "https://cloud.google.com/transform/101-real-world-generative-ai-use-cases-from-industry-leaders",
  "source_name": "Google Cloud — 1001 Real-World Gen AI Use Cases",
  "scrape_date": "2026-03-01"
}
```

#### Tier 2 — Computed Fields (calculated at query time by Scoring Engine, never stored as static values)

```
radar_score            → computed from 4 weighted criteria
trend_strength         → derived from tech_keywords frequency in KB + recency of scrape_date
client_relevance       → cosine similarity between user query vector and use case embedding
capability_match       → intersection of user capabilities vs tech_keywords
market_momentum        → number of company examples sharing same use case type in KB
justification          → LLM-generated at query time, cached in Redis
```

**Why this design?** Storing pre-computed scores would require either manual estimation (forbidden) or LLM inference (unreliable). Computing at query time means scores are always personalized to the specific client profile, and they improve automatically as the KB grows.

### 6.4 Scraping Pipeline — Implementation Specification

#### File: `backend/scripts/scrape_pipeline.py`

This is a standalone Python script that runs **before** the main application. It produces `backend/data/seed_use_cases.json`.

```python
"""
Scraping pipeline for ai-radar-dxc Knowledge Base.

Usage:
    python scripts/scrape_pipeline.py

Output:
    backend/data/seed_use_cases.json   — structured use cases
    backend/data/raw/                  — raw HTML/text from each source
    backend/data/SCRAPING_REPORT.md    — per-source extraction stats

Rules:
    - Never invent or estimate any field value
    - Every record must have source_url populated
    - LLM is used only for structured extraction, not generation
    - If extraction fails for a field → set to null
    - Minimum 60 records required before pipeline succeeds
"""
```

**Step 1 — Fetch:** Use `httpx` (async) to GET each source URL. Save raw HTML to `backend/data/raw/{source_name}.html`. Respect rate limits (1 request/second per domain). Handle 429/503 with exponential backoff.

**Step 2 — Parse:** Use `BeautifulSoup4` to extract the main content area (strip nav, footer, ads). Convert to clean Markdown via `markdownify`. Save to `backend/data/raw/{source_name}.md`.

**Step 3 — LLM Extraction:** For each source's Markdown content, send chunks (max 4000 tokens) to GPT-4o with the following extraction prompt:

```python
EXTRACTION_PROMPT = """
You are a structured data extractor. Read the following text from {source_name} 
and extract AI use cases. 

STRICT RULES — violating these makes the output unusable:
1. Only extract information EXPLICITLY stated in the text
2. Do NOT infer, estimate, or assume any value
3. If a field is not clearly stated in the text, set it to null
4. Do NOT generate company names, metrics, or descriptions not in the text
5. Do NOT fill "measurable_benefit" unless a specific number or outcome is stated

For each use case found, return a JSON object with these fields:
- title: string (the use case name, as described in the text)
- description: string (verbatim or very close paraphrase of what the text says)
- sector: string (industry sector as mentioned in the source)
- functions: list[string] (business functions mentioned: customer_service, operations, finance, hr, marketing, it, compliance, supply_chain)
- agent_type: string | null (if mentioned: customer, employee, creative, code, data, security)
- company_example: string | null (exact company name if mentioned)
- business_challenge: string | null (if explicitly described)
- ai_solution: string | null (the AI approach described)
- measurable_benefit: string | null (ONLY if a specific metric is stated in the text)
- tech_keywords: list[string] (AI/tech terms mentioned: NLP, computer vision, LLM, etc.)

Return ONLY a JSON array. No explanation, no preamble.
Source text:
{text_chunk}
"""
```

**Step 4 — Validate:** Parse LLM JSON output. Apply Pydantic validation. Reject records with missing `title`, `description`, or `source_url`. Log rejected records to `SCRAPING_REPORT.md`.

**Step 5 — Normalize sectors:** Map raw sector strings to the controlled vocabulary:
```python
SECTOR_MAPPING = {
    "financial services": "banking_finance",
    "banking": "banking_finance",
    "insurance": "banking_finance",
    "health": "healthcare",
    "life sciences": "healthcare",
    "pharma": "healthcare",
    "retail": "retail_ecommerce",
    "ecommerce": "retail_ecommerce",
    "consumer": "retail_ecommerce",
    "energy": "energy_utilities",
    "utilities": "energy_utilities",
    "manufacturing": "manufacturing",
    "automotive": "manufacturing",
    "industrial": "manufacturing",
    # others → "cross_industry"
}
```

**Step 6 — Deduplicate:** Hash on `title.lower() + sector_normalized`. Drop exact duplicates. Keep the one with more non-null fields.

**Step 7 — Write output:**
- `backend/data/seed_use_cases.json` — validated array of use case objects
- `backend/data/SCRAPING_REPORT.md` — summary: source name, records extracted, records rejected, rejection reasons, total records by sector

**Minimum threshold:** If total records < 60, raise an error and abort seed scripts with message: `"Scraping pipeline produced only N records. Minimum 60 required. Check SCRAPING_REPORT.md."`

### 6.5 Embedding Strategy

The embedding for each use case is built from a **concatenated text** of all available text fields:

```python
def build_embedding_text(use_case: dict) -> str:
    parts = [
        use_case.get("title", ""),
        use_case.get("description", ""),
        use_case.get("sector_normalized", ""),
        " ".join(use_case.get("functions", [])),
        use_case.get("business_challenge") or "",
        use_case.get("ai_solution") or "",
        use_case.get("measurable_benefit") or "",
        " ".join(use_case.get("tech_keywords", [])),
    ]
    return " | ".join(p for p in parts if p.strip())
```

This maximises semantic richness for RAG retrieval even when some fields are null.

---

## 7. SCORING ENGINE SPECIFICATION

### Formula (computed at query time, never pre-stored)

```
Radar Score (0–10) =
  (Trend_Strength    × 0.25) +
  (Client_Relevance  × 0.30) +
  (Capability_Match  × 0.25) +
  (Market_Momentum   × 0.20)
```

### Component Computations

**Trend_Strength (0–10)**
How recently was this use case scraped AND how many other KB entries share the same `tech_keywords`?
```python
recency_score = 10 if days_since_scrape < 90 else max(1, 10 - days_since_scrape // 90)
keyword_density = min(10, len(tech_keywords_overlap_with_KB) * 2)
trend_strength = (recency_score + keyword_density) / 2
```

**Client_Relevance (0–10)**
Cosine similarity between:
- Query vector: embedding of `"{sector} {capabilities} {strategic_objectives}"`
- Use case vector: stored in Qdrant
```python
client_relevance = cosine_similarity(query_vector, use_case_vector) * 10
```

**Capability_Match (0–10)**
Overlap between user-selected capabilities and use case `tech_keywords`:
```python
# Map user capabilities to tech keyword clusters
CAPABILITY_KEYWORDS = {
    "AI": ["machine learning", "ML", "AI", "model", "prediction"],
    "GenAI": ["LLM", "generative", "GPT", "claude", "gemini", "NLP"],
    "Computer Vision": ["computer vision", "image", "video", "OCR", "detection"],
    "Data": ["analytics", "data", "BI", "dashboard", "reporting"],
    "Cloud": ["cloud", "GCP", "AWS", "Azure", "kubernetes"],
    "Agentic AI": ["agent", "agentic", "autonomous", "orchestration"],
    "Dev": ["code", "development", "API", "integration"],
}

matched = sum(
    1 for cap in user_capabilities
    for kw in CAPABILITY_KEYWORDS.get(cap, [])
    if kw.lower() in use_case_tech_keywords_text.lower()
)
capability_match = min(10, matched * 2)
```

**Market_Momentum (0–10)**
How many distinct company examples in the KB share the same use case pattern?
```python
similar_count = count_KB_entries_with_similar_tech_keywords(use_case)
market_momentum = min(10, similar_count * 1.5)
```

### LLM Justification (Top 10 only, Redis-cached, TTL 1 hour)

```python
JUSTIFICATION_PROMPT = """
You are a DXC Technology pre-sales consultant. Write a 2-3 sentence justification 
explaining why this AI use case is relevant for this specific client.

Client profile:
- Sector: {sector}
- Capabilities: {capabilities}
- Strategic objectives: {objectives}

Use case:
- Title: {title}
- Description: {description}
- Company example: {company_example}
- Measurable benefit: {measurable_benefit}

Rules:
- Be specific, not generic
- Reference the client's sector and capabilities
- If a real company example exists, mention it
- Do NOT invent metrics not in the use case data
- Maximum 3 sentences
"""
```

---

## 8. V1 FEATURES — EXACT SCOPE

| # | Feature | Description |
|---|---|---|
| F0 | **Scraping Pipeline** | `scrape_pipeline.py` builds KB from real sources → `seed_use_cases.json` |
| F1 | **Client Onboarding Form** | Sector, Client Name, Relationship Level, Business Proximity, AI Capabilities checkboxes |
| F2 | **Use Case Catalogue** | Scraped use cases in PostgreSQL + Qdrant |
| F3 | **Sector Filters & Semantic Search** | Qdrant vector similarity + metadata filters |
| F4 | **Interactive Radar Chart** | 5 axes: ROI Potential · Technical Complexity · Market Maturity · Regulatory Risk · Quick Win Potential — Apache ECharts |
| F5 | **Scoring Engine** | 4-criteria weighted formula computed at query time |
| F6 | **Use Case Detail Cards** | Full scraped data: company example, challenge, solution, benefit, source URL |
| F7 | **Top 10 Prioritized** | Ranked by Radar Score + LLM justification (cached) |
| F8 | **PDF Export** | WeasyPrint + Jinja2, DXC branded |
| F9 | **Semantic Search** | Natural language → Qdrant ranked results |

---

## 9. DXC BRAND & COLOR PALETTE

Extracted from the official DXC logo (`dxclogo.png`):

```
DXC Blue (primary)    : #6198F3  → primary buttons, links, radar fill
DXC Blue (dark)       : #334970  → headers, nav, section backgrounds
DXC Orange (primary)  : #FF9259  → accents, active states, score badges
DXC Orange (vibrant)  : #FF8A55  → hover states
DXC Coral             : #E98166  → warnings, secondary accents
Background (dark)     : #111111
Background (light)    : #FFFFFF
Text on dark          : #F5F5F5
Text on light         : #1A1A2E
```

**Tailwind config:**
```js
extend: {
  colors: {
    dxc: {
      blue: '#6198F3',
      'blue-dark': '#334970',
      orange: '#FF9259',
      'orange-vibrant': '#FF8A55',
      coral: '#E98166',
    }
  }
}
```

---

## 10. PROJECT FOLDER STRUCTURE

```
ai-radar-dxc/
│
├── README.md
├── DECISIONS.md
├── docker-compose.yml
├── .env.example
├── .gitignore
│
├── backend/
│   ├── pyproject.toml
│   ├── Dockerfile
│   │
│   ├── alembic/
│   │   ├── alembic.ini
│   │   ├── env.py
│   │   └── versions/
│   │       └── 001_initial_schema.py
│   │
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── dependencies.py
│   │   │
│   │   ├── api/v1/
│   │   │   ├── router.py
│   │   │   ├── sessions.py
│   │   │   ├── search.py
│   │   │   ├── usecases.py
│   │   │   ├── scoring.py
│   │   │   └── export.py
│   │   │
│   │   ├── models/
│   │   │   ├── database.py
│   │   │   ├── use_case.py
│   │   │   └── session.py
│   │   │
│   │   ├── schemas/
│   │   │   ├── use_case.py
│   │   │   ├── session.py
│   │   │   └── scoring.py
│   │   │
│   │   ├── services/
│   │   │   ├── rag_service.py
│   │   │   ├── scoring_service.py
│   │   │   ├── llm_router.py
│   │   │   ├── pdf_service.py
│   │   │   ├── cache_service.py
│   │   │   └── embedding_service.py
│   │   │
│   │   ├── prompts/
│   │   │   ├── justification.py
│   │   │   └── report_summary.py
│   │   │
│   │   └── utils/
│   │       └── logger.py
│   │
│   ├── data/
│   │   ├── raw/                       # Raw HTML/MD from each source (gitignored)
│   │   ├── seed_use_cases.json        # Output of scraping pipeline
│   │   └── SCRAPING_REPORT.md         # Per-source extraction statistics
│   │
│   ├── scripts/
│   │   ├── scrape_pipeline.py         # ← NEW: scrapes all sources → seed_use_cases.json
│   │   ├── seed_db.py                 # Reads seed_use_cases.json → PostgreSQL
│   │   └── seed_qdrant.py             # Embeds use cases → Qdrant
│   │
│   ├── templates/
│   │   ├── pdf_report.html
│   │   └── pdf_report.css
│   │
│   └── tests/
│       ├── test_scraping.py
│       ├── test_scoring.py
│       ├── test_api_session.py
│       ├── test_api_score.py
│       └── test_pdf.py
│
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   ├── index.html
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── api/          client.ts · sessions.ts · search.ts · export.ts
│       ├── components/
│       │   ├── layout/         Header.tsx · Layout.tsx
│       │   ├── onboarding/     OnboardingForm.tsx · SectorSelect.tsx · CapabilityCheckboxes.tsx
│       │   ├── radar/          RadarChart.tsx · RadarLegend.tsx
│       │   ├── usecases/       UseCaseCard.tsx · UseCaseDetailModal.tsx · TopTenList.tsx · ScoreBadge.tsx
│       │   ├── search/         SearchBar.tsx · FilterPanel.tsx
│       │   └── common/         Button.tsx · LoadingSpinner.tsx · ErrorBanner.tsx
│       ├── pages/        OnboardingPage.tsx · ResultsPage.tsx · ExportPage.tsx
│       ├── store/         sessionStore.ts
│       ├── types/         useCase.ts · session.ts
│       └── utils/         formatters.ts
│
└── docs/
    ├── architecture.md
    ├── api_reference.md
    ├── scraping_strategy.md      # Documents sources, pipeline, data integrity rules
    └── setup_guide.md
```

---

## 11. STEP-BY-STEP DEVELOPMENT TASKS

### PHASE 0 — Bootstrap
- [ ] T0.1 Create full folder structure
- [ ] T0.2 `docker-compose.yml` with all 5 services
- [ ] T0.3 `.env.example` with all variables
- [ ] T0.4 `README.md` with quickstart
- [ ] T0.5 Initial `DECISIONS.md`

### PHASE 1 — Scraping Pipeline ← START HERE
- [ ] T1.1 Implement `scrape_pipeline.py`:
  - `fetch_source(url)` → async httpx GET, save raw to `data/raw/`
  - `parse_html(html)` → BeautifulSoup4 + markdownify → clean Markdown
  - `extract_use_cases(markdown, source_name, source_url)` → GPT-4o extraction-only call
  - `normalize_sector(raw_sector)` → controlled vocabulary mapping
  - `deduplicate(records)` → hash-based dedup
  - `validate_and_write(records)` → Pydantic validation → `seed_use_cases.json`
  - `write_report(stats)` → `SCRAPING_REPORT.md`
- [ ] T1.2 Run pipeline against all 5 sources. Verify output ≥ 60 records.
- [ ] T1.3 Review `SCRAPING_REPORT.md` — confirm no hallucinated fields
- [ ] T1.4 **CHECKPOINT**: Manually inspect 10 random records. Verify every field is traceable to source.

### PHASE 2 — Data Layer
- [ ] T2.1 SQLAlchemy async models + Alembic migration
- [ ] T2.2 `seed_db.py` — reads `seed_use_cases.json` → PostgreSQL
- [ ] T2.3 `seed_qdrant.py` — builds embedding text, generates embeddings, indexes into Qdrant
- [ ] T2.4 **CHECKPOINT**: Query Qdrant for "customer churn prediction" → verify relevant results

### PHASE 3 — Backend Core Services
- [ ] T3.1 `app/config.py` — Pydantic Settings
- [ ] T3.2 `app/dependencies.py` — DB, Redis, Qdrant as FastAPI Depends()
- [ ] T3.3 `app/main.py` — lifespan, CORS, routers, `GET /health`
- [ ] T3.4 `embedding_service.py` — async OpenAI embeddings with backoff
- [ ] T3.5 `rag_service.py` — LlamaIndex VectorStoreIndex on Qdrant with sector metadata filters
- [ ] T3.6 `scoring_service.py` — `ScoringEngine` implementing the 4-component formula from §7
- [ ] T3.7 `cache_service.py` — Redis get/set/delete
- [ ] T3.8 `llm_router.py` — routes GPT-4o / Claude Sonnet, checks Redis cache first
- [ ] T3.9 Write prompts in `app/prompts/` from §7

### PHASE 4 — API Endpoints
- [ ] T4.1 `POST /api/v1/session` → session_id
- [ ] T4.2 `POST /api/v1/score` → Top 10 (RAG + scoring + LLM justification + cache)
- [ ] T4.3 `GET /api/v1/search?q=&sector=&function=` → ranked results
- [ ] T4.4 `GET /api/v1/usecases/{id}` → full use case detail
- [ ] T4.5 `GET /api/v1/export/pdf/{session_id}` → PDF bytes
- [ ] T4.6 **CHECKPOINT**: All endpoints visible and tested at `/docs`. Measure response time for /score.

### PHASE 5 — PDF Export
- [ ] T5.1 `pdf_report.html` — DXC branded layout with scraped source citations
- [ ] T5.2 `pdf_report.css` — DXC color palette from §9
- [ ] T5.3 `pdf_service.py` — Jinja2 → WeasyPrint → PDF bytes
- [ ] T5.4 **CHECKPOINT**: Sample PDF for one session, verify layout and source citations visible

### PHASE 6 — Frontend
- [ ] T6.1 Vite + React + TS + Tailwind + ECharts setup
- [ ] T6.2 Tailwind DXC color config
- [ ] T6.3 Axios client + Zustand store
- [ ] T6.4 `OnboardingPage.tsx` — form → POST /session → POST /score → navigate
- [ ] T6.5 `RadarChart.tsx` — ECharts 5-axis radar with DXC colors
- [ ] T6.6 `TopTenList.tsx` — scores + LLM justification + source URL badge
- [ ] T6.7 `UseCaseDetailModal.tsx` — shows company_example, challenge, solution, source_url as clickable link
- [ ] T6.8 `ResultsPage.tsx` — radar + top 10 + search + export
- [ ] T6.9 `SearchBar.tsx` + `FilterPanel.tsx` — 300ms debounce
- [ ] T6.10 Export button → PDF download
- [ ] T6.11 **CHECKPOINT**: Full end-to-end UI flow

### PHASE 7 — Tests & Integration
- [ ] T7.1 `test_scraping.py` — verify no null source_url, no estimated fields
- [ ] T7.2 `test_scoring.py` — unit tests for each score component
- [ ] T7.3 Integration tests for all API endpoints (mock LLM)
- [ ] T7.4 `docker-compose up` full stack test
- [ ] T7.5 Redis cache verification
- [ ] T7.6 Performance: POST /score < 30s end-to-end

### PHASE 8 — Documentation
- [ ] T8.1 `docs/scraping_strategy.md` — sources, pipeline design, data integrity guarantees
- [ ] T8.2 `docs/api_reference.md` — all endpoints with payloads
- [ ] T8.3 `docs/setup_guide.md` — including scraping pipeline as Step 1
- [ ] T8.4 Type annotations + docstrings on all Python
- [ ] T8.5 JSDoc on all TS component props
- [ ] T8.6 Final `DECISIONS.md`

---

## 12. SETUP SEQUENCE (in order)

```bash
# 1. Clone and configure
cp .env.example .env
# fill OPENAI_API_KEY, ANTHROPIC_API_KEY in .env

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
# Frontend: http://localhost:5173
# Backend API docs: http://localhost:8000/docs
```

---

## 13. CODE QUALITY STANDARDS

- **Python**: PEP 8, type annotations everywhere, async/await for all I/O
- **TypeScript**: Strict mode, no `any`, explicit interfaces for all props
- **Error handling**: Structured `{"error": "...", "detail": "...", "status_code": N}` on all endpoints
- **Separation of concerns**: Routes = HTTP only. Logic = services. No SQL in routes.
- **Zero hardcoded values**: All config via `config.py` from env vars
- **Logging**: JSON logs. Every LLM call logs model + tokens + cache_hit + latency_ms
- **Data integrity**: Scraping pipeline logs every rejected record with reason

---

## 14. EXPECTED API I/O

### Input
```json
{
  "sector": "banking_finance",
  "client_name": "Banque Nationale XYZ",
  "relationship_level": "existing",
  "business_proximity": "high",
  "capabilities": ["AI", "Data", "GenAI"],
  "data_maturity": "intermediate",
  "strategic_objectives": ["reduce operational costs", "improve customer experience"]
}
```

### Output (Top 10)
```json
{
  "session_id": "uuid-...",
  "sector": "banking_finance",
  "processing_time_ms": 7840,
  "top_10": [
    {
      "rank": 1,
      "use_case_id": "uc_042",
      "title": "Conversational AI for Overdraft Prevention",
      "company_example": "Bud Financial — Vertex AI",
      "source_url": "https://cloud.google.com/transform/101-real-world-generative-ai-use-cases-from-industry-leaders",
      "radar_score": 8.7,
      "score_breakdown": {
        "trend_strength": 8.5,
        "client_relevance": 9.2,
        "capability_match": 8.0,
        "market_momentum": 9.0
      },
      "radar_axes": {
        "roi_potential": 9,
        "technical_complexity": 3,
        "market_maturity": 8,
        "regulatory_risk": 5,
        "quick_win_potential": 9
      },
      "justification": "This use case directly leverages the client's GenAI and Data capabilities to deliver measurable customer experience improvements in retail banking. Bud Financial has demonstrated production deployment of this pattern using the same tech stack. Given an intermediate data maturity, this represents a high quick-win potential with existing infrastructure.",
      "cached": false
    }
  ],
  "generated_at": "2026-03-15T10:32:00Z"
}
```

---

## 15. ENVIRONMENT VARIABLES

```env
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
DATABASE_URL=postgresql+asyncpg://ai_radar:ai_radar@postgres:5432/ai_radar_db
POSTGRES_USER=ai_radar
POSTGRES_PASSWORD=ai_radar
POSTGRES_DB=ai_radar_db
QDRANT_HOST=qdrant
QDRANT_PORT=6333
QDRANT_COLLECTION=use_cases
REDIS_URL=redis://redis:6379/0
CACHE_TTL_SECONDS=3600
SECRET_KEY=change-me-in-production
ENVIRONMENT=development
CORS_ORIGINS=http://localhost:5173
LOG_LEVEL=INFO
SCRAPING_RATE_LIMIT_RPS=1
```

---

## 16. ANTI-HALLUCINATION RULES

- **Scraping pipeline**: If GPT-4o extraction returns a value not in the source text, it must be rejected by Pydantic validation. The extraction prompt explicitly forbids estimation.
- **LLM justifications**: Must only reference fields actually present in the use case object. Never invent company names, metrics, or outcomes not in the data.
- **PyPI/npm packages only.** Never invent a library name.
- **LlamaIndex 0.10+ API only.** Use `VectorStoreIndex`, `llama-index-vector-stores-qdrant`.
- **Official SDKs only** for OpenAI and Anthropic. No raw HTTP calls.

---

## 17. DEFINITION OF DONE

- [ ] `scrape_pipeline.py` runs successfully and produces ≥ 60 records with no null `source_url`
- [ ] `SCRAPING_REPORT.md` documents extraction statistics per source
- [ ] `docker-compose up` starts all 5 services cleanly
- [ ] `GET /health` → `{"status": "ok"}`
- [ ] `POST /score` returns Top 10 with real company examples and source URLs
- [ ] Every use case detail card shows a clickable source URL
- [ ] Radar chart renders with DXC color palette
- [ ] PDF export shows source citations for each use case
- [ ] POST /score completes in under 30 seconds
- [ ] Redis prevents duplicate LLM calls for same session
- [ ] All pytest tests pass including `test_scraping.py`
- [ ] No TypeScript strict-mode errors
- [ ] `docs/scraping_strategy.md` documents the data integrity guarantees

---

*Master Prompt v4.0 | ai-radar-dxc | Radar Tool V1 POC*
*Project: DXC Technology — AI Use Cases par Industrie*
*Target: End of March 2026 | Agent: Claude Opus 4.6 / Antigravity*