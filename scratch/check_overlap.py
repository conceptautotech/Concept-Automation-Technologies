import json
import openpyxl
import re

# Load all products from catalog.ts
with open('src/data/catalog.ts', 'r', encoding='utf-8', errors='ignore') as f:
    ts_text = f.read()

# Let's parse catalog.ts using regex
ts_items = []
pattern = re.compile(r'{\s*"id":\s*"([^"]+)",[\s\S]*?"name":\s*"([^"]+)",[\s\S]*?"title":\s*"([^"]+)",[\s\S]*?"partNumber":\s*"([^"]+)",[\s\S]*?"brand":\s*"([^"]+)",[\s\S]*?"category":\s*"([^"]+)",[\s\S]*?"price":\s*"([^"]+)",[\s\S]*?"image":\s*"([^"]+)"', re.MULTILINE)
for m in pattern.finditer(ts_text):
    raw_id = m.group(1).replace('im-', '')
    ts_items.append({
        'id': raw_id,
        'name': m.group(2),
        'title': m.group(3),
        'partNumber': m.group(4),
        'brand': m.group(5),
        'category': m.group(6),
        'price': m.group(7),
        'image': m.group(8)
    })

print(f"Parsed {len(ts_items)} items from catalog.ts")

# Load all from all_extracted_category_products.json
crawler_items = []
with open('scratch/all_extracted_category_products.json', 'r', encoding='utf-8') as f:
    cr = json.load(f)
    for c in cr:
        raw_id = str(c.get('id')).replace('im-', '')
        crawler_items.append({
            'id': raw_id,
            'title': c.get('title'),
            'image': c.get('image'),
            'price': c.get('price'),
            'category': c.get('category'),
            'detail_url': c.get('detail_url')
        })
print(f"Loaded {len(crawler_items)} items from crawler")

# Compare IDs
ts_ids = set(x['id'] for x in ts_items)
cr_ids = set(x['id'] for x in crawler_items)
print(f"Unique in catalog.ts: {len(ts_ids)}")
print(f"Unique in crawler: {len(cr_ids)}")
print(f"Overlap: {len(ts_ids.intersection(cr_ids))}")
print(f"Total combined unique IDs: {len(ts_ids.union(cr_ids))}")

# Check which ones are in crawler but not in catalog.ts
crawler_new = [x for x in crawler_items if x['id'] not in ts_ids]
print(f"Crawler found {len(crawler_new)} products NOT in catalog.ts!")
for x in crawler_new[:10]:
    print(f"  [{x['id']}] {x['title']} ({x['category']})")
