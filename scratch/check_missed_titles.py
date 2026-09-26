import json

with open('scratch/missed_categories_products.json', 'r', encoding='utf-8') as f:
    items = json.load(f)

for item in items[:20]:
    print(f"[{item['id']}] {item['title']} (Cat: {item['category']})")
