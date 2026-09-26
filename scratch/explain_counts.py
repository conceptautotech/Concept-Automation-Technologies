import openpyxl
import json
import re

import io
with open('example sheet (concept automation technologies)_FILLED.xlsx.bak', 'rb') as f:
    wb_orig = openpyxl.load_workbook(io.BytesIO(f.read()))
ws_orig = wb_orig['Sheet1']

orig_models = []
for r in range(2, 568):
    m = ws_orig.cell(row=r, column=4).value
    if m:
        orig_models.append(str(m).strip())

# Load all scraped IndiaMART products
with open('scratch/grand_master_indiamart_products.json', 'r', encoding='utf-8') as f:
    indiamart_prods = json.load(f)

im_titles = [v['title'] for v in indiamart_prods.values()]

print(f"Products in original sheet: {len(orig_models)}")
print(f"Unique products scraped from IndiaMART: {len(indiamart_prods)}")

# Check how many of orig_models are on IndiaMART
found_on_im = 0
not_on_im = []
for om in orig_models:
    norm_om = re.sub(r'[^A-Z0-9]', '', om.upper())
    match = False
    for v in indiamart_prods.values():
        t = v.get('title', '').upper()
        norm_t = re.sub(r'[^A-Z0-9]', '', t)
        if norm_om in norm_t or norm_t in norm_om:
            match = True
            break
    if match:
        found_on_im += 1
    else:
        not_on_im.append(om)

print(f"Original sheet products found on IndiaMART: {found_on_im}")
print(f"Original sheet products NOT on IndiaMART: {len(not_on_im)}")
print(f"\nSample products in original sheet that are NOT on IndiaMART:")
for om in not_on_im[:15]:
    print(f"  {om}")
