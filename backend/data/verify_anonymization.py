import json

# Load and compare
with open('seed_use_cases_enriched.json', encoding='utf-8') as f:
    original = json.load(f)[:3]

with open('seed_use_cases_anonymized.json', encoding='utf-8') as f:
    anonymized = json.load(f)[:3]

for i, (orig, anon) in enumerate(zip(original, anonymized)):
    print(f'\n{"="*80}')
    print(f'USE CASE {i+1}')
    print(f'{"="*80}')
    
    print(f'\n📌 BEFORE (Original):')
    print(f'   Title: {orig["title"]}')
    print(f'   Desc: {orig["description"][:80]}...')
    print(f'   Tools: {orig["tech_keywords"][:3]}')
    
    print(f'\n✅ AFTER (Anonymized):')
    print(f'   Title: {anon["title"]}')
    print(f'   Desc: {anon["description"][:80]}...')
    print(f'   Tools: {anon["tech_keywords"][:3]}')
