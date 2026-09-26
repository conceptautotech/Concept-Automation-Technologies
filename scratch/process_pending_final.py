import json
import re
import openpyxl

# Load clean master products
with open('scratch/clean_master_products.json', 'r', encoding='utf-8') as f:
    master_prods = json.load(f)

# Load existing Excel models
wb = openpyxl.load_workbook('example sheet (concept automation technologies)_FILLED.xlsx')
ws = wb['Sheet1']

existing_models = set()
for r in range(2, ws.max_row + 1):
    m = ws.cell(row=r, column=4).value
    if m:
        m_str = str(m).strip()
        norm = re.sub(r'[^A-Z0-9]', '', m_str.upper())
        if norm:
            existing_models.add(norm)

def extract_model_part_number(title):
    t = title.strip()
    
    # Common prefixes to clean
    # e.g. "Mitsubishi PLC FX3S-10MR/ES" -> "FX3S-10MR/ES"
    # "Siemens PLC S7 200 SMART 6ES72881SR300AA0,CPU SR30..." -> "6ES7288-1SR30-0AA0"
    # "ABB VFD ACS560-01-206A-4 VFD, 150HP" -> "ACS560-01-206A-4"
    # "Weintek HMI MT8071iE" -> "MT8071iE"
    
    # 1. Siemens 6ES7 / 6AV / 6SL / 6ED / 6GK part numbers
    siemens_match = re.search(r'\b(6[A-Z0-9]{3}[-\s]?[0-9][A-Z0-9]{3,4}[-\s]?[0-9][A-Z0-9]{3,4})\b', t, re.I)
    if siemens_match:
        raw_siemens = siemens_match.group(1).upper().replace(' ', '')
        # Standardize 6ES72881SR300AA0 -> 6ES7288-1SR30-0AA0 if unhyphenated
        if len(raw_siemens) == 16 and '-' not in raw_siemens:
            formatted = f"{raw_siemens[:7]}-{raw_siemens[7:12]}-{raw_siemens[12:]}"
            return formatted
        return raw_siemens

    # 2. Mitsubishi FX3 / FX5 / MR- / FR- / GS / GT / Q
    mitsu_match = re.search(r'\b(FX[0-9][A-Z0-9/_-]+|MR-[A-Z0-9_-]+|FR-[A-Z0-9_-]+|GS[0-9]{4}[A-Z0-9_-]+|GT[0-9]{4}[A-Z0-9_-]+|Q[0-9]{2}[A-Z0-9_-]+)\b', t, re.I)
    if mitsu_match:
        return mitsu_match.group(1).upper()

    # 3. ABB ACS
    abb_match = re.search(r'\b(ACS[0-9]{3}[A-Z0-9/_-]+)\b', t, re.I)
    if abb_match:
        return abb_match.group(1).upper()

    # 4. Proface PFX
    proface_match = re.search(r'\b(PFX[A-Z0-9_-]+)\b', t, re.I)
    if proface_match:
        return proface_match.group(1).upper()

    # 5. Weintek cMT / MT / TK
    weintek_match = re.search(r'\b(cMT[0-9A-Z_-]+|MT[0-9]{4}[A-Z0-9_-]+|TK[0-9]{4}[A-Z0-9_-]+)\b', t, re.I)
    if weintek_match:
        return weintek_match.group(1)

    # 6. Fuji FRN / MONITOUCH
    fuji_match = re.search(r'\b(FRN[0-9A-Z/_-]+|V[0-9]{3}[A-Z0-9_-]+)\b', t, re.I)
    if fuji_match:
        return fuji_match.group(1).upper()

    # 7. Omron CP / CJ / NX / NB / NA / E2E / E3Z / E6B
    omron_match = re.search(r'\b(CP[0-9][A-Z0-9/_-]+|CJ[0-9][A-Z0-9/_-]+|NX[0-9][A-Z0-9/_-]+|NB[0-9][A-Z0-9/_-]+|NA[0-9][A-Z0-9/_-]+|E[0-9][A-Z0-9/_-]+)\b', t, re.I)
    if omron_match:
        return omron_match.group(1).upper()

    # 8. Danfoss FC
    danfoss_match = re.search(r'\b(FC[-\s]?[0-9]{2,3}[A-Z0-9/_-]*|132F[0-9A-Z_-]+)\b', t, re.I)
    if danfoss_match:
        return danfoss_match.group(1).upper().replace(' ', '-')

    # 9. Pepperl+Fuchs OBD / NBB / NBN / UB
    pf_match = re.search(r'\b(OBD[0-9A-Z/_-]+|NBB[0-9A-Z/_-]+|NBN[0-9A-Z/_-]+|UB[0-9A-Z/_-]+|ML[0-9]{3}[A-Z0-9/_-]+)\b', t, re.I)
    if pf_match:
        return pf_match.group(1).upper()

    # 10. Phoenix Contact FL SWITCH / QUINT
    phx_match = re.search(r'\b(FL\s+SWITCH\s+[0-9A-Z/_-]+|QUINT[0-9A-Z/_-]+)\b', t, re.I)
    if phx_match:
        return phx_match.group(1).upper()

    # 11. Generic code with dash/slash like ABC-123 or ABC/123
    gen_match = re.search(r'\b([A-Z0-9]{3,}[-/][A-Z0-9/_-]+)\b', t)
    if gen_match and len(gen_match.group(1)) >= 4:
        return gen_match.group(1).upper()

    # Fallback: clean title by removing Brand & Type
    cleaned = re.sub(r'^(Siemens|Mitsubishi|Omron|Allen-?Bradley|ABB|Schneider|Danfoss|Fuji|Pro-?face|Weintek|Autonics|SICK|IFM|Delta|Pilz|Phoenix\s+Contact|Yaskawa|Inovance)\s+', '', t, flags=re.I).strip()
    cleaned = re.sub(r'^(PLC|VFD|HMI|Sensor|Sensors|AC\s+Drive|Drive|Touch\s+Panel|Rotary\s+Encoder|Encoder)\s+', '', cleaned, flags=re.I).strip()
    return cleaned if cleaned else t[:30]

def detect_brand(title, cat):
    comb = f"{title} {cat}".upper()
    if any(k in comb for k in ['SIEMENS', 'SIMATIC', 'SINAMICS', '6ES7', '6AV', '6SL', 'S7-200', 'S7-1200', 'S7-1500', 'S7-300']):
        return 'Siemens'
    if any(k in comb for k in ['MITSUBISHI', 'MELSEC', 'FREQROL', 'FX3', 'FX5', 'GOT2000', 'GOT1000']):
        return 'Mitsubishi'
    if any(k in comb for k in ['OMRON', 'CP1', 'CP2', 'CJ2', 'E2E', 'E3Z', 'SYSMAC']):
        return 'Omron'
    if any(k in comb for k in ['ALLEN-BRADLEY', 'ALLEN BRADLEY', 'ROCKWELL', 'COMPACTLOGIX', 'MICRO800', '1769', '1756', '2080', 'POINT I/O']):
        return 'Allen-Bradley'
    if any(k in comb for k in ['ABB', 'ACS560', 'ACS580', 'ACS355', 'ACS880']):
        return 'ABB'
    if any(k in comb for k in ['SCHNEIDER', 'TELEMECANIQUE', 'ALTIVAR', 'ATV310', 'ATV320', 'ATV630', 'MODICON']):
        return 'Schneider'
    if any(k in comb for k in ['PRO-FACE', 'PROFACE', 'PFXGP', 'PFXET', 'SP5000']):
        return 'PROFACE'
    if any(k in comb for k in ['WEINTEK', 'EASYVIEW', 'CMT', 'MT80', 'MT81']):
        return 'Weintek'
    if any(k in comb for k in ['DANFOSS', 'VLT', 'FC 51', 'FC 302', 'FC-51', 'FC-302']):
        return 'Danfoss'
    if any(k in comb for k in ['FUJI', 'FRENIC', 'MONITOUCH', 'FRN']):
        return 'FUJI'
    if any(k in comb for k in ['PEPPERL+FUCHS', 'PEPPERL AND FUCHS', 'PEPPERL & FUCHS', 'P+F', 'OBD500', 'NBB', 'NBN']):
        return 'PEPPERL+FUCHS'
    if any(k in comb for k in ['IFM', 'EFFECTOR', 'O5S']):
        return 'IFM'
    if any(k in comb for k in ['SICK', 'GL6', 'DFS60', 'VTE18']):
        return 'SICK'
    if any(k in comb for k in ['AUTONICS', 'E50S', 'E40S', 'PR12']):
        return 'Autonics'
    if any(k in comb for k in ['DELTA', 'DVP', 'DOP', 'MS300']):
        return 'Delta'
    if any(k in comb for k in ['PILZ', 'PNOZ']):
        return 'Pilz'
    if any(k in comb for k in ['PHOENIX CONTACT', 'PHOENIX', 'FL SWITCH', 'QUINT']):
        return 'Phoenix Contact'
    if any(k in comb for k in ['YASKAWA', 'GA700', 'A1000']):
        return 'Yaskawa'
    if any(k in comb for k in ['INOVANCE', 'MD200', 'MD310']):
        return 'Inovance'
    if any(k in comb for k in ['HENGSTLER', 'RI58', 'AC58']):
        return 'Hengstler'
    if any(k in comb for k in ['HEIDENHAIN', 'ERN', 'ECN']):
        return 'Heidenhain'
    if any(k in comb for k in ['BAUMER', 'EIL580']):
        return 'Baumer'
    if any(k in comb for k in ['KUEBLER', 'KUBLER', 'SENDIX']):
        return 'Kuebler'
    if any(k in comb for k in ['TAMAGAWA', 'TS26']):
        return 'Tamagawa'
    return 'Industrial Automation'

def detect_type(title, cat):
    comb = f"{title} {cat}".upper()
    if 'PHOTOELECTRIC' in comb: return 'PHOTOELECTRIC SENSORS'
    if 'ENCODER' in comb: return 'Encoder'
    if any(k in comb for k in ['PROXIMITY', 'SENSOR', 'ULTRASONIC', 'TEMPERATURE', 'VIBRATION']): return 'SENSORS'
    if any(k in comb for k in ['SERVO DRIVE']): return 'Servo Drive'
    if any(k in comb for k in ['SERVO MOTOR']): return 'SERVO MOTOR'
    if any(k in comb for k in ['VFD', 'AC DRIVE', 'INVERTER', 'VARIABLE FREQUENCY']): return 'VFD'
    if any(k in comb for k in ['HMI', 'TOUCH PANEL', 'TOUCH SCREEN', 'DISPLAY', 'OPERATOR PANEL']): return 'HMI'
    if any(k in comb for k in ['PLC', 'PROGRAMMABLE CONTROLLER', 'CPU', 'MODULE', 'INPUT', 'OUTPUT', 'IO-LINK', 'BASE UNIT']): return 'PLC'
    if any(k in comb for k in ['ETHERNET SWITCH', 'SCALANCE', 'SWITCH']): return 'ETHERNET SWITCH'
    return 'PLC'

def detect_series(title, brand):
    t = title.upper()
    # Mitsubishi
    if 'FX5U' in t or 'MELSEC IQ-F' in t: return 'MELSEC iQ-F'
    if 'FX3U' in t: return 'FX3U'
    if 'FX3G' in t: return 'FX3G'
    if 'FX3S' in t: return 'FX3S'
    if 'GOT2000' in t or 'GS21' in t: return 'GOT2000'
    if 'FR-A800' in t or 'A800' in t: return 'FR-A800'
    if 'FR-D700' in t or 'D700' in t: return 'FR-D700'
    if 'FR-E700' in t or 'E700' in t: return 'FR-E700'
    if 'MR-J4' in t: return 'MELSERVO-J4'
    if 'MR-JE' in t: return 'MELSERVO-JE'
    
    # Siemens
    if 'S7-200 SMART' in t or 'SMART' in t: return 'S7-200 SMART'
    if 'S7-1200' in t: return 'S7-1200'
    if 'S7-1500' in t: return 'S7-1500'
    if 'S7-300' in t: return 'S7-300'
    if 'S7-400' in t: return 'S7-400'
    if 'LOGO' in t: return 'LOGO!'
    if 'ET 200' in t or 'ET200' in t: return 'ET 200'
    if 'COMFORT' in t: return 'Comfort Panel'
    if 'BASIC' in t or 'KTP' in t: return 'Basic Panel'
    if 'V20' in t: return 'SINAMICS V20'
    if 'G120' in t: return 'SINAMICS G120'
    if 'V90' in t: return 'SINAMICS V90'
    if 'SCALANCE' in t: return 'SCALANCE'
    
    # Omron
    if 'CP2E' in t: return 'CP2E'
    if 'CP1E' in t: return 'CP1E'
    if 'CP1L' in t: return 'CP1L'
    if 'CP1H' in t: return 'CP1H'
    if 'CJ2M' in t: return 'CJ2M'
    if 'NB' in t and any(k in t for k in ['NB3', 'NB5', 'NB7', 'NB10']): return 'NB'
    if 'NA5' in t: return 'NA5'
    
    # ABB
    if 'ACS560' in t: return 'ACS560'
    if 'ACS580' in t: return 'ACS580'
    if 'ACS355' in t: return 'ACS355'
    if 'ACS880' in t: return 'ACS880'
    
    # Danfoss
    if 'FC 51' in t or 'FC-51' in t or 'FC51' in t or 'MICRO DRIVE' in t: return 'VLT Micro Drive FC 51'
    if 'FC 302' in t or 'FC-302' in t or 'FC302' in t: return 'VLT AutomationDrive FC 302'
    
    # Schneider
    if 'ATV310' in t: return 'ATV310'
    if 'ATV320' in t: return 'ATV320'
    if 'ATV630' in t: return 'ATV630'
    
    # Weintek
    if 'CMT' in t: return 'cMT'
    if any(k in t for k in ['MT80', 'MT81', 'MT61']): return 'iE & iP Series'
    
    # Fuji
    if 'MINI' in t or 'C2' in t: return 'FRENIC-Mini (C2)'
    if 'ACE' in t: return 'FRENIC-Ace'
    if 'MEGA' in t: return 'FRENIC-MEGA'
    
    # Proface
    if 'GP4000' in t or 'PFXGP4' in t: return 'GP4000'
    if 'ET6000' in t or 'PFXET6' in t: return 'ET6000'
    if 'SP5000' in t or 'PFXSP' in t: return 'SP5000'
    
    # Phoenix
    if 'FL SWITCH' in t: return 'FL SWITCH'
    if 'QUINT' in t: return 'QUINT POWER'
    
    return ''

pending_list = []
seen_pending_models = set()

for pid, p in master_prods.items():
    title = p.get('title', '')
    cat = p.get('category', '')
    img = p.get('image', '')
    
    brand = detect_brand(title, cat)
    ptype = detect_type(title, cat)
    series = detect_series(title, brand)
    model = extract_model_part_number(title)
    
    # Clean image link
    img_link = img or f"https://www.indiamart.com/proddetail/{pid}.html"
    if 'imimg.com' in img_link:
        img_link = re.sub(r'-\d+x\d+\.', '-1000x1000.', img_link)
        
    norm_m = re.sub(r'[^A-Z0-9]', '', model.upper())
    norm_t = re.sub(r'[^A-Z0-9]', '', title.upper())
    
    # Check if exists in Excel or already in pending
    already_exists = False
    if norm_m in existing_models or norm_m in seen_pending_models:
        already_exists = True
    else:
        for em in existing_models:
            if len(em) >= 6 and (em == norm_m or em in norm_t):
                already_exists = True
                break
                
    if not already_exists and len(norm_m) >= 3:
        seen_pending_models.add(norm_m)
        pending_list.append({
            'brand': brand,
            'type': ptype,
            'series': series,
            'model': model,
            'image_link': img_link,
            'raw_title': title,
            'id': pid
        })

print(f"Total Unique Pending Products Identified: {len(pending_list)}")
print(f"\nBreakdown by Brand:")
from collections import Counter
b_cnt = Counter(x['brand'] for x in pending_list)
for b, c in b_cnt.most_common():
    print(f"  {b}: {c}")

print(f"\nBreakdown by Type:")
t_cnt = Counter(x['type'] for x in pending_list)
for t, c in t_cnt.most_common():
    print(f"  {t}: {c}")

with open('scratch/final_pending_products.json', 'w', encoding='utf-8') as f:
    json.dump(pending_list, f, indent=2)
