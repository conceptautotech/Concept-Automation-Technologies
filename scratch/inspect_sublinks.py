import re
import json

with open('scratch/mitsubishi_plc_desktop.html', 'r', encoding='utf-8', errors='ignore') as f:
    html = f.read()

# Extract subLinks
sub_match = re.search(r'var\s+subLinks\s*=\s*(\[.*?\]);', html, re.DOTALL)
if sub_match:
    sublinks = json.loads(sub_match.group(1))
    print(f'Total subLinks: {len(sublinks)}')
    for item in sublinks:
        print(f"  {item.get('label')}: {item.get('link')}")

# Extract byCatName if any
by_cat = re.search(r'var\s+byCatName\s*=\s*(\{.*?\});', html, re.DOTALL)
if by_cat:
    print('byCatName length:', len(by_cat.group(1)))

# Let's inspect the HTML around one of the IDs: 2855001676733
pos = html.find('2855001676733')
if pos != -1:
    print('\nHTML snippet around 2855001676733:')
    print(html[pos-200:pos+800])
