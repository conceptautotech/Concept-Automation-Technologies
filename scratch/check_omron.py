import urllib.request
import gzip

url = 'https://www.indiamart.com/conceptautomationtechnologies/omron-plc.html'
req = urllib.request.Request(url, headers={
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Encoding': 'gzip, deflate'
})

try:
    resp = urllib.request.urlopen(req, timeout=15)
    print('Status:', resp.status)
    print('Final URL:', resp.geturl())
    content = resp.read()
    if resp.headers.get('Content-Encoding') == 'gzip':
        content = gzip.decompress(content)
    text = content.decode('utf-8', errors='ignore')
    print('Length:', len(text))
    print('Title match:', text[:1000])
except Exception as e:
    print('Error:', e)
