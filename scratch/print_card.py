import re

with open('scratch/mitsubishi_plc_desktop.html', 'r', encoding='utf-8', errors='ignore') as f:
    html = f.read()

pos = 46860
snippet = html[pos-200:pos+1500]
print(snippet.encode('ascii', errors='replace').decode('ascii'))
