"""Anonymize commercial/brand names across use case text fields."""

import json
import re
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
INPUT_FILE = DATA_DIR / "seed_use_cases_enriched.json"
OUTPUT_FILE = DATA_DIR / "seed_use_cases_anonymized.json"

# Mapping of commercial names to generic replacements.
# Longest/most specific names first.
REPLACEMENTS = [
    # Multi-word names first
    ('Google Cloud AI Blueprints', 'Industry AI Blueprints'),
    ('Google Cloud', 'Cloud Platform'),
    ('Google Workspace', 'Productivity Suite'),
    ('Google Maps Platform', 'Mapping Platform'),
    ('Microsoft Azure', 'Cloud Platform'),
    ('IBM watsonx', 'AI Platform'),
    ('IBM Watson', 'AI Platform'),
    ('Intesa Sanpaolo', 'Bank'),
    ('Best Buy', 'Retailer'),
    ('McKinsey', 'Consulting Firm'),
    ('United Daily News Group', 'Media Company'),
    ('Deutsche Bank', 'Bank'),
    ('JP Morgan', 'Bank'),
    ('Morgan Stanley', 'Bank'),
    ('Goldman Sachs', 'Bank'),
    ('Looker Studio', 'Dashboard Tool'),
    ('Looker Embedded', 'Embedded Analytics'),

    # Single-word names (longest first to avoid partial matches)
    ('NVIDIA', 'Hardware Vendor'),
    ('Oracle', 'Database Vendor'),
    ('Amazon', 'E-commerce Platform'),
    ('Microsoft', 'Tech Company'),
    ('Intesa', 'Bank'),
    ('Google', 'Tech Company'),
    ('Spotify', 'Streaming Service'),
    ('Netflix', 'Streaming Service'),
    ('Booking', 'Travel Platform'),
    ('Philips', 'Electronics Company'),
    ('Signify', 'Tech Company'),
    ('Salesforce', 'Enterprise Software'),
    ('SAP', 'Enterprise Software'),
    ('Siemens', 'Industrial Company'),
    ('Accenture', 'Consulting Firm'),
    ('Meta', 'Tech Company'),
    ('Shell', 'Energy Company'),
    ('Uber', 'Mobility Platform'),
    ('Target', 'Retailer'),
    ('WPP', 'Marketing Company'),
    ('Apple', 'Tech Company'),
    ('AXA', 'Insurance Company'),
    ('MIT', 'Research Institute'),
    ('OpenAI', 'AI Provider'),
    ('Claude', 'LLM Provider'),
    ('Walmart', 'Retailer'),
    ('PayPal', 'Payment Platform'),
    ('Porsche', 'Automotive Company'),
    ('BigQuery', 'Analytics Service'),
    ('Dataflow', 'Data Service'),
    ('WhatsApp', 'Messaging Platform'),
    ('Slack', 'Collaboration Tool'),
    ('Looker', 'Dashboard Tool'),
    ('Figma', 'Design Platform'),
    ('Adobe', 'Software Company'),
    ('Tableau', 'Visualization Platform'),
    ('Alteryx', 'Data Platform'),
    ('Qlik', 'Analytics Platform'),
    ('Atl' + 'assian', 'Collaboration Software'),
    ('LinkedIn', 'Professional Network'),
    ('Instagram', 'Social Platform'),
    ('YouTube', 'Video Platform'),
    ('TikTok', 'Social Platform'),
    ('Twitter', 'Social Platform'),
    ('Zoom', 'Video Conference Platform'),
    ('Stripe', 'Payment Processor'),
    ('Shopify', 'E-commerce Platform'),
    ('Dropbox', 'Cloud Storage'),
    ('Asana', 'Project Management'),
    ('HubSpot', 'Marketing Platform'),
    ('Twilio', 'Communication Platform'),
    ('SendGrid', 'Email Service'),
    ('Mailchimp', 'Email Marketing'),
    ('Datadog', 'Monitoring Platform'),
    ('PagerDuty', 'Incident Response'),
    ('Okta', 'Identity Platform'),
    ('Auth0', 'Authentication Service'),
    ('Gemini', 'AI Model'),
    ('Reuters', 'News Agency'),
    ('Bloomberg', 'Financial Platform'),
    ('eBay', 'E-commerce Platform'),
    ('Yahoo', 'Tech Company'),
    ('JetBlue', 'Airline'),
    ('Airbnb', 'Hospitality Platform'),
    ('Tesla', 'Automotive Company'),
    ('Vertex AI', 'ML Platform'),
    ('Cloud Run', 'Serverless Platform'),
    ('Cloud Functions', 'Serverless Functions'),
    ('Cloud Storage', 'Object Storage'),
    ('Cloud SQL', 'Database Service'),
    ('Cloud Spanner', 'Distributed Database'),
    ('Pub/Sub', 'Message Queue'),
    ('Speech-to-Text', 'Voice Recognition'),
    ('Natural Language API', 'NLP Service'),
    ('Cloud Translation API', 'Translation Service'),
    ('Tech Company Play Store', 'App Store'),
    ('NOZ', 'Media Company'),
]

TEXT_FIELDS = [
    'title',
    'description',
    'business_challenge',
    'ai_solution',
    'measurable_benefit',
    'benefits',
    'company_example',
    'source_name',
    'agent_type',
]

LIST_TEXT_FIELDS = [
    'data_prerequisites',
]


def anonymize_text(value, dynamic_terms=None):
    """Replace commercial names in free text with word-boundary matching."""
    if value is None:
        return value
    if not isinstance(value, str):
        return value
    if not value:
        return value

    result = value
    for company_name, replacement in REPLACEMENTS:
        # Handles exact words and possessive forms, e.g. Google's / Google's.
        base = r'\b' + re.escape(company_name) + r'(?:\'s|’s)?\b'
        result = re.sub(base, replacement, result, flags=re.IGNORECASE)

    if dynamic_terms:
        for term in dynamic_terms:
            if not term or len(term.strip()) < 3:
                continue
            base = r'\b' + re.escape(term.strip()) + r'(?:\'s|’s)?\b'
            result = re.sub(base, 'Organization', result, flags=re.IGNORECASE)

    return result

def main():
    print(f"Loading {INPUT_FILE.name}...")
    with open(INPUT_FILE, 'r', encoding='utf-8') as f:
        use_cases = json.load(f)
    
    print(f"Anonymizing {len(use_cases)} use cases (all visible text fields)...")
    
    anonymized = []
    changes = []
    
    for uc in use_cases:
        anon_uc = uc.copy()
        
        before = json.dumps(anon_uc, ensure_ascii=False)

        dynamic_terms = []
        company_example = uc.get('company_example')
        if isinstance(company_example, str) and company_example.strip():
            dynamic_terms.append(company_example.strip())

            # Also add common split terms for composite names.
            for chunk in re.split(r'[,&/()]', company_example):
                chunk = chunk.strip()
                if len(chunk) >= 4:
                    dynamic_terms.append(chunk)

        for field in TEXT_FIELDS:
            anon_uc[field] = anonymize_text(anon_uc.get(field), dynamic_terms=dynamic_terms)

        for field in LIST_TEXT_FIELDS:
            items = anon_uc.get(field)
            if isinstance(items, list):
                anon_uc[field] = [anonymize_text(item) if isinstance(item, str) else item for item in items]

        # Scrub source URL to avoid brand domains appearing in anonymized exports.
        anon_uc['source_url'] = None

        # Optional: anonymize tech keywords only when they contain explicit brands.
        tech = anon_uc.get('tech_keywords')
        if isinstance(tech, list):
            anon_uc['tech_keywords'] = [anonymize_text(t, dynamic_terms=dynamic_terms) if isinstance(t, str) else t for t in tech]

        # Remove original title field if present to prevent leaking real company names.
        if 'original_title' in anon_uc:
            anon_uc['original_title'] = None

        # Remove company example field after dynamic anonymization.
        anon_uc['company_example'] = None

        after = json.dumps(anon_uc, ensure_ascii=False)
        if before != after:
            changes.append({
                'title_before': uc.get('title', ''),
                'title_after': anon_uc.get('title', ''),
                'desc_before': (uc.get('description') or '')[:100],
                'desc_after': (anon_uc.get('description') or '')[:100],
            })

        anonymized.append(anon_uc)
    
    print(f"\nSaving to {OUTPUT_FILE.name}...")
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(anonymized, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Anonymization complete!")
    print(f"   Total use cases: {len(anonymized)}")
    print(f"   Use cases changed: {len(changes)}")
    
    if changes:
        print(f"\n📋 ANONYMIZED EXAMPLES:")
        print("="*100)
        for i, change in enumerate(changes, 1):
            if change['title_before'] != change['title_after']:
                print(f"\n{i}. TITLE CHANGED:")
                print(f"   ❌ {change['title_before']}")
                print(f"   ✅ {change['title_after']}")
            if change['desc_before'] != change['desc_after']:
                print(f"\n   DESCRIPTION CHANGED:")
                print(f"   ❌ {change['desc_before']}...")
                print(f"   ✅ {change['desc_after']}...")
            if i >= 25:
                break
    
    print(f"\n" + "="*100)
    print(f"Output file: {OUTPUT_FILE}")

if __name__ == '__main__':
    main()
