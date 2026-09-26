import re

with open('scratch/main_86.js', 'r', encoding='utf-8', errors='ignore') as f:
    js = f.read()

# Search for fetch, XMLHttpRequest, ajax, axios, $.get
fetch_matches = [m.start() for m in re.finditer(r'fetch\(', js)]
print('fetch calls:', len(fetch_matches))
for idx in fetch_matches:
    print(' ', js[idx:idx+150])

xhr_matches = [m.start() for m in re.finditer(r'XMLHttpRequest|\.open\(', js)]
print('XHR calls:', len(xhr_matches))
for idx in xhr_matches:
    print(' ', js[idx-20:idx+120])
