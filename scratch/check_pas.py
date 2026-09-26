import urllib.request
import gzip
import re
import json

with open('scratch/master_indiamart_all.json', 'r', encoding='utf-8') as f:
    master = json.load(f)

print(f"Current master products count: {len(master)}")

# Fetch desktop products-and-services
url = 'https://www.indiamart.com/conceptautomationtechnologies/products-and-services.html'
req = urllib.request.Request(url, headers={
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept-Encoding': 'gzip'
})

resp = urllib.request.urlopen(req, timeout=15)
content = gzip.decompress(resp.read()).decode('utf-8', errors='ignore')

# Extract all proddetail links
details = re.findall(r'/proddetail/[^\s"\'#]+-?(\d{8,})\.html', content)
print(f"Products in desktop products-and-services: {len(set(details))}")

new_from_pas = [d for d in set(details) if d not in master]
print(f"New from desktop products-and-services: {len(new_from_pas)}")

# Check mobile products-and-services
with open('scratch/m_products_and_services.html', 'r', encoding='utf-8', errors='ignore') as f:
    m_content = f.read()

m_details = re.findall(r'/proddetail/[^\s"\'#]+-?(\d{8,})\.html', m_content)
print(f"Products in mobile products-and-services: {len(set(m_details))}")
new_from_m = [d for d in set(m_details) if d not in master]
print(f"New from mobile products-and-services: {len(new_from_m)}")
