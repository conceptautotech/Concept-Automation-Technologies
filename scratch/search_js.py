import re

with open('scratch/main_86.js', 'r', encoding='utf-8', errors='ignore') as f:
    js = f.read()

print('Length of main_86.js:', len(js))

# Search for ajax urls or endpoints or fetch
urls = re.findall(r'https?://[a-zA-Z0-9_\.-]+/[a-zA-Z0-9_/\.-]+', js)
print('Total URLs in JS:', len(urls))
unique_urls = set(urls)
for u in sorted(unique_urls):
    if any(k in u for k in ['api', 'prod', 'cat', 'company', 'ajax', 'service', 'item', 'page', 'infinite', 'more']):
        print('  API/endpoint candidate:', u)

# Search for api paths like /something/something
paths = re.findall(r'["\'](/[\w/-]+)["\']', js)
for p in set(paths):
    if any(k in p for k in ['prod', 'category', 'pagination', 'scroll', 'more', 'load', 'listing', 'data']):
        print('  Relative path candidate:', p)
