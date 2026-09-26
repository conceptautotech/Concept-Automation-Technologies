import re

with open('src/data/catalog.ts', 'r', encoding='utf-8', errors='ignore') as f:
    ts = f.read()

ids = re.findall(r'id:\s*[\'"]([^\'"]+)[\'"]', ts)
print('Total products in src/data/catalog.ts:', len(ids), len(set(ids)))
names = re.findall(r'name:\s*[\'"]([^\'"]+)[\'"]', ts)
print('Total names in src/data/catalog.ts:', len(names))
partNums = re.findall(r'partNumber:\s*[\'"]([^\'"]+)[\'"]', ts)
print('Total partNumbers in src/data/catalog.ts:', len(partNums))
