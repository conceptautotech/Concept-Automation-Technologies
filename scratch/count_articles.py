import re

with open('scratch/mitsubishi_plc_desktop.html', 'r', encoding='utf-8', errors='ignore') as f:
    html = f.read()

articles = re.findall(r'<article\s+id=[\'"](\d+)[\'"]\s+class=[\'"]udg-category-item[\'"]', html)
print('Articles in mitsubishi_plc_desktop.html:', len(articles), len(set(articles)))

cards = re.findall(r'<li\s+id=[\'"](\d+)[\'"]\s+class=[\'"]cat-slider__card[\'"]', html)
print('Cards in slider:', len(cards), len(set(cards)))

sidebar = re.findall(r'cat-sidebar__product-link', html)
print('Sidebar links:', len(sidebar))
