import urllib.request
import gzip
import re

url = 'https://m.indiamart.com/conceptautomationtechnologies/omron-plc.html'
req = urllib.request.Request(url, headers={
    'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Encoding': 'gzip, deflate'
})

resp = urllib.request.urlopen(req, timeout=15)
content = gzip.decompress(resp.read()).decode('utf-8', errors='ignore')

# Search for any occurrence of 'omron' or 'CP1' or product titles
print('Occurrences of omron:', len(re.findall(r'omron', content, re.I)))
# Search for links
links = re.findall(r'href=[\'"]([^\'"]+)[\'"]', content)
print('Total links:', len(links))
proddetails = [l for l in links if 'proddetail' in l]
print('Proddetail links:', len(proddetails), proddetails[:5])

# Also check for proddetail in text
all_pds = re.findall(r'/proddetail/[^\s"\'<>]+\.html', content)
print('All proddetails in content:', len(set(all_pds)), list(set(all_pds))[:5])
