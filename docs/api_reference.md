# API Reference — AI Radar DXC

> REST API endpoints for the Radar Tool V1 POC.

## Base URL

`http://localhost:8000/api/v1`

## Endpoints

<!-- TODO (Phase 8): Fill with complete request/response examples -->

### Health Check
`GET /health` → `{"status": "ok"}`

### Sessions
`POST /api/v1/session` — Create a new scoring session

### Scoring
`POST /api/v1/score` — Score and rank Top 10 use cases

### Search
`GET /api/v1/search?q=&sector=&function=` — Semantic search

### Use Cases
`GET /api/v1/usecases/{id}` — Get full use case detail

### Export
`GET /api/v1/export/pdf/{session_id}` — Download PDF report
