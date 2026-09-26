import json
import re

with open('scratch/pending_products_to_add.json', 'r', encoding='utf-8') as f:
    items = json.load(f)

for p in items[:25]:
    print(f"Title: {p['title']}")
    print(f"  Extracted Model: {p['model']}")
