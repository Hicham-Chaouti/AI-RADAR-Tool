import json

# Load both
with open('seed_use_cases_enriched.json', encoding='utf-8') as f:
    original = json.load(f)

with open('seed_use_cases_anonymized.json', encoding='utf-8') as f:
    anonymized = json.load(f)

# Find use cases with company name differences
count = 0
for i, (orig, anon) in enumerate(zip(original[:50], anonymized[:50])):
    orig_text = f"{orig.get('description', '')} {orig.get('business_challenge', '')} {orig.get('ai_solution', '')}"
    anon_text = f"{anon.get('description', '')} {anon.get('business_challenge', '')} {anon.get('ai_solution', '')}"
    
    if orig_text != anon_text:
        count += 1
        print(f"\n{'='*80}")
        print(f"EXAMPLE {count}: {orig['title'][:70]}")
        print(f"{'='*80}")
        print(f"\n❌ ORIGINAL:\n{orig.get('ai_solution', '')[:200]}")
        print(f"\n✅ ANONYMIZED:\n{anon.get('ai_solution', '')[:200]}")
        
        if count >= 3:
            break

if count == 0:
    print("No company names found in descriptions/challenges/solutions.")
    print("Checking source_name field...")
    for i in range(10):
        orig_source = original[i].get('source_name', '')
        anon_source = anonymized[i].get('source_name', '')
        if orig_source != anon_source:
            print(f"\nUse Case: {original[i]['title'][:60]}")
            print(f"  Original Source: {orig_source}")
            print(f"  Anonymized Source: {anon_source}")
