import re

with open('scratch/siemens_plc.html', 'r', encoding='utf-8', errors='ignore') as f:
    html = f.read()

scripts = re.findall(r'<script[^>]*src=[\'"]([^\'"]+)[\'"]', html)
print('Script src tags:')
for s in scripts:
    print(' ', s)
