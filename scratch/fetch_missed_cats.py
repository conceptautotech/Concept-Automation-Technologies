import urllib.request
import gzip
import re
import json
import time

# Categories that were missed due to 429
missed_categories = [
    {"label": "Weintek HMI", "link": "/conceptautomationtechnologies/weintek-hmi.html"},
    {"label": "Omron Photoelectric Sensor", "link": "/conceptautomationtechnologies/omron-photoelectric-sensor.html"},
    {"label": "Omron HMI", "link": "/conceptautomationtechnologies/omron-hmi.html"},
    {"label": "IFM Sensor", "link": "/conceptautomationtechnologies/ifm-sensor.html"},
    {"label": "Mitsubishi Servo Drives", "link": "/conceptautomationtechnologies/mitsubishi-servo-drives.html"},
    {"label": "Encoder", "link": "/conceptautomationtechnologies/encoder.html"},
    {"label": "Delta Hmi", "link": "/conceptautomationtechnologies/delta-hmi.html"},
    {"label": "PILZ SAFETY RELAY", "link": "/conceptautomationtechnologies/pilz-safety-relay.html"},
    {"label": "Phoenix Contact", "link": "/conceptautomationtechnologies/phoenix-contact.html"},
    {"label": "Siemens Servo Drive", "link": "/conceptautomationtechnologies/siemens-servo-drive.html"},
    {"label": "IFM Temperature Sensor", "link": "/conceptautomationtechnologies/ifm-temperature-sensor.html"},
    {"label": "Yaskawa Ac Drives", "link": "/conceptautomationtechnologies/yaskawa-ac-drives.html"},
    {"label": "Presage Vibration Sensor", "link": "/conceptautomationtechnologies/presage-vibration-sensor.html"},
    {"label": "Allen Bradley Hmi", "link": "/conceptautomationtechnologies/allen-bradley-hmi.html"},
    {"label": "Schneider Vfd", "link": "/conceptautomationtechnologies/schneider-vfd.html"},
    {"label": "Input And Output Module", "link": "/conceptautomationtechnologies/input-and-output-module.html"},
    {"label": "Inovance Vfd", "link": "/conceptautomationtechnologies/inovance-vfd.html"},
    {"label": "Siemens Servo Motors", "link": "/conceptautomationtechnologies/siemens-servo-motors.html"},
    {"label": "Siemens IPC", "link": "/conceptautomationtechnologies/siemens-ipc.html"},
    {"label": "Ethernet Switch", "link": "/conceptautomationtechnologies/ethernet-switch.html"},
    {"label": "Sensor", "link": "/conceptautomationtechnologies/sensor.html"}
]

def fetch_category(link):
    # Try mobile first
    url = f"https://m.indiamart.com{link}"
    headers = {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate'
    }
    req = urllib.request.Request(url, headers=headers)
    for attempt in range(3):
        try:
            resp = urllib.request.urlopen(req, timeout=15)
            content = resp.read()
            if resp.headers.get('Content-Encoding') == 'gzip':
                content = gzip.decompress(content)
            return content.decode('utf-8', errors='ignore')
        except urllib.error.HTTPError as e:
            if e.code == 429:
                print(f"  Attempt {attempt+1} got 429, waiting 5 seconds...")
                time.sleep(5)
            else:
                print(f"  HTTP error {e.code}")
                break
        except Exception as e:
            print(f"  Error: {e}")
            time.sleep(2)
    return ''

new_products = {}

for idx, cat in enumerate(missed_categories):
    label = cat['label']
    link = cat['link']
    print(f"[{idx+1}/{len(missed_categories)}] Fetching {label} ({link})...")
    html = fetch_category(link)
    if not html:
        print(f"  Failed to fetch {label}")
        continue
    
    # Extract mobile proddetails
    # In mobile HTML: <a href="/proddetail/...-ID.html"> ... alt="TITLE" ... src="IMG" ...
    # Or in articles
    articles = re.findall(r'<article\s+id=[\'"](\d+)[\'"]\s+class=[\'"]udg-category-item[\'"]([\s\S]*?)</article>', html)
    cards = re.findall(r'<li\s+id=[\'"](\d+)[\'"]\s+class=[\'"]cat-slider__card[\'"]([\s\S]*?)</li>', html)
    
    # Mobile product cards:
    # Pattern: /proddetail/([a-z0-9-]+-)?(\d+)\.html
    detail_blocks = re.findall(r'<a[^>]*href=[\'"](/proddetail/[^\'"]*?-?(\d+)\.html)[\'"][^>]*>([\s\S]*?)</a>', html)
    
    cat_count = 0
    # Process detail blocks from mobile
    for href, prod_id, inner in detail_blocks:
        if prod_id not in new_products:
            # find title in alt or text
            alt_m = re.search(r'alt=[\'"]([^\'"]+)[\'"]', inner)
            title = alt_m.group(1).strip() if alt_m else ''
            if not title:
                # text content
                txt = re.sub(r'<[^>]+>', ' ', inner).strip()
                if len(txt) > 3:
                    title = txt
            
            img_m = re.search(r'src=[\'"](https://\d+\.imimg\.com/[^\'"]+)[\'"]', inner)
            img = img_m.group(1) if img_m else ''
            
            if title and prod_id:
                new_products[prod_id] = {
                    'id': prod_id,
                    'title': title,
                    'image': img,
                    'category': label,
                    'detail_url': f"https://www.indiamart.com{href}"
                }
                cat_count += 1
                
    for prod_id, art_html in articles:
        if prod_id not in new_products:
            title_m = re.search(r'class=[\'"]udg-category-item__title[\'"][^>]*><a[^>]*>(.*?)</a>', art_html)
            title = title_m.group(1).strip() if title_m else ''
            img_m = re.search(r'<img[^>]+src=[\'"](https://\d+\.imimg\.com/[^\'"]+)[\'"]', art_html)
            img = img_m.group(1) if img_m else ''
            new_products[prod_id] = {
                'id': prod_id,
                'title': title,
                'image': img,
                'category': label,
                'detail_url': f"https://www.indiamart.com/proddetail/{prod_id}.html"
            }
            cat_count += 1

    print(f"  -> Extracted {cat_count} products for {label} (Total so far: {len(new_products)})")
    time.sleep(1.2)

print(f"\nDone! Extracted {len(new_products)} products from previously missed categories.")
with open('scratch/missed_categories_products.json', 'w', encoding='utf-8') as f:
    json.dump(list(new_products.values()), f, indent=2)
