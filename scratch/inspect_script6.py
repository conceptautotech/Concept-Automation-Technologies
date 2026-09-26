import re

with open('scratch/check_siemens_page.py', 'r') as f:
    pass

# We already fetched siemens-plc.html? Let's save it to scratch/siemens_plc.html
import urllib.request
import gzip

url = 'https://www.indiamart.com/conceptautomationtechnologies/siemens-plc.html'
req = urllib.request.Request(url, headers={
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept-Encoding': 'gzip'
})
content = gzip.decompress(urllib.request.urlopen(req).read()).decode('utf-8', errors='ignore')
with open('scratch/siemens_plc.html', 'w', encoding='utf-8') as f:
    f.write(content)

scripts = re.findall(r'<script[^>]*>(.*?)</script>', content, re.DOTALL)
print('Script 6 length:', len(scripts[6]))
print(scripts[6][:2000])
