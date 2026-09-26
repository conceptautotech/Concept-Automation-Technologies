import re

with open('scratch/mitsubishi_plc_desktop.html', 'r', encoding='utf-8', errors='ignore') as f:
    html = f.read()

# Look for occurrences of id="2855001676733" or similar
matches = [m.start() for m in re.finditer(r'id=["\']2855001676733["\']', html)]
print('Matches for 2855001676733:', len(matches))
for idx in matches:
    print(f'\n--- Match at {idx} ---')
    snippet = html[idx-100:idx+600].encode('ascii', errors='replace').decode('ascii')
    print(snippet)
