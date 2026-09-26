import re

with open('scratch/mitsubishi_plc_desktop.html', 'r', encoding='utf-8', errors='ignore') as f:
    html = f.read()

pos = 68099
snippet = html[pos+22000:pos+26000]
print(snippet.encode('ascii', errors='replace').decode('ascii'))
