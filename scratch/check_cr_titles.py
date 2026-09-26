import json

with open('scratch/all_extracted_category_products.json', 'r', encoding='utf-8') as f:
    cr = json.load(f)

for item in cr[:10]:
    print(f"[{item['id']}] {item['title']}")
