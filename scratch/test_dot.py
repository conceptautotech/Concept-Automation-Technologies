import re

def normalize_for_dedup(model_str):
    if not model_str: return ''
    m = str(model_str).strip().upper()
    
    # Preserve decimals: 1.5 -> 1DOT5
    m = re.sub(r'(\d+)\.(\d+)', r'\1DOT\2', m)
    
    if m.startswith('HMIPFX'):
        m = m[3:]
    m = re.sub(r'^[-\s]*(MAKE|VFD|PLC|HMI|AC\s+DRIVES?)\s+', '', m).strip()
    m = re.sub(r'\s+AC\s+DRIVES?$', '', m).strip()
    if re.match(r'^FX3U-\d+MR/ES-A$', m):
        m = m[:-2]
    if re.match(r'^NB\d+W-TW01B-V1$', m):
        m = m[:-3]
    if m.startswith('G120 '):
        m = m[5:]
    return re.sub(r'[^A-Z0-9]', '', m)

print("1.5 kW ->", normalize_for_dedup('FC 302 1.5 kW'))
print("15 kW ->", normalize_for_dedup('FC 302 15 kW'))
print("FR-A840-1.5K ->", normalize_for_dedup('FR-A840-1.5K'))
print("FR-A840-15K ->", normalize_for_dedup('FR-A840-15K'))
