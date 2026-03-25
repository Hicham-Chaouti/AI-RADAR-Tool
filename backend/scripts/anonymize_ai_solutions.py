#!/usr/bin/env python3
"""
Anonymize commercial platform references in AI solutions and other fields.
Removes vendor-specific mentions (Google Cloud, AWS, Azure, partners, etc.)
and replaces with generic, use-case focused descriptions.
"""

import json
import re
from pathlib import Path
from typing import Any

# Mapping of archetype/title patterns to anonymous AI solution descriptions
SOLUTION_MAPPING = {
    "customer_chatbot": "AI-powered customer engagement platform",
    "employee_productivity_genai": "AI-assisted operational optimization",
    "personalized_recommendations": "Personalized experience engine",
    "document_processing": "Intelligent document analysis system",
    "content_generation": "Automated content creation platform",
    "search_discovery": "Semantic search and discovery system",
    "data_aggregation": "Unified data integration platform",
    "analytics_insights": "Real-time analytics and insights engine",
    "fraud_detection": "Intelligent fraud detection system",
    "predictive_analytics": "Predictive modeling and forecasting",
    "process_automation": "Intelligent process automation",
    "knowledge_management": "Intelligent knowledge management system",
}

# Vendor name patterns to remove
VENDOR_PATTERNS = [
    r"\busing Google Cloud technologies\b",
    r"\busing Google Cloud\b",
    r"\busing AWS\b",
    r"\busing Azure\b",
    r"\bGoogle Cloud's Advanced Solutions Lab\b",
    r"\bGoogle Cloud\b",
    r"\bAWS\b",
    r"\bMicrosoft Azure\b",
    r"\bOpenAI\b",
    r"\bVertexAI\b",
    r"\bClaude\b",
]

def anonymize_ai_solution(use_case: dict) -> str:
    """Generate anonymous AI solution description based on archetype and title."""
    archetype = use_case.get("archetype", "").lower()
    title = use_case.get("title", "").lower()
    
    # Try exact archetype match first
    if archetype in SOLUTION_MAPPING:
        return SOLUTION_MAPPING[archetype]
    
    # Fallback based on title keywords
    if "customer" in title or "chat" in title:
        return "AI-powered customer engagement platform"
    elif "inventory" in title or "tracking" in title:
        return "Intelligent inventory management system"
    elif "recommend" in title or "personali" in title:
        return "Personalized experience engine"
    elif "search" in title or "discover" in title:
        return "Semantic search and discovery system"
    elif "content" in title or "generat" in title or "descri" in title:
        return "Automated content creation platform"
    elif "analyt" in title or "insight" in title or "feedback" in title:
        return "Real-time analytics and insights engine"
    elif "data" in title or "integrat" in title:
        return "Unified data integration platform"
    elif "process" in title or "automat" in title:
        return "Intelligent process automation"
    elif "fraud" in title or "risk" in title or "detect" in title:
        return "Intelligent fraud detection system"
    elif "predict" in title or "forecast" in title:
        return "Predictive modeling and forecasting"
    elif "knowledge" in title or "document" in title:
        return "Intelligent knowledge management system"
    else:
        return "AI-powered solution"

def clean_ai_solution(original: str) -> str:
    """Remove vendor-specific terms from AI solution description."""
    result = original
    
    # Remove vendor patterns
    for pattern in VENDOR_PATTERNS:
        result = re.sub(pattern, "", result, flags=re.IGNORECASE)
    
    # Clean up extra whitespace
    result = re.sub(r'\s+', ' ', result).strip()
    
    return result

def process_use_cases(data: list) -> list:
    """Process all use cases to anonymize commercial references."""
    cleaned_count = 0
    
    for use_case in data:
        original_solution = use_case.get("ai_solution", "")
        
        # Generate or clean the AI solution
        if original_solution:
            cleaned = clean_ai_solution(original_solution)
            # If still contains vendor names or is empty after cleaning, generate from archetype
            if not cleaned or "google" in cleaned.lower() or "aws" in cleaned.lower() or "azure" in cleaned.lower():
                use_case["ai_solution"] = anonymize_ai_solution(use_case)
                cleaned_count += 1
            elif cleaned != original_solution:
                use_case["ai_solution"] = cleaned
                cleaned_count += 1
        else:
            # Generate from archetype if empty
            use_case["ai_solution"] = anonymize_ai_solution(use_case)
            cleaned_count += 1
        
        # Neutralize source_name if it's vendor-specific
        source_name = use_case.get("source_name", "")
        if source_name and any(vendor in source_name for vendor in ["Google", "AWS", "Azure", "openai"]):
            use_case["source_name"] = "AI Industry Resources"
            cleaned_count += 1
    
    return data, cleaned_count

def main():
    # Paths
    workspace_root = Path("c:\\Users\\naima\\Desktop\\Radar tool")
    json_file = workspace_root / "backend/data/seed_use_cases_enriched.json"
    backup_file = workspace_root / "backend/data/seed_use_cases_enriched_solution_backup.json"
    
    # Load data
    print(f"Loading use cases from {json_file}...")
    with open(json_file, 'r', encoding='utf-8') as f:
        use_cases = json.load(f)
    
    print(f"Found {len(use_cases)} use cases")
    
    # Create backup
    print(f"Creating backup at {backup_file}...")
    with open(backup_file, 'w', encoding='utf-8') as f:
        json.dump(use_cases, f, indent=2, ensure_ascii=False)
    
    # Process use cases
    print("\nAnonymizing AI solutions and source references...")
    use_cases, cleaned_count = process_use_cases(use_cases)
    
    # Save cleaned data
    print(f"Saving cleaned data to {json_file}...")
    with open(json_file, 'w', encoding='utf-8') as f:
        json.dump(use_cases, f, indent=2, ensure_ascii=False)
    
    print(f"\n✓ Anonymization complete!")
    print(f"  - Total use cases processed: {len(use_cases)}")
    print(f"  - AI solutions anonymized: {cleaned_count}")
    
    # Show sample transformations
    print("\nSample transformations:")
    sample_count = 0
    for use_case in use_cases[:10]:
        if sample_count < 5:
            print(f"\n  Title: {use_case.get('title')}")
            print(f"    → AI Solution: {use_case.get('ai_solution')}")
            print(f"    → Source: {use_case.get('source_name')}")
            sample_count += 1

if __name__ == "__main__":
    main()
