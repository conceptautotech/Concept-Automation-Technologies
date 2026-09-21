import zipfile, re, json

z = zipfile.ZipFile('Products mapping.xlsx')
shared = z.read('xl/sharedStrings.xml').decode('utf-8', errors='ignore')
sheet = z.read('xl/worksheets/sheet1.xml').decode('utf-8', errors='ignore')

texts = re.findall(r'<t[^>]*>([^<]*)</t>', shared)

rows = re.findall(r'<row\s+r="(\d+)"[^>]*>(.*?)</row>', sheet, re.DOTALL)

results = []
for rnum, rbody in rows:
    cells = {}
    for m in re.finditer(r'<c r="([A-Z]+)(\d+)"[^>]* t="s"[^>]*><v>(\d+)</v>', rbody):
        col = m.group(1)
        idx = int(m.group(3))
        cells[col] = texts[idx] if idx < len(texts) else ''
    # also grab numeric cells
    for m in re.finditer(r'<c r="([A-Z]+)(\d+)"(?! [^>]*t=)[^>]*><v>([^<]+)</v>', rbody):
        col = m.group(1)
        cells[col] = m.group(3)
    row_vals = {c: cells.get(c, '') for c in ['A','B','C','D']}
    if any(row_vals.values()):
        results.append(row_vals)

print(json.dumps(results, indent=2))
