import json
import glob
import os

for f in glob.glob('scratch/*.json'):
    size = os.path.getsize(f)
    print(f'File: {f} ({size} bytes)')
    try:
        with open(f, 'r', encoding='utf-8', errors='ignore') as fp:
            d = json.load(fp)
            if isinstance(d, list):
                print(f'  List with {len(d)} items. Sample: {d[0] if len(d) > 0 else "empty"}')
            elif isinstance(d, dict):
                print(f'  Dict with {len(d)} keys. Sample keys: {list(d.keys())[:5]}')
    except Exception as e:
        print(f'  Error loading: {e}')
