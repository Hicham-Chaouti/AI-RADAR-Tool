"""Anonymize only company/commercial names in use cases, keep tools intact."""

import json
import re
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
INPUT_FILE = DATA_DIR / "seed_use_cases_enriched.json"
OUTPUT_FILE = DATA_DIR / "seed_use_cases_anonymized.json"

# Only company/brand names to remove (not tools)
COMPANY_REPLACEMENTS = {
    # Cloud platforms (multi-word first to avoid double replacement)
    r'\bGoogle Cloud\b': 'a cloud platform',
    r'\bMicrosoft Azure\b': 'a cloud platform',
    r'\bAmazon Web Services\b': 'a cloud provider',
    
    # Corporations
    r'\bGoogle\b': 'a cloud provider',
    r'\bAmazon\b': 'an online retailer',
    r'\bAWS\b': 'a cloud platform',
    r'\bMicrosoft\b': 'a technology provider',
    r'\bAzure\b': 'a cloud platform',
    r'\bIBM\b': 'an enterprise software company',
    r'\bOracle\b': 'a database company',
    r'\bSalesforce\b': 'a CRM platform',
    r'\bAdobe\b': 'a software company',
    r'\bMeta\b': 'a technology company',
    r'\bFacebook\b': 'a social media company',
    r'\bApple\b': 'a technology company',
    r'\bTesla\b': 'an automotive company',
    r'\bNetflix\b': 'a streaming company',
    r'\bUber\b': 'a rideshare company',
    r'\bAirbnb\b': 'a hospitality platform',
    r'\bSpotify\b': 'a music streaming company',
    r'\bSquare\b': 'a fintech company',
    r'\bPayPal\b': 'a payment platform',
    r'\bJetBlue\b': 'an airline',
    r'\bWalmart\b': 'a retail company',
    r'\beBay\b': 'an e-commerce platform',
    r'\bLinkedin\b': 'a social network',
    r'\bInstagram\b': 'a social media platform',
    r'\bTikTok\b': 'a social platform',
    r'\bSlack\b': 'a collaboration tool',
    r'\bZoom\b': 'a video conferencing platform',
    r'\bStripe\b': 'a payment processor',
    r'\bShopify\b': 'an e-commerce platform',
    r'\bDropbox\b': 'a cloud storage service',
    r'\bAsana\b': 'a project management tool',
    r'\bMonday\.com\b': 'a work management platform',
    r'\bHubSpot\b': 'a CRM platform',
    r'\bIntercom\b': 'a customer communication platform',
    r'\bTwilio\b': 'a communication platform',
    r'\bSendGrid\b': 'an email service',
    r'\bMailchimp\b': 'an email marketing platform',
    r'\bDatadog\b': 'a monitoring platform',
    r'\bNew Relic\b': 'an observability platform',
    r'\bPagerDuty\b': 'an incident response platform',
    r'\bOkta\b': 'an identity platform',
    r'\bAuth0\b': 'an authentication platform',
}

def anonymize_text(text):
    """Replace only company names, preserve all tools and technologies."""
    if not text:
        return text
    
    result = text
    for pattern, replacement in COMPANY_REPLACEMENTS.items():
        result = re.sub(pattern, replacement, result, flags=re.IGNORECASE)
    
    return result

def main():
    print(f"Loading {INPUT_FILE.name}...")
    with open(INPUT_FILE, 'r', encoding='utf-8') as f:
        use_cases = json.load(f)
    
    print(f"Anonymizing {len(use_cases)} use cases (company names only)...")
    
    anonymized = []
    for uc in use_cases:
        # Create a copy and anonymize text fields
        anon_uc = uc.copy()
        
        # Anonymize text fields
        if 'title' in anon_uc:
            anon_uc['title'] = anonymize_text(anon_uc['title'])
        if 'description' in anon_uc:
            anon_uc['description'] = anonymize_text(anon_uc['description'])
        if 'business_challenge' in anon_uc:
            anon_uc['business_challenge'] = anonymize_text(anon_uc['business_challenge'])
        if 'ai_solution' in anon_uc:
            anon_uc['ai_solution'] = anonymize_text(anon_uc['ai_solution'])
        if 'business_impact' in anon_uc:
            anon_uc['business_impact'] = anonymize_text(anon_uc['business_impact'])
        if 'source_name' in anon_uc:
            # Anonymize source if it's a company name
            anon_uc['source_name'] = anonymize_text(anon_uc['source_name'])
        
        # Keep tech_keywords as is (they are tools, not companies)
        
        anonymized.append(anon_uc)
    
    print(f"Writing anonymized data to {OUTPUT_FILE.name}...")
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(anonymized, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Anonymization complete! {len(anonymized)} use cases processed.")
    print(f"   Original: {INPUT_FILE}")
    print(f"   Output:   {OUTPUT_FILE}")

if __name__ == '__main__':
    main()
