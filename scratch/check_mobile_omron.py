import urllib.request
import gzip
import time

url = 'https://m.indiamart.com/conceptautomationtechnologies/omron-plc.html'
req = urllib.request.Request(url, headers={
    'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Encoding': 'gzip, deflate'
})

try:
    resp = urllib.request.urlopen(req, timeout=15)
    print('Status:', resp.status)
    content = resp.read()
    if resp.headers.get('Content-Encoding') == 'gzip':
        content = gzip.decompress(content)
    text = content.decode('utf-8', errors='ignore')
    print('Length:', len(text))
    import re
    prods = re.findall(r'/proddetail/(\d+)\.html', text)
    print('Prods found on mobile omron-plc.html:', len(set(prods)))
except Exception as e:
    print('Error:', e)
