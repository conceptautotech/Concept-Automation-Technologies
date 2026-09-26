import json
import re

with open('scratch/siemens_plc.html', 'r', encoding='utf-8', errors='ignore') as f:
    html = f.read()

m = re.search(r'window\.__COMPANY_DATA__\s*=\s*(\{.*?\});', html, re.DOTALL)
if m:
    data = json.loads(m.group(1))
    print('Keys in __COMPANY_DATA__:', list(data.keys()))
    for k, v in data.items():
        if isinstance(v, dict):
            print(f'  {k}: dict with keys {list(v.keys())}')
        elif isinstance(v, list):
            print(f'  {k}: list of length {len(v)}')
        else:
            print(f'  {k}: {type(v)}')
else:
    print('__COMPANY_DATA__ not found')
