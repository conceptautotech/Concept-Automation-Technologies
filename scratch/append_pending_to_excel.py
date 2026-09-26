import openpyxl
import shutil
import json
import re

# 1. Backup original file
excel_path = 'example sheet (concept automation technologies)_FILLED.xlsx'
backup_path = 'example sheet (concept automation technologies)_FILLED.xlsx.bak'
shutil.copyfile(excel_path, backup_path)
print(f"Created backup at {backup_path}")

# 2. Load refined items
with open('scratch/refined_pending_products.json', 'r', encoding='utf-8') as f:
    items = json.load(f)

# 3. Deduplicate by normalized model
seen_norm = set()
unique_pending = []

# Load existing Excel models to be 100% sure no collision with rows 1..567
wb = openpyxl.load_workbook(excel_path)
ws = wb['Sheet1']

for r in range(2, 568):
    m = ws.cell(row=r, column=4).value
    if m:
        norm = re.sub(r'[^A-Z0-9]', '', str(m).upper())
        if norm:
            seen_norm.add(norm)

print(f"Loaded {len(seen_norm)} existing models from rows 2..567")

for it in items:
    m = it['model'].strip()
    norm_m = re.sub(r'[^A-Z0-9]', '', m.upper())
    if not norm_m or len(norm_m) < 3 or norm_m in seen_norm:
        continue
    seen_norm.add(norm_m)
    unique_pending.append(it)

print(f"Unique pending products to append: {len(unique_pending)}")

# Sort by Brand, Type, Series, Model for clean, elegant catalog layout
unique_pending.sort(key=lambda x: (
    x['brand'].upper(),
    x['type'].upper(),
    x['series'].upper() if x['series'] else 'ZZZ',
    x['model'].upper()
))

# 4. Find starting row (first blank row after 567)
start_row = 568

font_regular = openpyxl.styles.Font(name='Calibri', size=11)
font_link = openpyxl.styles.Font(name='Calibri', size=11, color="0000FF", underline="single")
align_left = openpyxl.styles.Alignment(horizontal='left', vertical='center')

current_row = start_row
for it in unique_pending:
    c_brand = ws.cell(row=current_row, column=1, value=it['brand'])
    c_brand.font = font_regular
    c_brand.alignment = align_left
    
    c_type = ws.cell(row=current_row, column=2, value=it['type'])
    c_type.font = font_regular
    c_type.alignment = align_left
    
    c_series = ws.cell(row=current_row, column=3, value=it['series'] if it['series'] else None)
    c_series.font = font_regular
    c_series.alignment = align_left
    
    c_model = ws.cell(row=current_row, column=4, value=it['model'])
    c_model.font = font_regular
    c_model.alignment = align_left
    
    img_url = it.get('image_link', '')
    c_img = ws.cell(row=current_row, column=5, value=img_url if img_url else None)
    if img_url:
        c_img.hyperlink = img_url
        c_img.font = font_link
    else:
        c_img.font = font_regular
    c_img.alignment = align_left
    
    current_row += 1

# Save workbook
wb.save(excel_path)
print(f"Successfully saved updated Excel sheet with {len(unique_pending)} pending products added!")
print(f"New total rows: {current_row - 1}")
