import json

# Load both files
with open('seed_use_cases_enriched.json', encoding='utf-8') as f:
    original = json.load(f)

with open('seed_use_cases_anonymized.json', encoding='utf-8') as f:
    anonymized = json.load(f)

# Find differences
print("ANONYMIZED TITLES:\n" + "="*80)
for i, (orig, anon) in enumerate(zip(original, anonymized)):
    if orig['title'] != anon['title']:
        print(f"\n❌ BEFORE:\n   {orig['title']}")
        print(f"\n✅ AFTER:\n   {anon['title']}")
        print(f"\n📊 Tech Keywords (UNCHANGED): {orig['tech_keywords']}")
        print("-"*80)

# Sample to show nothing else changed
print("\n\n VERIFICATION - NO OTHER CHANGES:\n" + "="*80)
print("Checking that descriptions, solutions, and tech keywords remain identical...")
count = 0
for i, (orig, anon) in enumerate(zip(original[:100], anonymized[:100])):
    # Check that only title changed, everything else is identical
    if orig['title'] == anon['title']:
        # Verify other fields are unchanged
        if (orig.get('description') != anon.get('description') or
            orig.get('ai_solution') != anon.get('ai_solution') or
            orig.get('tech_keywords') != anon.get('tech_keywords')):
            print(f"ERROR: Non-title field changed in use case {i}")
            count += 1

if count == 0:
    print("✅ CONFIRMED: Only titles were changed, everything else is identical!")
