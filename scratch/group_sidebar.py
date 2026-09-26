import re
from collections import defaultdict

with open('scratch/mitsubishi_plc_desktop.html', 'r', encoding='utf-8', errors='ignore') as f:
    html = f.read()

sidebar_links = re.findall(r'<a\s+href=[\'"]([^\'"]+)[\'"]\s+class=[\'"]cat-sidebar__product-link[\'"][^>]*>(.*?)</a>', html)
cat_groups = defaultdict(list)
for link, name in sidebar_links:
    cat = link.split('#')[0]
    cat_groups[cat].append((link, name))

print('Sidebar categories in this HTML:')
for cat, items in cat_groups.items():
    print(f'  {cat}: {len(items)} products')
