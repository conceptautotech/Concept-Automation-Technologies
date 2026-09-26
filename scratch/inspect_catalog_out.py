import re

with open('scratch/catalog_test_out.ts', 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

ids = re.findall(r'"id":\s*"([^"]+)"', text)
print(f"Total IDs in scratch/catalog_test_out.ts: {len(ids)} (unique: {len(set(ids))})")
