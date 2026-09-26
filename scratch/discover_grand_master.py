import os
import glob
import re
import json

all_discovered = {} # id -> dict

def register_product(pid, title, img='', price='', cat='', url=''):
    if not pid:
        return
    clean_id = str(pid).strip().replace('im-', '').replace('ca-', '')
    if not clean_id.isdigit() or len(clean_id) < 6:
        return
    
    clean_title = re.sub(r'[\r\n\t]+', ' ', title or '').strip()
    clean_title = re.sub(r'<[^>]+>', ' ', clean_title).strip()
    clean_title = re.sub(r'\s+', ' ', clean_title)
    
    # Strip price if embedded in title (e.g. "Title ₹ 50,000")
    if '₹' in clean_title:
        parts = clean_title.split('₹')
        clean_title = parts[0].strip()
        if not price and len(parts) > 1:
            price = '₹' + parts[1].strip()

    if clean_id not in all_discovered:
        all_discovered[clean_id] = {
            'id': clean_id,
            'title': clean_title,
            'image': img,
            'price': price,
            'category': cat,
            'url': url or f"https://www.indiamart.com/proddetail/{clean_id}.html"
        }
    else:
        cur = all_discovered[clean_id]
        if len(clean_title) > len(cur['title']):
            cur['title'] = clean_title
        if not cur['image'] and img:
            cur['image'] = img
        if not cur['price'] and price:
            cur['price'] = price
        if not cur['category'] and cat:
            cur['category'] = cat

# 1. Parse all HTML files in scratch
for html_file in glob.glob('scratch/*.html'):
    try:
        with open(html_file, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
            
        # Articles
        articles = re.findall(r'<article\s+id=[\'"](\d+)[\'"]\s+class=[\'"]udg-category-item[\'"]([\s\S]*?)</article>', content)
        for pid, art in articles:
            t_m = re.search(r'class=[\'"]udg-category-item__title[\'"][^>]*><a[^>]*>(.*?)</a>', art)
            title = t_m.group(1) if t_m else ''
            img_m = re.search(r'<img[^>]+src=[\'"](https://\d+\.imimg\.com/[^\'"]+)[\'"]', art)
            img = img_m.group(1) if img_m else ''
            pr_m = re.search(r'class=[\'"]udg-category-item__priceAmount[\'"][^>]*>([^<]+)</span>', art)
            pr = pr_m.group(1) if pr_m else ''
            register_product(pid, title, img, pr)
            
        # Slider cards
        cards = re.findall(r'<li\s+id=[\'"](\d+)[\'"]\s+class=[\'"]cat-slider__card[\'"]([\s\S]*?)</li>', content)
        for pid, card in cards:
            t_m = re.search(r'class=[\'"]cat-slider__name[\'"][^>]*>([^<]+)</p>', card)
            title = t_m.group(1) if t_m else ''
            img_m = re.search(r'<img[^>]+src=[\'"](https://\d+\.imimg\.com/[^\'"]+)[\'"]', card)
            img = img_m.group(1) if img_m else ''
            pr_m = re.search(r'class=[\'"]cat-slider__price[\'"][^>]*>([^<]+)</p>', card)
            pr = pr_m.group(1) if pr_m else ''
            register_product(pid, title, img, pr)
            
        # Proddetail links
        pds = re.findall(r'<a[^>]*href=[\'"](/proddetail/[^\'"]*?-?(\d{8,})\.html)[\'"][^>]*>([\s\S]*?)</a>', content)
        for href, pid, inner in pds:
            alt_m = re.search(r'alt=[\'"]([^\'"]+)[\'"]', inner)
            title = alt_m.group(1) if alt_m else ''
            if not title:
                title = re.sub(r'<[^>]+>', ' ', inner).strip()
            img_m = re.search(r'src=[\'"](https://\d+\.imimg\.com/[^\'"]+)[\'"]', inner)
            img = img_m.group(1) if img_m else ''
            register_product(pid, title, img, url=f"https://www.indiamart.com{href}")
            
        # Also sidebar links
        sidebar = re.findall(r'<a\s+href=[\'"][^\'"]*#(\d{8,})[\'"]\s+class=[\'"]cat-sidebar__product-link[\'"][^>]*>(.*?)</a>', content)
        for pid, title in sidebar:
            register_product(pid, title)
            
    except Exception as e:
        print(f"Error reading {html_file}: {e}")

# 2. Parse all JSON files in scratch
for json_file in glob.glob('scratch/*.json'):
    if 'audit' in json_file: continue
    try:
        with open(json_file, 'r', encoding='utf-8', errors='ignore') as f:
            d = json.load(f)
            
        if isinstance(d, list):
            for item in d:
                pid = item.get('id') or item.get('indiamartId') or item.get('display_id')
                t = item.get('title') or item.get('name')
                img = item.get('image') or item.get('img125') or item.get('imageUrl')
                register_product(pid, t, img, item.get('price'), item.get('category'))
        elif isinstance(d, dict):
            for k, v in d.items():
                if isinstance(v, dict):
                    pid = v.get('id') or k
                    t = v.get('title') or v.get('name') or v.get('description', '').split('\n')[0]
                    img = v.get('image') or (v.get('images', [''])[0] if v.get('images') else '')
                    register_product(pid, t, img, v.get('price'), v.get('category'))
    except Exception as e:
        print(f"Error reading {json_file}: {e}")

# 3. Parse catalog.ts
with open('src/data/catalog.ts', 'r', encoding='utf-8', errors='ignore') as f:
    ts_text = f.read()

pattern = re.compile(r'{\s*"id":\s*"([^"]+)",[\s\S]*?"name":\s*"([^"]+)",[\s\S]*?"title":\s*"([^"]+)",[\s\S]*?"partNumber":\s*"([^"]+)",[\s\S]*?"brand":\s*"([^"]+)",[\s\S]*?"category":\s*"([^"]+)",[\s\S]*?"price":\s*"([^"]+)",[\s\S]*?"image":\s*"([^"]+)"', re.MULTILINE)
for m in pattern.finditer(ts_text):
    register_product(m.group(1), m.group(3) or m.group(2), m.group(8), m.group(7), m.group(6))

print(f"============================================================")
print(f"TOTAL AUTHENTIC UNIQUE INDIAMART PRODUCTS DISCOVERED: {len(all_discovered)}")
print(f"============================================================")

with open('scratch/grand_master_indiamart_products.json', 'w', encoding='utf-8') as f:
    json.dump(all_discovered, f, indent=2)
