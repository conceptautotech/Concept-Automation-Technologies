import urllib.request
import gzip
import re
import time

url = 'https://www.indiamart.com/conceptautomationtechnologies/omron-plc.html'
req = urllib.request.Request(url, headers={
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Encoding': 'gzip, deflate'
})

try:
    resp = urllib.request.urlopen(req, timeout=15)
    content = gzip.decompress(resp.read()).decode('utf-8', errors='ignore')
    print('Desktop omron-plc.html Status:', resp.status, 'Length:', len(content))
    articles = re.findall(r'<article\s+id=[\'"](\d+)[\'"]\s+class=[\'"]udg-category-item[\'"]', content)
    print('Articles on desktop omron-plc.html:', len(articles))
    details = re.findall(r'/proddetail/[^\s"\'#]+\.html', content)
    print('Proddetails on desktop:', len(set(details)))
    for d in list(set(details))[:5]:
        print(' ', d)
except Exception as e:
    print('Error:', e)
