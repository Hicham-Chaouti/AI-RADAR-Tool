"""Anonymize all use cases by removing company names, brand names, and proprietary tools."""

import json
import re
from pathlib import Path

# ─── File paths ─────────────────────────────────────────────
DATA_DIR = Path(__file__).resolve().parent.parent / "data"
INPUT_FILE = DATA_DIR / "seed_use_cases_enriched.json"
OUTPUT_FILE = DATA_DIR / "seed_use_cases_anonymized.json"

# ─── Mapping of brand/company/tool names to generic terms ───
REPLACEMENTS = {
    # Cloud providers
    r"Google Cloud": "cloud platform",
    r"AWS": "cloud platform",
    r"Microsoft Azure": "cloud platform",
    r"Azure": "cloud platform",
    
    # Google-specific services
    r"Google Kubernetes Engine": "container orchestration platform",
    r"BigQuery": "data warehouse",
    r"Vertex AI": "ML platform",
    r"Cloud CDN": "content delivery network",
    r"Apigee": "API gateway",
    r"Cloud Spanner": "distributed database",
    r"Cloud Storage": "object storage",
    r"Pub/Sub": "message queue",
    r"Cloud Run": "serverless platform",
    r"Cloud Functions": "serverless functions",
    r"Dataflow": "stream processing",
    r"Looker": "business intelligence tool",
    r"Google Workspace": "office productivity suite",
    r"Google Assistant": "voice assistant",
    r"Cloud Firestore": "NoSQL database",
    r"Cloud SQL": "relational database service",
    
    # AWS specific
    r"EC2": "compute instance",
    r"S3": "object storage",
    r"DynamoDB": "NoSQL database",
    r"Lambda": "serverless functions",
    r"Sagemaker": "ML platform",
    r"RDS": "relational database",
    r"ElastiCache": "cache layer",
    r"CloudFront": "content delivery network",
    r"SNS": "notification service",
    r"SQS": "message queue",
    
    # Azure specific
    r"Azure Cosmos DB": "distributed database",
    r"Azure SQL": "relational database",
    r"Synapse": "data warehouse",
    r"Power BI": "business intelligence tool",
    r"Azure OpenAI Service": "language model API",
    
    # AI/LLM models
    r"OpenAI": "LLM provider",
    r"GPT-4": "large language model",
    r"GPT-3": "large language model",
    r"BERT": "language model",
    r"Claude": "large language model",
    r"Gemini": "multimodal model",
    
    # Databases
    r"PostgreSQL": "relational database",
    r"MongoDB": "NoSQL database",
    r"Redis": "cache system",
    r"Elasticsearch": "search engine",
    
    # Other tools
    r"Salesforce": "CRM platform",
    r"SAP": "enterprise resource planning",
    r"Tableau": "visualization platform",
    r"Slack": "communication platform",
    r"Shopify": "e-commerce platform",
    r"Stripe": "payment processor",
    r"Twilio": "communication API",
    r"Zapier": "automation platform",
}

# Compile regex patterns
PATTERNS = {re.compile(pattern, re.IGNORECASE): replacement 
            for pattern, replacement in REPLACEMENTS.items()}


def anonymize_text(text: str) -> str:
    """Remove brand names, company names, and proprietary tools from text."""
    if not text:
        return text
    
    result = text
    for pattern, replacement in PATTERNS.items():
        result = pattern.sub(replacement, result)
    
    return result


def anonymize_use_case(use_case: dict) -> dict:
    """Anonymize a single use case."""
    anonymized = use_case.copy()
    
    # Anonymize text fields
    if "title" in anonymized:
        anonymized["title"] = anonymize_text(anonymized["title"])
    
    if "description" in anonymized:
        anonymized["description"] = anonymize_text(anonymized["description"])
    
    if "business_challenge" in anonymized:
        anonymized["business_challenge"] = anonymize_text(anonymized["business_challenge"])
    
    if "ai_solution" in anonymized:
        anonymized["ai_solution"] = anonymize_text(anonymized["ai_solution"])
    
    if "measurable_benefit" in anonymized:
        anonymized["measurable_benefit"] = anonymize_text(anonymized["measurable_benefit"])
    
    # Remove company example
    anonymized["company_example"] = None
    
    # Anonymize tech keywords
    if "tech_keywords" in anonymized and anonymized["tech_keywords"]:
        anonymized["tech_keywords"] = [
            anonymize_text(kw) for kw in anonymized["tech_keywords"]
        ]
    
    # Remove source information (identifies where data came from)
    anonymized["source_url"] = None
    anonymized["source_name"] = None
    
    return anonymized


def main():
    print(f"Reading use cases from {INPUT_FILE.name}...")
    
    # Load original use cases
    with open(INPUT_FILE, "r", encoding="utf-8") as f:
        use_cases = json.load(f)
    
    print(f"Loaded {len(use_cases)} use cases")
    
    # Anonymize each use case
    print("Anonymizing use cases...")
    anonymized_use_cases = [anonymize_use_case(uc) for uc in use_cases]
    
    # Save anonymized version
    print(f"Saving to {OUTPUT_FILE.name}...")
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(anonymized_use_cases, f, indent=2, ensure_ascii=False)
    
    print(f"✓ Successfully anonymized {len(anonymized_use_cases)} use cases")
    print(f"✓ Saved to {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
