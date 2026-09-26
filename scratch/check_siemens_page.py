import urllib.request
import gzip
import re
import json

url = 'https://www.indiamart.com/conceptautomationtechnologies/siemens-plc.html'
req = urllib.request.Request(url, headers={
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Encoding': 'gzip, deflate'
})

resp = urllib.request.urlopen(req, timeout=20)
content = resp.read()
if resp.headers.get('Content-Encoding') == 'gzip':
    content = gzip.decompress(content)
html = content.decode('utf-8', errors='ignore')

print('Fetched siemens-plc.html, length:', len(html))
articles = re.findall(r'<article\s+id=[\'"](\d+)[\'"]\s+class=[\'"]udg-category-item[\'"]', html)
print('Articles in siemens-plc.html:', len(articles), len(set(articles)))

# Check pagination or next page links
pagination_links = re.findall(r'href=[\'"]([^\'"]*(?:page|p=|pg=)[^\'"]*)[\'"]', html, re.I)
print('Pagination links found:', pagination_links)

# Check if there are more products mentioned in script tags or __NEXT_DATA__ or similar
scripts = re.findall(r'<script[^>]*>(.*?)</script>', html, re.DOTALL)
print('Total scripts:', len(scripts))
for i, s in enumerate(scripts):
    if 'product' in s.lower() and len(s) > 1000:
        print(f'Script {i} contains product keyword, length: {len(s)}')
