#!/usr/bin/env python3
"""
Enhanced anonymization script to remove company names from descriptions and other text fields.
Removes branded references and replaces with generic use case focused descriptions.
"""

import json
import re
from pathlib import Path
from typing import Any

# Company names and patterns to remove
COMPANY_PATTERNS = [
    (r'\bWells Fargo\b', ''),
    (r'\bChiba Bank\b', ''),
    (r'\bBanco Macro\b', ''),
    (r'\bJPMorgan\b', ''),
    (r'\bJP Morgan\b', ''),
    (r'\bGoldman Sachs\b', ''),
    (r'\bDB Schenker\b', ''),
    (r'\bSalesforce\b', ''),
    (r'\bOracle\b', ''),
    (r'\bSAP\b', ''),
    (r'\bIBM\b', ''),
    (r'\bMicrosoft\b', ''),
    (r'\bGoogle\b', ''),
    (r'\bAmazon\b', ''),
    (r'\bMeta\b', ''),
    (r'\bApple\b', ''),
    (r'\bTesla\b', ''),
    (r'\bApigee\b', 'API management'),
    (r'\bAgentspace\b', 'intelligent automation platform'),
    (r'\bVertexAI\b', 'AI platform'),
    (r'\bBigQuery\b', 'data warehouse'),
    (r'\bCloudSQL\b', 'database'),
    (r'\bCloud Spanner\b', 'distributed database'),
    (r'\bCloud Storage\b', 'cloud storage'),
    (r'\bLooker\b', 'analytics'),
    (r'\bDataflow\b', 'data processing'),
    (r'\bCloud CDN\b', 'content delivery'),
]

def anonymize_description(text: str) -> str:
    """Remove company names and products from description text."""
    if not text:
        return text
    
    result = text
    
    # Remove company patterns
    for pattern, replacement in COMPANY_PATTERNS:
        result = re.sub(pattern, replacement, result, flags=re.IGNORECASE)
    
    # Clean up extra whitespace and punctuation
    result = re.sub(r'\s+', ' ', result).strip()
    result = re.sub(r'\s+([,.])', r'\1', result)
    result = re.sub(r'(\w+)\s*also uses.*?to\s+', r'\1 uses ', result, flags=re.IGNORECASE)
    result = re.sub(r'The company ', 'This approach ', result)
    result = re.sub(r'the company ', 'this approach ', result)
    
    return result

def extract_use_case_intent(description: str, title: str) -> str:
    """Extract the core use case intent from description, removing company-specific details."""
    
    # Remove numbered lists and bullets at start
    desc = re.sub(r'^[\d\.\-\*\s]+', '', description)
    
    # Extract key phrases from description
    patterns = [
        r'deployed.*?(?:tool|solution|system|platform).*?(?:\.|$)',
        r'(?:uses|utilizes|leverages).*?(?:to|for|by).*?(?:\.|$)',
        r'(?:reduces|improves|increases|accelerates).*?(?:\.|$)',
        r'.*?(?:reducing|improving|increasing).*?(?:\.|$)',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, desc, re.IGNORECASE)
        if match:
            text = match.group(0)
            # Clean up
            text = anonymize_description(text)
            if len(text) > 20:
                return text
    
    # Fallback: use first 2 sentences
    sentences = re.split(r'[.!?]+', desc)
    for sent in sentences[:2]:
        sent = sent.strip()
        if len(sent) > 20:
            cleaned = anonymize_description(sent)
            if cleaned and len(cleaned) > 20:
                return cleaned
    
    return anonymize_description(desc)

def process_use_cases(data: list) -> tuple[list, int]:
    """Process all use cases to remove company names from descriptions."""
    cleaned_count = 0
    
    # Extract company names to check
    company_names = [
        "Wells Fargo", "Chiba Bank", "Banco Macro", "JPMorgan", "JP Morgan",
        "Goldman Sachs", "DB Schenker", "Salesforce", "Oracle", "SAP", "IBM",
        "Microsoft", "Google", "Amazon", "Meta", "Apple", "Tesla", "Apigee",
        "Agentspace", "VertexAI", "BigQuery", "CloudSQL", "Cloud Spanner",
        "Cloud Storage", "Looker", "Dataflow", "Cloud CDN"
    ]
    
    for use_case in data:
        original_desc = use_case.get("description", "")
        original_challenge = use_case.get("business_challenge", "")
        
        # Clean description
        if original_desc:
            has_company = any(company.lower() in original_desc.lower() for company in company_names)
            if has_company:
                cleaned_desc = anonymize_description(original_desc)
                if cleaned_desc != original_desc:
                    use_case["description"] = cleaned_desc
                    cleaned_count += 1
        
        # Clean business_challenge
        if original_challenge:
            has_company = any(company.lower() in original_challenge.lower() for company in company_names)
            if has_company:
                cleaned_challenge = anonymize_description(original_challenge)
                if cleaned_challenge != original_challenge:
                    use_case["business_challenge"] = cleaned_challenge
                    cleaned_count += 1
    
    return data, cleaned_count

def main():
    # Paths
    workspace_root = Path("c:\\Users\\naima\\Desktop\\Radar tool")
    json_file = workspace_root / "backend/data/seed_use_cases_enriched.json"
    backup_file = workspace_root / "backend/data/seed_use_cases_enriched_descriptions_backup.json"
    
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
    print("\nRemoving company names from descriptions...")
    use_cases, cleaned_count = process_use_cases(use_cases)
    
    # Save cleaned data
    print(f"Saving cleaned data to {json_file}...")
    with open(json_file, 'w', encoding='utf-8') as f:
        json.dump(use_cases, f, indent=2, ensure_ascii=False)
    
    print(f"\n✓ Description anonymization complete!")
    print(f"  - Total use cases processed: {len(use_cases)}")
    print(f"  - Descriptions cleaned: {cleaned_count}")
    
    # Show sample transformations
    print("\nSample transformations:")
    sample_count = 0
    for use_case in use_cases:
        if "Wells Fargo" in use_case.get("description", "") or "Apigee" in use_case.get("description", ""):
            print(f"\n  Before (Original Title): {use_case.get('original_title', use_case.get('title'))}")
            print(f"  Description: {use_case.get('description')}")
            sample_count += 1
            if sample_count >= 3:
                break

if __name__ == "__main__":
    main()
