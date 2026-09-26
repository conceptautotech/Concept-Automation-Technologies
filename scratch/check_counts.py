import re

with open('scratch/mitsubishi_plc_desktop.html', 'r', encoding='utf-8', errors='ignore') as f:
    html = f.read()

counts = re.findall(r'href=[\'"]([^\'"]+)[\'"]\s+class=[\'"]cat-sidebar__count[\'"][^>]*>([^<]+)</a>', html)
print('Sidebar count headers found in mitsubishi_plc_desktop.html:', len(counts))
for link, cnt in counts:
    print(f'  {link}: {cnt}')
