import json
import re

with open('scratch/siemens_plc.html', 'r', encoding='utf-8', errors='ignore') as f:
    html = f.read()

m = re.search(r'window\.__COMPANY_DATA__\s*=\s*(\{.*?\});', html, re.DOTALL)
if m:
    data = json.loads(m.group(1))
    cats = data.get('categories', [])
    print(f'Total categories: {len(cats)}')
    print('Sample cat 0:', json.dumps(cats[0], indent=2))
    total_prod_count = sum(c.get('product_count', c.get('count', 0)) for c in cats)
    print('Sum of product counts if field exists:', total_prod_count)
    for c in cats[:10]:
        print(f"  {c.get('cat_name', c.get('name'))} : count = {c.get('product_count', c.get('count'))} , id = {c.get('cat_id', c.get('id'))}")
