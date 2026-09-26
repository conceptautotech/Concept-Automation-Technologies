import re

with open('scratch/mitsubishi_plc_desktop.html', 'r', encoding='utf-8', errors='ignore') as f:
    html = f.read()

sidebar_links = re.findall(r'<a\s+href=[\'"]([^\'"]+)[\'"]\s+class=[\'"]cat-sidebar__product-link[\'"][^>]*>(.*?)</a>', html)
print('Total sidebar links:', len(sidebar_links))
for link, name in sidebar_links[:20]:
    print(f'  {link} -> {name}')

# Check how the remaining 55 products can be fetched or viewed!
# Does IndiaMART have pagination like ?page=2 or ajax?
# Or does the sidebar link to /conceptautomationtechnologies/mitsubishi-plc.html#... or does it link to other categories?
print('\nDistinct URLs in sidebar links:')
urls = set(link.split('#')[0] for link, _ in sidebar_links)
print(urls)
