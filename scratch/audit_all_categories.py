import urllib.request
import gzip
import re
import json
from concurrent.futures import ThreadPoolExecutor

def fetch(url):
    req = urllib.request.Request(url, headers={
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate'
    })
    try:
        resp = urllib.request.urlopen(req, timeout=15)
        content = resp.read()
        if resp.headers.get('Content-Encoding') == 'gzip':
            content = gzip.decompress(content)
        return content.decode('utf-8', errors='ignore')
    except Exception as e:
        return ''

with open('scratch/siemens_plc.html', 'r', encoding='utf-8', errors='ignore') as f:
    html = f.read()

sub_match = re.search(r'var\s+subLinks\s*=\s*(\[.*?\]);', html, re.DOTALL)
sublinks = json.loads(sub_match.group(1))

print(f'Auditing {len(sublinks)} categories with 10 threads...')

def process_cat(item):
    label = item.get('label')
    link = item.get('link')
    full_url = f'https://www.indiamart.com{link}'
    cat_html = fetch(full_url)
    
    cnt_match = re.search(r'class=[\'"]cat-sidebar__count[\'"][^>]*>(\d+)\s+products\s+available', cat_html)
    cnt = int(cnt_match.group(1)) if cnt_match else 0
    
    articles = re.findall(r'<article\s+id=[\'"](\d+)[\'"]\s+class=[\'"]udg-category-item[\'"]', cat_html)
    details = re.findall(r'/proddetail/[^\s"\'#]+\.html', cat_html)
    
    # Also find if there are any pagination links
    # Look for page= or p= or rel="next"
    next_link = re.findall(r'href=[\'"]([^\'"]*(?:page|p=|\?p=)[^\'"]*)[\'"]', cat_html, re.I)
    
    return {
        'label': label,
        'link': link,
        'header_count': cnt,
        'articles_count': len(articles),
        'detail_count': len(set(details)),
        'articles': articles,
        'details': list(set(details)),
        'next_links': next_link
    }

with ThreadPoolExecutor(max_workers=10) as executor:
    results = list(executor.map(process_cat, sublinks))

total_header = sum(r['header_count'] for r in results)
total_articles = sum(r['articles_count'] for r in results)
all_article_ids = set()
all_detail_urls = set()
for r in results:
    all_article_ids.update(r['articles'])
    all_detail_urls.update(r['details'])

print('\n' + '='*80)
for r in sorted(results, key=lambda x: x['header_count'], reverse=True):
    print(f"{r['label']:<40} | Header: {r['header_count']:3d} | Page Articles: {r['articles_count']:3d} | Unique Details: {r['detail_count']:3d}")

print('='*80)
print(f'Total Sum of Header Counts across all categories: {total_header}')
print(f'Total Articles Rendered directly across all 51 pages: {total_articles}')
print(f'Total Unique Article IDs: {len(all_article_ids)}')
print(f'Total Unique Product Detail URLs on pages: {len(all_detail_urls)}')

with open('scratch/category_audit_results.json', 'w', encoding='utf-8') as f:
    json.dump(results, f, indent=2)
