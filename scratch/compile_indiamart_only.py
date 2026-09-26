import json
import re

with open('scratch/clean_master_products.json', 'r', encoding='utf-8') as f:
    master_prods = json.load(f)

# Also load scraped_specs
scraped_specs = {}
try:
    with open('scratch/scraped_data.json', 'r', encoding='utf-8') as f:
        sd = json.load(f)
        for k, v in sd.items():
            clean_k = k.replace('im-', '')
            specs_dict = {s['label']: s['value'] for s in v.get('specifications', []) if 'label' in s and 'value' in s}
            scraped_specs[clean_k] = specs_dict
except Exception:
    pass

from build_extractors import detect_brand, detect_type, detect_series
from refine_all_models import refine_model

blacklist = {
    '18DI/12DO', '24DI/16DO', '14DI/10DO', '8DI/6DO', '12DI/8DO', '16DI/16DO', '32DI/32DO',
    'AC/DC/RELAY', 'DC/DC/DC', 'DC/DC/RELAY', 'AC/DC/TRANSISTOR',
    '100-240VAC', '24VDC', '220VAC', '440VAC', '380-480V', '200-240V',
    '150HP', '100HP', '50HP', '10HP', '5HP', '15KW', '11KW', '7.5KW', '5.5KW', '4KW', '2.2KW', '1.5KW', '0.75KW', '0.37KW',
    'MODEL', 'TOUCH PANEL', '& TOUCH PANELS', 'CYLINDER SENSOR', 'PROXIMITY SENSOR',
    'PROXIMITY SENSORS', 'MAGNETIC SENSOR', 'PHOTOELECTRIC SENSOR', 'ROTARY ENCODERS .',
    'SHAFT ENCODER .', 'ETHERNET SWITCH', 'VFD', 'PLC', 'HMI', 'SENSOR', 'SENSORS',
    'SAFETY RELAY', 'ALLEN BRADLEY', 'ALLEN BRADLEY SLC 500', 'SIMATIC S7-1200',
    'SIMATIC S7-1200 BASIC', 'SIMATIC S7-1500', 'S7 1200', 'S7-1500', 'IE SERIES', 'IP SERIES'
}

clean_siemens_re = re.compile(r'\b(6[A-Z0-9]{2,3}[-\s]?[0-9A-Z]{4,5}[-\s]?[0-9A-Z]{3,5})\b', re.I)

def get_final_fields(pid, p):
    title = p.get('title', '')
    cat = p.get('category', '')
    img = p.get('image', '')
    specs = scraped_specs.get(pid, {})
    
    brand = detect_brand(title, cat)
    ptype = detect_type(title, cat)
    series = detect_series(title, brand)
    
    # Extract model
    m = refine_model(title, title)
    
    # Specific refinement for Siemens MLFB
    siem = clean_siemens_re.search(title)
    if siem and brand == 'Siemens':
        raw_s = siem.group(1).upper().replace(' ', '')
        if len(raw_s) == 16 and '-' not in raw_s:
            m = f"{raw_s[:7]}-{raw_s[7:12]}-{raw_s[12:]}"
        else:
            m = raw_s
            
    # Clean up image URL to high-res
    img_link = img or f"https://www.indiamart.com/proddetail/{pid}.html"
    if 'imimg.com' in img_link:
        img_link = re.sub(r'-\d+x\d+\.', '-1000x1000.', img_link)
        
    return {
        'id': pid,
        'brand': brand,
        'type': ptype,
        'series': series,
        'model': m,
        'image_link': img_link,
        'title': title,
        'category': cat
    }

indiamart_catalog = []
seen_models = set()

for pid, p in master_prods.items():
    f = get_final_fields(pid, p)
    norm = re.sub(r'[^A-Z0-9]', '', f['model'].upper())
    norm = re.sub(r'(\d+)\.(\d+)', r'\1DOT\2', norm)
    
    if f['model'].upper() in blacklist or not norm or len(norm) < 3:
        # Fallback to part number or cleaned title
        f['model'] = re.sub(r'^(Siemens|Mitsubishi|Omron|Allen-?Bradley|ABB|Schneider|Danfoss|Fuji|Pro-?face|Weintek)\s+', '', f['title'], flags=re.I).strip()
        norm = re.sub(r'[^A-Z0-9]', '', f['model'].upper())
        
    if norm in seen_models:
        continue
    seen_models.add(norm)
    indiamart_catalog.append(f)

print(f"Total authentic unique products from IndiaMART: {len(indiamart_catalog)}")

# Sort by Brand, Type, Series, Model
indiamart_catalog.sort(key=lambda x: (
    x['brand'].upper(),
    x['type'].upper(),
    x['series'].upper() if x['series'] else 'ZZZ',
    x['model'].upper()
))

with open('scratch/indiamart_only_catalog.json', 'w', encoding='utf-8') as fp:
    json.dump(indiamart_catalog, fp, indent=2)

from collections import Counter
print("\nBrand breakdown of IndiaMART products:")
b_cnt = Counter(x['brand'] for x in indiamart_catalog)
for b, c in b_cnt.most_common():
    print(f"  {b}: {c}")

print("\nType breakdown:")
t_cnt = Counter(x['type'] for x in indiamart_catalog)
for t, c in t_cnt.most_common():
    print(f"  {t}: {c}")
