import json
import re
import openpyxl

# 1. Load Excel models to ensure no duplicates
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

print(f"Existing models in Excel: {len(existing_models)}")

# 2. Load all scraped products
with open('scratch/grand_master_indiamart_products.json', 'r', encoding='utf-8') as f:
    master_prods = json.load(f)

# Also load scraped_data.json to get rich specs
scraped_specs = {}
if 'scratch/scraped_data.json':
    try:
        with open('scratch/scraped_data.json', 'r', encoding='utf-8') as f:
            sd = json.load(f)
            for k, v in sd.items():
                clean_k = k.replace('im-', '')
                specs_dict = {s['label']: s['value'] for s in v.get('specifications', []) if 'label' in s and 'value' in s}
                scraped_specs[clean_k] = specs_dict
    except Exception as e:
        print("Error loading scraped_data:", e)

def detect_brand(title, cat='', specs={}):
    combined = f"{title} {cat} {specs.get('Brand', '')}".upper()
    if 'SIEMENS' in combined or 'SIMATIC' in combined or 'SINAMICS' in combined or 'S7-200' in combined or 'S7-1200' in combined or 'S7-300' in combined or '6ES7' in combined:
        return 'Siemens'
    if 'MITSUBISHI' in combined or 'MELSEC' in combined or 'FREQROL' in combined or 'FX3' in combined or 'FX5' in combined or 'GOT2000' in combined or 'GOT1000' in combined:
        return 'Mitsubishi'
    if 'OMRON' in combined or 'CP1' in combined or 'CP2' in combined or 'CJ2' in combined or 'E2E' in combined or 'E3Z' in combined:
        return 'Omron'
    if 'ALLEN BRADLEY' in combined or 'ALLEN-BRADLEY' in combined or 'ROCKWELL' in combined or 'MICRO800' in combined or 'MICROLOGIX' in combined or 'COMPACTLOGIX' in combined or 'POINT I/O' in combined or '1769' in combined or '1756' in combined or '1734' in combined or '2080' in combined:
        return 'Allen-Bradley'
    if 'ABB' in combined or 'ACS560' in combined or 'ACS580' in combined or 'ACS355' in combined or 'ACS880' in combined:
        return 'ABB'
    if 'SCHNEIDER' in combined or 'TELEMECANIQUE' in combined or 'ALTIVAR' in combined or 'ATV' in combined or 'MODICON' in combined or 'TM221' in combined:
        return 'Schneider'
    if 'PROFACE' in combined or 'PRO-FACE' in combined or 'PFXGP' in combined or 'PFXET' in combined:
        return 'Pro-face'
    if 'WEINTEK' in combined or 'EASYVIEW' in combined or 'CMT' in combined or 'MT8' in combined or 'MT6' in combined:
        return 'Weintek'
    if 'DANFOSS' in combined or 'VLT' in combined or 'FC51' in combined or 'FC302' in combined or '132F' in combined:
        return 'Danfoss'
    if 'FUJI' in combined or 'FRENIC' in combined or 'MONITOUCH' in combined or 'FRN' in combined:
        return 'Fuji'
    if 'PEPPERL' in combined or 'P+F' in combined or 'NBB' in combined or 'NBN' in combined or 'OBD' in combined or 'UB' in combined:
        return 'Pepperl+Fuchs'
    if 'IFM' in combined or 'EFFECTOR' in combined or 'AL1' in combined or 'TN2' in combined:
        return 'IFM'
    if 'SICK' in combined or 'GL6' in combined or 'W12' in combined or 'DFS60' in combined or 'VTE18' in combined:
        return 'SICK'
    if 'AUTONICS' in combined or 'PR12' in combined or 'PR18' in combined or 'E50S' in combined or 'E40S' in combined:
        return 'Autonics'
    if 'DELTA' in combined or 'DVP' in combined or 'DOP' in combined or 'MS300' in combined:
        return 'Delta'
    if 'PILZ' in combined or 'PNOZ' in combined:
        return 'Pilz'
    if 'PHOENIX' in combined or 'FL SWITCH' in combined or 'QUINT' in combined:
        return 'Phoenix Contact'
    if 'YASKAWA' in combined or 'GA700' in combined or 'A1000' in combined:
        return 'Yaskawa'
    if 'INOVANCE' in combined or 'MD200' in combined or 'MD310' in combined or 'MD500' in combined:
        return 'Inovance'
    if 'HENGSTLER' in combined or 'RI58' in combined or 'AC58' in combined:
        return 'Hengstler'
    if 'HEIDENHAIN' in combined or 'ERN' in combined or 'ECN' in combined:
        return 'Heidenhain'
    if 'BAUMER' in combined or 'EIL580' in combined:
        return 'Baumer'
    if 'KUEBLER' in combined or 'KUBLER' in combined or 'SENDIX' in combined:
        return 'Kuebler'
    if 'TAMAGAWA' in combined or 'TS26' in combined:
        return 'Tamagawa'
    return specs.get('Brand', 'Industrial Automation')

def detect_type(title, cat='', specs={}):
    combined = f"{title} {cat} {specs.get('Type', '')}".upper()
    if 'PLC' in combined or 'PROGRAMMABLE CONTROLLER' in combined or 'CPU' in combined or 'BASE UNIT' in combined or 'PROCESSOR' in combined:
        return 'PLC'
    if 'HMI' in combined or 'TOUCH SCREEN' in combined or 'TOUCH PANEL' in combined or 'DISPLAY' in combined or 'OPERATOR PANEL' in combined:
        return 'HMI'
    if 'VFD' in combined or 'DRIVE' in combined or 'INVERTER' in combined or 'AC DRIVE' in combined:
        if 'SERVO' in combined:
            return 'Servo Drive'
        return 'VFD'
    if 'SERVO MOTOR' in combined:
        return 'SERVO MOTOR'
    if 'SERVO DRIVE' in combined:
        return 'Servo Drive'
    if 'PHOTOELECTRIC' in combined or 'OPTICAL' in combined:
        return 'PHOTOELECTRIC SENSORS'
    if 'ENCODER' in combined:
        return 'Encoder'
    if 'SENSOR' in combined or 'PROXIMITY' in combined or 'ULTRASONIC' in combined or 'TEMPERATURE' in combined or 'VIBRATION' in combined:
        return 'SENSORS'
    if 'SWITCH' in combined or 'ETHERNET' in combined or 'SCALANCE' in combined:
        return 'ETHERNET SWITCH'
    if 'MODULE' in combined or 'INPUT' in combined or 'OUTPUT' in combined or 'IO-LINK' in combined:
        return 'PLC'
    if 'SAFETY RELAY' in combined or 'RELAY' in combined:
        return 'SAFETY RELAY'
    return 'PLC'

def detect_series(title, brand='', specs={}):
    t = title.upper()
    # Check specs first
    if specs.get('Series'):
        return specs['Series']
    if specs.get('Manufacturer Series'):
        return specs['Manufacturer Series']
        
    # Mitsubishi
    if 'MELSEC IQ-F' in t or 'FX5U' in t or 'FX5UJ' in t: return 'MELSEC iQ-F'
    if 'FX3U' in t: return 'FX3U'
    if 'FX3G' in t: return 'FX3G'
    if 'FX3S' in t: return 'FX3S'
    if 'FX2N' in t: return 'FX2N'
    if 'FX1N' in t: return 'FX1N'
    if 'GOT2000' in t or 'GS21' in t or 'GT2' in t: return 'GOT2000'
    if 'GOT1000' in t: return 'GOT1000'
    if 'A800' in t or 'FR-A800' in t: return 'FR-A800'
    if 'D700' in t or 'FR-D700' in t: return 'FR-D700'
    if 'E700' in t or 'FR-E700' in t: return 'FR-E700'
    if 'F800' in t or 'FR-F800' in t: return 'FR-F800'
    if 'MR-J4' in t: return 'MELSERVO-J4'
    if 'MR-JE' in t: return 'MELSERVO-JE'
    
    # Siemens
    if 'S7-200 SMART' in t or 'SMART' in t: return 'S7-200 SMART'
    if 'S7-1200' in t: return 'SIMATIC S7-1200'
    if 'S7-1500' in t: return 'SIMATIC S7-1500'
    if 'S7-300' in t: return 'SIMATIC S7-300'
    if 'S7-400' in t: return 'SIMATIC S7-400'
    if 'LOGO' in t: return 'LOGO!'
    if 'ET 200' in t or 'ET200' in t: return 'ET 200'
    if 'COMFORT' in t: return 'Comfort Panel'
    if 'SMART LINE' in t: return 'Smart Line'
    if 'KTP' in t: return 'Basic Panel'
    if 'V20' in t or 'SINAMICS V20' in t: return 'SINAMICS V20'
    if 'G120' in t or 'SINAMICS G120' in t: return 'SINAMICS G120'
    if 'V90' in t or 'SINAMICS V90' in t: return 'SINAMICS V90'
    if 'SCALANCE' in t: return 'SCALANCE'
    
    # Omron
    if 'CP2E' in t: return 'CP2E'
    if 'CP1E' in t: return 'CP1E'
    if 'CP1L' in t: return 'CP1L'
    if 'CP1H' in t: return 'CP1H'
    if 'CJ2M' in t: return 'CJ2M'
    if 'NX1P' in t: return 'NX1P2'
    if 'NB' in t and ('NB3' in t or 'NB5' in t or 'NB7' in t or 'NB10' in t): return 'NB'
    if 'NA5' in t: return 'NA5'
    
    # Allen Bradley
    if 'COMPACTLOGIX' in t or '1769' in t: return 'CompactLogix'
    if 'CONTROLLOGIX' in t or '1756' in t: return 'ControlLogix'
    if 'MICROLOGIX' in t: return 'MicroLogix'
    if 'MICRO800' in t or 'MICRO850' in t or '2080' in t: return 'Micro800'
    if 'POWERFLEX' in t: return 'PowerFlex'
    if 'PANELVIEW' in t: return 'PanelView'
    
    # Proface
    if 'GP4000' in t or 'PFXGP4' in t: return 'GP4000'
    if 'ET6000' in t or 'PFXET6' in t: return 'ET6000'
    if 'SP5000' in t or 'PFXSP' in t: return 'SP5000'
    
    # ABB
    if 'ACS560' in t: return 'ACS560'
    if 'ACS580' in t: return 'ACS580'
    if 'ACS355' in t: return 'ACS355'
    if 'ACS880' in t: return 'ACS880'
    
    # Danfoss
    if 'FC 51' in t or 'FC-51' in t or 'FC51' in t or 'MICRO DRIVE' in t: return 'VLT Micro Drive FC 51'
    if 'FC 302' in t or 'FC-302' in t or 'FC302' in t: return 'VLT AutomationDrive FC 302'
    if 'FC 280' in t: return 'VLT Midi Drive FC 280'
    
    # Weintek
    if 'CMT' in t: return 'cMT'
    if 'MT8071' in t or 'MT8102' in t or 'MT80' in t or 'MT81' in t: return 'iE Series'
    
    # Fuji
    if 'ACE' in t or 'FRN' in t: return 'FRENIC-Ace'
    if 'MINI' in t: return 'FRENIC-Mini'
    if 'MEGA' in t: return 'FRENIC-MEGA'
    if 'MONITOUCH' in t or 'V9' in t: return 'MONITOUCH V9'
    
    return ''

def extract_model(title, specs={}):
    # 1. Check specs
    if specs.get('Model Name/Number'):
        m = specs['Model Name/Number'].strip()
        # Clean prefix if repeated like "Pepperl and Fuchs OBD500..."
        m = re.sub(r'^(Pepperl\s+and\s+Fuchs|Siemens|Mitsubishi|Omron|Allen\s+Bradley|ABB|Schneider|Danfoss|Fuji|Proface|Weintek)\s+', '', m, flags=re.I).strip()
        if len(m) >= 3:
            return m
    if specs.get('Model'):
        m = specs['Model'].strip()
        m = re.sub(r'^(Pepperl\s+and\s+Fuchs|Siemens|Mitsubishi|Omron|Allen\s+Bradley|ABB|Schneider|Danfoss|Fuji|Proface|Weintek)\s+', '', m, flags=re.I).strip()
        if len(m) >= 3:
            return m

    t = title
    # Remove leading Brand name
    t = re.sub(r'^(Pepperl\s+and\s+Fuchs|Siemens|Mitsubishi|Omron|Allen\s+Bradley|ABB|Schneider|Danfoss|Fuji|Pro-?face|Weintek|Autonics|SICK|IFM|Delta|Pilz|Phoenix\s+Contact|Yaskawa|Inovance)\s+', '', t, flags=re.I).strip()
    # Remove "PLC", "VFD", "HMI", "Sensor", "AC Drive", "Drive", "Touch Panel" from start
    t = re.sub(r'^(PLC|VFD|HMI|Sensor|Sensors|AC\s+Drive|Drive|Touch\s+Panel|Rotary\s+Encoder|Encoder)\s+', '', t, flags=re.I).strip()
    
    # Match part number pattern
    # Siemens part number: 6ES7... or 6GK... or 6SL... or 6ED...
    siemens_m = re.search(r'\b(6[A-Z0-9]{3}[0-9][A-Z0-9-]{6,16})\b', t)
    if siemens_m:
        return siemens_m.group(1).upper()
        
    # Mitsubishi part number: FX..., MR-..., FR-..., Q..., A..., GT..., GS...
    mitsu_m = re.search(r'\b(FX\d[A-Z0-9/_-]+|MR-[A-Z0-9_-]+|FR-[A-Z0-9_-]+|GS\d{4}[A-Z0-9_-]+|GT\d{4}[A-Z0-9_-]+)\b', t)
    if mitsu_m:
        return mitsu_m.group(1).upper()

    # Proface: PFX...
    proface_m = re.search(r'\b(PFX[A-Z0-9_-]+)\b', t)
    if proface_m:
        return proface_m.group(1).upper()

    # Omron: CP..., CJ..., NX..., NB..., NA..., E2E..., E3Z..., E6B...
    omron_m = re.search(r'\b(CP[0-9][A-Z0-9_-]+|CJ\d[A-Z0-9_-]+|NX\d[A-Z0-9_-]+|NB\d+[A-Z0-9_-]+|NA\d+[A-Z0-9_-]+|E\d[A-Z0-9_-]+)\b', t)
    if omron_m:
        return omron_m.group(1).upper()

    # ABB: ACS...
    abb_m = re.search(r'\b(ACS[0-9]{3}[A-Z0-9/_-]+)\b', t)
    if abb_m:
        return abb_m.group(1).upper()
        
    # General alphanumeric model code with dash/slash
    general_m = re.search(r'\b([A-Z0-9]{2,}[-/][A-Z0-9/_-]+)\b', t)
    if general_m and len(general_m.group(1)) >= 4:
        return general_m.group(1).upper()

    # Fallback to cleaned title (first 30 chars or whole cleaned string)
    cleaned = re.sub(r'^(Trader|Wholesaler|Distributor|Concept\s+Automation)\b.*', '', t, flags=re.I).strip()
    return cleaned if cleaned else t[:30]

print("Model extraction functions compiled successfully.")
