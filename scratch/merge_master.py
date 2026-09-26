import json
import re

all_indiamart_products = {} # id -> dict

def add_product(pid, title, img='', price='', category='', url='', specs=None):
    if not pid:
        return
    clean_id = str(pid).strip().replace('im-', '')
    if not clean_id or not clean_id.isdigit():
        return
    
    if clean_id not in all_indiamart_products:
        all_indiamart_products[clean_id] = {
            'id': clean_id,
            'title': title or '',
            'image': img or '',
            'price': price or '',
            'category': category or '',
            'url': url or f"https://www.indiamart.com/proddetail/{clean_id}.html",
            'specs': specs or {}
        }
    else:
        # update fields if better
        cur = all_indiamart_products[clean_id]
        if not cur['title'] and title:
            cur['title'] = title
        if not cur['image'] and img:
            cur['image'] = img
        if not cur['price'] and price:
            cur['price'] = price
        if not cur['category'] and category:
            cur['category'] = category
        if specs:
            cur['specs'].update(specs)

# 1. all_extracted_category_products.json
try:
    with open('scratch/all_extracted_category_products.json', 'r', encoding='utf-8') as f:
        for item in json.load(f):
            add_product(item.get('id'), item.get('title'), item.get('image'), item.get('price'), item.get('category'), item.get('detail_url'))
except Exception as e:
    print("Error 1:", e)

# 2. missed_categories_products.json
try:
    with open('scratch/missed_categories_products.json', 'r', encoding='utf-8') as f:
        for item in json.load(f):
            add_product(item.get('id'), item.get('title'), item.get('image'), item.get('price'), item.get('category'), item.get('detail_url'))
except Exception as e:
    print("Error 2:", e)

# 3. catalog.ts
try:
    with open('src/data/catalog.ts', 'r', encoding='utf-8', errors='ignore') as f:
        ts = f.read()
    pattern = re.compile(r'{\s*"id":\s*"([^"]+)",[\s\S]*?"name":\s*"([^"]+)",[\s\S]*?"title":\s*"([^"]+)",[\s\S]*?"partNumber":\s*"([^"]+)",[\s\S]*?"brand":\s*"([^"]+)",[\s\S]*?"category":\s*"([^"]+)",[\s\S]*?"price":\s*"([^"]+)",[\s\S]*?"image":\s*"([^"]+)"', re.MULTILINE)
    for m in pattern.finditer(ts):
        add_product(m.group(1), m.group(3) or m.group(2), m.group(8), m.group(7), m.group(6), specs={'Brand': m.group(5), 'partNumber': m.group(4)})
except Exception as e:
    print("Error 3:", e)

# 4. product_ids.json
try:
    with open('scratch/product_ids.json', 'r', encoding='utf-8') as f:
        for item in json.load(f):
            pid = item.get('indiamartId') or item.get('catalogId')
            add_product(pid, item.get('name'), url=item.get('url'))
except Exception as e:
    print("Error 4:", e)

# 5. scraped_data.json
try:
    with open('scratch/scraped_data.json', 'r', encoding='utf-8') as f:
        sd = json.load(f)
        for k, v in sd.items():
            img = v.get('images', [''])[0] if v.get('images') else ''
            desc = v.get('description', '').split('\n')[0][:100]
            specs_dict = {s['label']: s['value'] for s in v.get('specifications', []) if 'label' in s and 'value' in s}
            add_product(k, desc, img=img, price=v.get('price', ''), specs=specs_dict)
except Exception as e:
    print("Error 5:", e)

# 6. discovered_products.json
try:
    with open('scratch/discovered_products.json', 'r', encoding='utf-8') as f:
        for item in json.load(f):
            add_product(item.get('id'), item.get('name'), img=item.get('image'), price=item.get('price'), category=item.get('category'))
except Exception as e:
    print("Error 6:", e)

print(f"Total Unique IndiaMART Products Compiled: {len(all_indiamart_products)}")

with open('scratch/master_indiamart_all.json', 'w', encoding='utf-8') as f:
    json.dump(all_indiamart_products, f, indent=2)
