import json

with open('scratch/scraped_data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

first_key = list(data.keys())[0]
print('Key:', first_key)
print(json.dumps(data[first_key], indent=2))
