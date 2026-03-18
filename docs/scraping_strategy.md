# Scraping Strategy — AI Radar DXC

> Documents the data integrity guarantees and scraping pipeline design.

## Data Integrity Rules

1. **No invention** — Never generate, estimate, or infer any value stored in the KB
2. **Source traceability** — Every record must have a non-null `source_url` pointing to its original public source
3. **LLM as extractor only** — GPT-4o reads source text and extracts only what is explicitly stated
4. **Null over guess** — If a field cannot be extracted, it is set to `null`, never filled by inference
5. **Pydantic validation** — All records pass strict schema validation before entering the KB

## Target Sources

| Source | URL | Priority |
|---|---|---|
| Google Cloud 1001 Use Cases | cloud.google.com/transform/... | ⭐⭐⭐⭐⭐ |
| Google Cloud AI Blueprints | cloud.google.com/blog/... | ⭐⭐⭐⭐⭐ |
| IBM watsonx Use Cases | ibm.com/products/watsonx/use-cases | ⭐⭐⭐⭐ |
| Salesforce AI Use Cases | salesforce.com/artificial-intelligence/use-cases/ | ⭐⭐⭐ |
| McKinsey AI Insights | mckinsey.com/capabilities/quantumblack/... | ⭐⭐⭐ |

## Pipeline Steps

1. **Fetch** — httpx async GET, rate-limited to 1 req/s per domain
2. **Parse** — BeautifulSoup4 + markdownify → clean Markdown
3. **Extract** — GPT-4o structured extraction with strict anti-hallucination prompt
4. **Validate** — Pydantic schema, reject records missing title/description/source_url
5. **Normalize** — Sector mapping to controlled vocabulary
6. **Deduplicate** — Hash on `title.lower() + sector_normalized`
7. **Output** — `seed_use_cases.json` + `SCRAPING_REPORT.md`

## Minimum Threshold

Pipeline aborts if total records < 60.
