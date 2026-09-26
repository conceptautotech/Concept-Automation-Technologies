import re

with open('scratch/mitsubishi_plc_desktop.html', 'r', encoding='utf-8', errors='ignore') as f:
    html = f.read()

print('Length:', len(html))
print('Occurrences of FX5U:', len(re.findall(r'FX5U', html, re.I)))

# Let's search for id= with numbers
ids = re.findall(r'id=["\'](\d{8,})["\']', html)
print('IDs with digits 8+:', len(ids), len(set(ids)), set(list(ids)[:10]))

# Search for product sections or product names
# Look for json or data- attributes
script_json = re.findall(r'<script[^>]*type=["\']application/ld\+json["\'][^>]*>(.*?)</script>', html, re.DOTALL)
print('LD+JSON scripts:', len(script_json))
for i, s in enumerate(script_json):
    print(f'JSON {i} snippet:', s[:150].strip())

# Look for JavaScript objects or var data
vars_found = re.findall(r'var\s+([a-zA-Z0-9_]+)\s*=\s*(\{.*?\}|\[.*?\]);', html, re.DOTALL)
print('Var matches:', len(vars_found))
for name, val in vars_found[:5]:
    print(f'Var {name}: {val[:100]}...')
