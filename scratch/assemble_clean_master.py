import json
import re

# We will collect: id -> {id, title, brand, type, series, model, image_link, category}
clean_master = {}

def clean_str(s):
    if not s: return ''
    s = re.sub(r'[\r\n\t]+', ' ', str(s)).strip()
    s = re.sub(r'<[^>]+>', ' ', s).strip()
    # strip currency and trailing garbage if present
    if '₹' in s:
        s = s.split('₹')[0].strip()
    s = re.sub(r'\s+', ' ', s)
    return s

def add_item(pid, raw_title, img='', cat=''):
    if not pid: return
    clean_id = str(pid).strip().replace('im-', '').replace('ca-', '')
    if not clean_id.isdigit(): return
    
    title = clean_str(raw_title)
    if len(title) < 3: return
    
    # Ignore garbled titles like "ProductsFX3..." if we already have a better one
    if 'ProductsFX' in title or 'Products' in title and len(title) > 40:
        # try to fix title
        title = re.sub(r'Products', ' ', title).strip()
        
    if clean_id not in clean_master:
        clean_master[clean_id] = {
            'id': clean_id,
            'title': title,
            'image': img or '',
            'category': cat or ''
        }
    else:
        cur = clean_master[clean_id]
        # Prefer titles from category pages if current title starts with "Products" or is weird
        if 'Products' in cur['title'] or len(cur['title']) < 5:
            cur['title'] = title
        if not cur['image'] and img:
            cur['image'] = img
        if not cur['category'] and cat:
            cur['category'] = cat

# 1. Load from all_extracted_category_products.json (very high quality titles)
try:
    with open('scratch/all_extracted_category_products.json', 'r', encoding='utf-8') as f:
        for it in json.load(f):
            add_item(it.get('id'), it.get('title'), it.get('image'), it.get('category'))
except Exception as e:
    print("Err 1:", e)

# 2. Load from missed_categories_products.json (high quality)
try:
    with open('scratch/missed_categories_products.json', 'r', encoding='utf-8') as f:
        for it in json.load(f):
            add_item(it.get('id'), it.get('title'), it.get('image'), it.get('category'))
except Exception as e:
    print("Err 2:", e)

# 3. Load from product_ids.json
try:
    with open('scratch/product_ids.json', 'r', encoding='utf-8') as f:
        for it in json.load(f):
            add_item(it.get('indiamartId') or it.get('catalogId'), it.get('name'))
except Exception as e:
    print("Err 3:", e)

# 4. Load from catalog.ts
try:
    with open('src/data/catalog.ts', 'r', encoding='utf-8', errors='ignore') as f:
        ts = f.read()
    pattern = re.compile(r'{\s*"id":\s*"([^"]+)",[\s\S]*?"name":\s*"([^"]+)",[\s\S]*?"title":\s*"([^"]+)",[\s\S]*?"partNumber":\s*"([^"]+)",[\s\S]*?"brand":\s*"([^"]+)",[\s\S]*?"category":\s*"([^"]+)",[\s\S]*?"price":\s*"([^"]+)",[\s\S]*?"image":\s*"([^"]+)"', re.MULTILINE)
    for m in pattern.finditer(ts):
        add_item(m.group(1), m.group(3) or m.group(2), m.group(8), m.group(6))
except Exception as e:
    print("Err 4:", e)

print(f"Total Unique Clean Master IndiaMART Products: {len(clean_master)}")

with open('scratch/clean_master_products.json', 'w', encoding='utf-8') as f:
    json.dump(clean_master, f, indent=2)
