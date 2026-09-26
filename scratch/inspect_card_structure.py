import re

with open('scratch/mitsubishi_plc_desktop.html', 'r', encoding='utf-8', errors='ignore') as f:
    html = f.read()

# Let's find all elements that have an id or class representing product cards
# Look for data-item, card, or product sections
product_sections = re.findall(r'<div[^>]+id=["\'](?:product|item|card|prod|p)(\d+)["\'][^>]*>', html, re.I)
print('Product div IDs:', len(product_sections), product_sections[:10])

# Look for all occurrences of #2855001676733 or similar product anchors
anchors = re.findall(r'id=["\'](\d{10,})["\']', html)
print('Numeric IDs >= 10 digits:', len(anchors), len(set(anchors)))

# Look for price tags
prices = re.findall(r'₹\s*([0-9,]+)', html)
print('Prices found:', len(prices), prices[:10])

# Look at one product card structure
# Search for 'FX5U-80MT ESS' in html
pos = html.find('FX5U-80MT ESS')
while pos != -1:
    print('\nFound FX5U-80MT ESS at pos', pos)
    print(html[pos-100:pos+300])
    pos = html.find('FX5U-80MT ESS', pos + 1)
