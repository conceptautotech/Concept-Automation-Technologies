import json
import re

with open('scratch/verified_pending_products.json', 'r', encoding='utf-8') as f:
    items = json.load(f)

def refine_model(model, raw_title):
    m = model.strip()
    
    # 1. Clean ABB models: ACS560-01-025A-4
    abb_m = re.search(r'\b(ACS[0-9]{3}[-\s]?[0-9]{2}[-\s]?[0-9A-Z]{3,5}[-\s]?[0-9A-Z]*)\b', raw_title, re.I)
    if abb_m:
        raw_abb = abb_m.group(1).upper()
        # normalize spaces/dots to hyphens: ACS560-01-073A 4 -> ACS560-01-073A-4
        cleaned_abb = re.sub(r'[\s\.]+', '-', raw_abb).strip('-')
        return cleaned_abb

    # 2. Clean Siemens models: 6ES7..., 6AV..., 6SL..., 6ED..., 6GK...
    siemens_m = re.search(r'\b(6[A-Z0-9]{2,3}[-\s]?[0-9A-Z]{4,5}[-\s]?[0-9A-Z]{3,5})\b', raw_title, re.I)
    if siemens_m:
        raw_siemens = siemens_m.group(1).upper().replace(' ', '')
        if len(raw_siemens) == 16 and '-' not in raw_siemens:
            return f"{raw_siemens[:7]}-{raw_siemens[7:12]}-{raw_siemens[12:]}"
        return raw_siemens

    # 3. Clean Mitsubishi models: FX3S-10MR/ES, FX3U-48MT/ESS, FX5U-80MT/ESS, etc.
    mitsu_m = re.search(r'\b(FX[0-9][A-Z0-9/_-]+|MR-[A-Z0-9_-]+|FR-[A-Z0-9_-]+|GS[0-9]{4}[A-Z0-9_-]+|GT[0-9]{4}[A-Z0-9_-]+)\b', raw_title, re.I)
    if mitsu_m:
        return mitsu_m.group(1).upper()

    # 4. Clean Allen-Bradley: 1769-L33ER, 1756-EN2T, 2080-LC50-24QBB
    ab_m = re.search(r'\b(17[0-9]{2}-[-A-Z0-9_/]+|2080-[-A-Z0-9_/]+|2711[-A-Z0-9_/]+|25[A-Z]-[-A-Z0-9_/]+|5069-[-A-Z0-9_/]+)\b', raw_title, re.I)
    if ab_m:
        return ab_m.group(1).upper()

    # 5. Clean Weintek: cMT2078X, MT8071iE, MT8102iP, TK8071iP
    weintek_m = re.search(r'\b(cMT[-0-9A-Z_]+|MT[0-9]{4}[-A-Z0-9_]+|TK[0-9]{4}[-A-Z0-9_]+)\b', raw_title, re.I)
    if weintek_m:
        return weintek_m.group(1)

    # 6. Clean Fuji: FRN...
    fuji_m = re.search(r'\b(FRN[-0-9A-Z_/]+|V[0-9]{3}[-A-Z0-9_]+)\b', raw_title, re.I)
    if fuji_m:
        return fuji_m.group(1).upper()

    # 7. Clean Proface: PFX...
    proface_m = re.search(r'\b(PFX[-A-Z0-9_]+)\b', raw_title, re.I)
    if proface_m:
        return proface_m.group(1).upper()

    # 8. Clean Pepperl+Fuchs: OBD..., NBB..., NBN..., UB..., ML...
    pf_m = re.search(r'\b(OBD[-A-Z0-9_/]+|NBB[-A-Z0-9_/]+|NBN[-A-Z0-9_/]+|UB[-A-Z0-9_/]+|ML[0-9]{3}[-A-Z0-9_/]+|ENI58[-A-Z0-9_/]+)\b', raw_title, re.I)
    if pf_m:
        return pf_m.group(1).upper()

    # 9. Clean Danfoss: FC-51, FC-302, 132F0022
    danfoss_132 = re.search(r'\b(132F\s*[0-9]{4})\b', raw_title, re.I)
    if danfoss_132:
        return danfoss_132.group(1).upper().replace(' ', '')
    danfoss_m = re.search(r'\b(FC[-\s]?[0-9]{2,3}[-A-Z0-9_/]*)\b', raw_title, re.I)
    if danfoss_m:
        return danfoss_m.group(1).upper().replace(' ', '-')

    # 10. Clean Phoenix Contact: FL SWITCH 2314-2SFP
    phx_m = re.search(r'\b(FL\s+SWITCH\s+[-0-9A-Z_/]+|QUINT[-0-9A-Z_/]+)\b', raw_title, re.I)
    if phx_m:
        return phx_m.group(1).upper()

    # Strip prefixes like "VFD", "PLC", "MAKE", "440V", "ABB", "SIEMENS"
    m = re.sub(r'^(MAKE|VFD|PLC|HMI|ABB|SIEMENS|MITSUBISHI|OMRON|FUJI|DANFOSS|PROFACE|WEINTEK)\s+', '', m, flags=re.I).strip()
    m = re.sub(r'[\.,\s]+(VFD|PLC|HMI|ABB|3\s*-\s*Phase.*|3\s*Phase.*|\d+KW.*|\d+HP.*)$', '', m, flags=re.I).strip()
    m = re.sub(r'^\d+v\s+', '', m, flags=re.I).strip()
    
    return m

refined_items = []
invalid_models = {'100-120/200-', 'GENERAL SPECIFICATIONS', 'TECHNICAL DATA', 'ON REQUEST'}

for it in items:
    m = refine_model(it['model'], it['raw_title'])
    if m.upper() in invalid_models or len(m) < 3 or re.match(r'^\d+DI/\d+DO$', m) or re.match(r'^\d+-\d+/\d+-$', m):
        continue
    it['model'] = m
    refined_items.append(it)

print(f"Total Refined Pending Items: {len(refined_items)}")
refined_items.sort(key=lambda x: (x['brand'], x['type'], x['model']))

with open('scratch/refined_pending_products.json', 'w', encoding='utf-8') as f:
    json.dump(refined_items, f, indent=2)

print("\nSample 30 perfectly refined models:")
for it in refined_items[:30]:
    print(f"  {it['brand']:<15} | {it['type']:<15} | {it['series']:<20} | {it['model']}")
