import json

with open('scratch/final_pending_products.json', 'r', encoding='utf-8') as f:
    items = json.load(f)

print(f"{'Brand':<15} | {'Type':<15} | {'Series':<18} | {'Model':<30} | {'Image Link'}")
print("=" * 110)
for it in items[:40]:
    img = it['image_link'][:45] + '...' if len(it['image_link']) > 45 else it['image_link']
    print(f"{it['brand']:<15} | {it['type']:<15} | {it['series']:<18} | {it['model']:<30} | {img}")
