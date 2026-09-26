import re
import json

with open('scratch/master_indiamart_all.json', 'r', encoding='utf-8') as f:
    master = json.load(f)

print(f"Current master products count: {len(master)}")

with open('scratch/products_and_services.html', 'r', encoding='utf-8', errors='ignore') as f:
    content = f.read()

details = re.findall(r'/proddetail/[^\s"\'#]+-?(\d{8,})\.html', content)
print(f"Products in local products_and_services.html: {len(set(details))}")
new_from_pas = [d for d in set(details) if d not in master]
print(f"New from local products_and_services.html: {len(new_from_pas)}")

with open('scratch/m_products_and_services.html', 'r', encoding='utf-8', errors='ignore') as f:
    m_content = f.read()

m_details = re.findall(r'/proddetail/[^\s"\'#]+-?(\d{8,})\.html', m_content)
print(f"Products in local m_products_and_services.html: {len(set(m_details))}")
new_from_m = [d for d in set(m_details) if d not in master]
print(f"New from local m_products_and_services.html: {len(new_from_m)}")
