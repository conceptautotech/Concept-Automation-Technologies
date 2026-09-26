import urllib.request
import gzip
import re
import json
import time

def fetch_url(url, is_mobile=True):
    headers = {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36' if is_mobile else 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate'
    }
    req = urllib.request.Request(url, headers=headers)
    try:
        resp = urllib.request.urlopen(req, timeout=15)
        content = resp.read()
        if resp.headers.get('Content-Encoding') == 'gzip':
            content = gzip.decompress(content)
        return content.decode('utf-8', errors='ignore')
    except Exception as e:
        print(f"Error {url}: {e}")
        return ''

with open('scratch/siemens_plc.html', 'r', encoding='utf-8', errors='ignore') as f:
    html = f.read()

sub_match = re.search(r'var\s+subLinks\s*=\s*(\[.*?\]);', html, re.DOTALL)
sublinks = json.loads(sub_match.group(1))
print(f"Loaded {len(sublinks)} categories from subLinks.")

all_products = {} # id -> {id, title, img, price, cat, url}

for idx, item in enumerate(sublinks):
    link = item.get('link')
    label = item.get('label')
    url = f"https://www.indiamart.com{link}"
    
    # Try desktop first
    html_page = fetch_url(url, is_mobile=False)
    if not html_page or 'Too Many Requests' in html_page:
        print(f"[{idx+1}/{len(sublinks)}] Desktop 429 on {label}, sleeping 3s and trying mobile...")
        time.sleep(3)
        html_page = fetch_url(f"https://m.indiamart.com{link}", is_mobile=True)
    
    # Extract articles
    articles = re.findall(r'<article\s+id=[\'"](\d+)[\'"]\s+class=[\'"]udg-category-item[\'"]([\s\S]*?)</article>', html_page)
    
    # Also extract slider cards
    cards = re.findall(r'<li\s+id=[\'"](\d+)[\'"]\s+class=[\'"]cat-slider__card[\'"]([\s\S]*?)</li>', html_page)
    
    # Also extract proddetails from mobile or desktop
    proddetails = re.findall(r'href=[\'"](?:https?://(?:www|m)\.indiamart\.com)?(/proddetail/[^\s"\'#]+\.html)[\'"]', html_page)
    
    cat_prods = 0
    # Process articles
    for prod_id, art_html in articles:
        if prod_id not in all_products:
            # find title
            title_m = re.search(r'class=[\'"]udg-category-item__title[\'"][^>]*><a[^>]*>(.*?)</a>', art_html)
            title = title_m.group(1).strip() if title_m else ''
            
            # find image
            img_m = re.search(r'<img[^>]+src=[\'"](https://\d+\.imimg\.com/[^\'"]+)[\'"]', art_html)
            img = img_m.group(1) if img_m else ''
            
            # find price
            price_m = re.search(r'class=[\'"]udg-category-item__priceAmount[\'"][^>]*>([^<]+)</span>', art_html)
            price = price_m.group(1).strip() if price_m else ''
            
            # find detail url
            det_m = re.search(r'href=[\'"](//www\.indiamart\.com/proddetail/[^\'"]+)[\'"]', art_html)
            det_url = ('https:' + det_m.group(1)) if det_m else ''
            
            all_products[prod_id] = {
                'id': prod_id,
                'title': title,
                'image': img,
                'price': price,
                'category': label,
                'detail_url': det_url
            }
            cat_prods += 1
            
    # Process cards if not in articles
    for prod_id, card_html in cards:
        if prod_id not in all_products:
            title_m = re.search(r'class=[\'"]cat-slider__name[\'"][^>]*>([^<]+)</p>', card_html)
            title = title_m.group(1).strip() if title_m else ''
            img_m = re.search(r'<img[^>]+src=[\'"](https://\d+\.imimg\.com/[^\'"]+)[\'"]', card_html)
            img = img_m.group(1) if img_m else ''
            price_m = re.search(r'class=[\'"]cat-slider__price[\'"][^>]*>([^<]+)</p>', card_html)
            price = price_m.group(1).strip() if price_m else ''
            
            all_products[prod_id] = {
                'id': prod_id,
                'title': title,
                'image': img,
                'price': price,
                'category': label,
                'detail_url': f"https://www.indiamart.com/proddetail/{prod_id}.html"
            }
            cat_prods += 1
            
    print(f"[{idx+1}/{len(sublinks)}] {label:<35}: {cat_prods} new products (Total unique so far: {len(all_products)})")
    time.sleep(0.4)

print(f"\nFinal Total unique products extracted: {len(all_products)}")
with open('scratch/all_extracted_category_products.json', 'w', encoding='utf-8') as f:
    json.dump(list(all_products.values()), f, indent=2)
