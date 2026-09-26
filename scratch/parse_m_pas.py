import re
import json

with open('scratch/m_products_and_services.html', 'r', encoding='utf-8', errors='ignore') as f:
    m_content = f.read()

# Let's inspect product blocks in m_products_and_services.html
blocks = re.findall(r'<a[^>]*href=[\'"](/proddetail/[^\'"]*?-?(\d+)\.html)[\'"][^>]*>([\s\S]*?)</a>', m_content)
print(f"Total product link blocks in m_products_and_services: {len(blocks)}")

extracted = []
for href, pid, inner in blocks:
    alt_m = re.search(r'alt=[\'"]([^\'"]+)[\'"]', inner)
    title = alt_m.group(1).strip() if alt_m else ''
    if not title:
        txt = re.sub(r'<[^>]+>', ' ', inner).strip()
        if len(txt) > 3:
            title = txt
    img_m = re.search(r'src=[\'"](https://\d+\.imimg\.com/[^\'"]+)[\'"]', inner)
    img = img_m.group(1) if img_m else ''
    extracted.append({
        'id': pid,
        'title': title,
        'image': img,
        'href': href
    })

print(f"Sample 10 from m_products_and_services:")
for x in extracted[:10]:
    print(f"  [{x['id']}] {x['title']}")
