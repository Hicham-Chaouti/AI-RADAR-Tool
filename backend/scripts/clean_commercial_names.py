"""
Script to clean up commercial names from use case titles.
Replaces titles with commercial names with functional descriptors based on archetype.
Also removes company_example field.
"""

import json
from pathlib import Path

# ─── Paths ──────────────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
ENRICHED_FILE = DATA_DIR / "seed_use_cases_enriched.json"
BACKUP_FILE = DATA_DIR / "seed_use_cases_enriched_backup.json"

# ─── Known commercial names to detect ────────────────────────
COMMERCIAL_NAMES = [
    "lloyds", "banco macro", "jpmorgan", "chase", "citibank", "wells fargo",
    "google", "microsoft", "aws", "amazon", "apple", "meta", "facebook",
    "ibm", "salesforce", "oracle", "sap", "vmware", "intel",
    "uber", "lyft", "spotify", "netflix", "tesla", "airbnb",
    "stripe", "paypal", "square", "shopify", "slack", "zoom",
]

# ─── Archetype to functional title mapping ───────────────────
ARCHETYPE_TITLES = {
    "employee_productivity_genai": "AI-Powered Employee Productivity Assistant",
    "code_generation": "AI-Powered Code Generation Platform",
    "marketing_creative_genai": "AI-Powered Marketing & Content Creation",
    "document_processing": "AI-Powered Document Processing & Extraction",
    "customer_chatbot": "AI-Powered Customer Service Automation",
    "contact_center_ai": "AI-Powered Contact Center Intelligence",
    "ai_search_discovery": "AI-Powered Search & Discovery Platform",
    "recommendation_engine": "AI-Powered Recommendation Engine",
    "fraud_detection": "AI-Powered Fraud Detection & Risk Management",
    "security_soc_automation": "AI-Powered Security Operations Automation",
    "data_analytics_nl_sql": "AI-Powered Natural Language Analytics",
    "predictive_maintenance": "AI-Powered Predictive Maintenance",
    "demand_forecasting": "AI-Powered Demand Forecasting",
    "supply_chain_optimization": "AI-Powered Supply Chain Optimization",
    "dynamic_pricing": "AI-Powered Dynamic Pricing Optimization",
    "clinical_documentation": "AI-Powered Clinical Documentation",
    "medical_ai_diagnostics": "AI-Powered Medical Diagnostics",
    "legal_ai": "AI-Powered Legal Document Intelligence",
    "hr_automation": "AI-Powered HR & Talent Management",
    "financial_research_automation": "AI-Powered Financial Research Automation",
    "public_service_ai": "AI-Powered Public Service Delivery",
    "education_ai": "AI-Powered Education & Learning Platform",
    "digital_twin_simulation": "AI-Powered Digital Twin Simulation",
    "environmental_disaster_ai": "AI-Powered Environmental Intelligence",
    "cross_industry_ai": "AI-Powered Business Process Automation",
}

def has_commercial_name(title: str) -> bool:
    """Check if title contains a known commercial name."""
    title_lower = title.lower()
    return any(name in title_lower for name in COMMERCIAL_NAMES)

def clean_use_cases():
    """Load, clean, and save use cases."""
    # Load enriched data
    with open(ENRICHED_FILE, "r", encoding="utf-8") as f:
        use_cases = json.load(f)
    
    # Create backup
    with open(BACKUP_FILE, "w", encoding="utf-8") as f:
        json.dump(use_cases, f, indent=2, ensure_ascii=False)
    print(f"✓ Backup created: {BACKUP_FILE}")
    
    # Clean data
    cleaned_count = 0
    for uc in use_cases:
        original_title = uc.get("title", "")
        
        # Check if title has commercial name
        if has_commercial_name(original_title):
            archetype = uc.get("archetype")
            new_title = ARCHETYPE_TITLES.get(archetype, original_title)
            
            print(f"  BEFORE: {original_title}")
            print(f"  AFTER:  {new_title}")
            print()
            
            uc["title"] = new_title
            uc["company_example"] = None
            cleaned_count += 1
        else:
            # Also remove company_example even if title is clean
            uc["company_example"] = None
    
    # Save cleaned data
    with open(ENRICHED_FILE, "w", encoding="utf-8") as f:
        json.dump(use_cases, f, indent=2, ensure_ascii=False)
    
    print(f"\n✓ Cleaned {cleaned_count} use cases with commercial names")
    print(f"✓ Removed all company_example fields")
    print(f"✓ Updated: {ENRICHED_FILE}")

if __name__ == "__main__":
    clean_use_cases()
