import json

# Load original
with open('seed_use_cases_enriched.json', encoding='utf-8') as f:
    use_cases = json.load(f)

# List of commercial/brand names to look for
commercial_keywords = [
    'Google', 'Amazon', 'Microsoft', 'Apple', 'Facebook', 'Meta', 'Netflix', 'Spotify',
    'Tesla', 'Toyota', 'BMW', 'Audi', 'Volkswagen', 'Mercedes', 'Ford', 'General Motors',
    'Shell', 'BP', 'ExxonMobil', 'Chevron', 'Total', 'Equinor',
    'Walmart', 'Target', 'Costco', 'Ikea', 'H&M', 'Zara', 'Best Buy', 'Gap',
    'Carrefour', 'Tesco', 'Sainsbury', 'Asda',
    'Deutsche Bank', 'Intesa', 'JP Morgan', 'Goldman', 'Morgan Stanley', 'HSBC',
    'Deutsche Telekom', 'Vodafone', 'Orange', 'Swisscom', 'Telefonica', 'BT Group',
    'Allianz', 'AXA', 'Zurich', 'Munich Re',
    'Siemens', 'Philips', 'ABB', 'Schneider', 'Bosch', '3M',
    'Marriott', 'Hilton', 'Accor', 'Booking', 'Expedia', 'Airbnb', 'Uber', 'Lyft',
    'Nestlé', 'Kraft', 'PepsiCo', 'Coca-Cola', 'Starbucks', 'McDonald', 'KFC',
    'Disney', 'Paramount', 'Sony',
    'Slack', 'Zoom', 'Stripe', 'Shopify', 'Dropbox', 'Asana', 'Monday', 'HubSpot',
    'Intercom', 'Twilio', 'SendGrid', 'Mailchimp', 'Datadog', 'New Relic', 'PagerDuty',
    'Okta', 'Auth0', 'Salesforce', 'SAP', 'Tableau', 'Zendesk'
]

# Find use cases with commercial names in titles
matches = []
for i, uc in enumerate(use_cases):
    title = uc.get('title', '').lower()
    for keyword in commercial_keywords:
        if keyword.lower() in title:
            matches.append({
                'index': i,
                'title': uc['title'],
                'keyword': keyword
            })
            break  # Only count once per use case

print(f"Found {len(matches)} use cases with commercial brand names in titles:\n")
print("="*100)

for match in matches:
    print(f"\n#{match['index']+1}: {match['title']}")
    print(f"   Keyword: {match['keyword']}")

print("\n" + "="*100)
print(f"\nTOTAL: {len(matches)} use cases need commercial name anonymization")
