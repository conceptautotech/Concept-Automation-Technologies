import re

blacklist = {
    '18DI/12DO', '24DI/16DO', '14DI/10DO', '8DI/6DO', '12DI/8DO', '16DI/16DO', '32DI/32DO',
    'AC/DC/RELAY', 'DC/DC/DC', 'DC/DC/RELAY', 'AC/DC/TRANSISTOR',
    '100-240VAC', '24VDC', '220VAC', '440VAC', '380-480V', '200-240V',
    '150HP', '100HP', '50HP', '10HP', '5HP', '15KW', '11KW', '7.5KW', '5.5KW', '4KW', '2.2KW', '1.5KW', '0.75KW', '0.37KW'
}

def clean_siemens_part_number(s):
    # s is like 6ES72881SR300AA0 -> 6ES7288-1SR30-0AA0
    s = s.upper().replace(' ', '')
    if len(s) == 16 and '-' not in s:
        return f"{s[:7]}-{s[7:12]}-{s[12:]}"
    elif len(s) == 18 and '-' not in s:
        return f"{s[:7]}-{s[7:13]}-{s[13:]}"
    return s

def extract_model_part_number(title, specs={}):
    # 1. First check specs
    if specs.get('Model Name/Number'):
        m = specs['Model Name/Number'].strip()
        m = re.sub(r'^(Pepperl\s+and\s+Fuchs|Siemens|Mitsubishi|Omron|Allen\s+Bradley|ABB|Schneider|Danfoss|Fuji|Proface|Weintek)\s+', '', m, flags=re.I).strip()
        if len(m) >= 3 and m.upper() not in blacklist and not re.match(r'^\d+DI/\d+DO$', m, re.I):
            return m

    t = title.strip()
    
    # Check Siemens part numbers (hyphenated or unhyphenated)
    # Examples: 6ES7288-1SR30-0AA0, 6ES72881SR300AA0, 6AV2124-0MC01-0AX0, 6SL3210-1KE11-8UB1, 6ED1052-1MD00-0BA8
    siemens_m = re.search(r'\b(6[A-Z0-9]{2,3}[-\s]?[0-9A-Z]{4,5}[-\s]?[0-9A-Z]{3,5})\b', t, re.I)
    if siemens_m:
        val = clean_siemens_part_number(siemens_m.group(1))
        if val not in blacklist:
            return val
            
    siemens_unhyphenated = re.search(r'\b(6[A-Z0-9]{13,17})\b', t, re.I)
    if siemens_unhyphenated:
        return clean_siemens_part_number(siemens_unhyphenated.group(1))

    # Mitsubishi: FX3S-10MR/ES, FX5U-80MT/ESS, MR-JE-100A, FR-A840-00126-E2-60, GS2107-WTBD
    mitsu_m = re.search(r'\b(FX[0-9][A-Z0-9/_-]+|MR-[A-Z0-9_-]+|FR-[A-Z0-9_-]+|GS[0-9]{4}[A-Z0-9_-]+|GT[0-9]{4}[A-Z0-9_-]+|Q[0-9]{2}[A-Z0-9_-]+)\b', t, re.I)
    if mitsu_m:
        val = mitsu_m.group(1).upper()
        if val not in blacklist and not re.match(r'^\d+DI/\d+DO$', val, re.I):
            return val

    # ABB: ACS560-01-206A-4, ACS580-01-018A-4, ACS355-03E-08A8-4
    abb_m = re.search(r'\b(ACS[0-9]{3}[A-Z0-9/_-]+)\b', t, re.I)
    if abb_m:
        return abb_m.group(1).upper()

    # Proface: PFXGP4601TAD, PFXET6400WAD
    proface_m = re.search(r'\b(PFX[A-Z0-9_-]+)\b', t, re.I)
    if proface_m:
        return proface_m.group(1).upper()

    # Weintek: cMT2078X, MT8071iE, MT8102iP, TK8071iP
    weintek_m = re.search(r'\b(cMT[0-9A-Z_-]+|MT[0-9]{4}[A-Z0-9_-]+|TK[0-9]{4}[A-Z0-9_-]+)\b', t, re.I)
    if weintek_m:
        return weintek_m.group(1)

    # Fuji: FRN0001C2S-6U, V9100iS
    fuji_m = re.search(r'\b(FRN[0-9A-Z/_-]+|V[0-9]{3}[A-Z0-9_-]+)\b', t, re.I)
    if fuji_m:
        return fuji_m.group(1).upper()

    # Omron: CP2E-N14DR-A, CP1E-E20SDR-A, CJ2M-CPU31, NB7W-TW01B, E2E-X10MF1, E3Z-D61
    omron_m = re.search(r'\b(CP[0-9][A-Z0-9/_-]+|CJ[0-9][A-Z0-9/_-]+|NX[0-9][A-Z0-9/_-]+|NB[0-9]+[A-Z0-9/_-]+|NA[0-9]+[A-Z0-9/_-]+|E[0-9][A-Z0-9/_-]+)\b', t, re.I)
    if omron_m:
        val = omron_m.group(1).upper()
        if val not in blacklist:
            return val

    # Danfoss: FC-051P1K5T4E20H3BXCXXXSXXX, FC-51, FC-302, 132F0022
    danfoss_m = re.search(r'\b(FC[-\s]?[0-9]{2,3}[A-Z0-9/_-]*|132F[0-9A-Z_-]+)\b', t, re.I)
    if danfoss_m:
        return danfoss_m.group(1).upper().replace(' ', '-')

    # Pepperl+Fuchs: OBD500-18GM60-E5-IR-1C, NBB2-8GM40-E2-V3, UB1000-18GM75-I-V15
    pf_m = re.search(r'\b(OBD[0-9A-Z/_-]+|NBB[0-9A-Z/_-]+|NBN[0-9A-Z/_-]+|UB[0-9A-Z/_-]+|ML[0-9]{3}[A-Z0-9/_-]+|ENI58[A-Z0-9/_-]+)\b', t, re.I)
    if pf_m:
        return pf_m.group(1).upper()

    # Phoenix Contact: FL SWITCH 2314-2SFP, QUINT4-PS/1AC/24DC/20
    phx_m = re.search(r'\b(FL\s+SWITCH\s+[0-9A-Z/_-]+|QUINT[0-9A-Z/_-]+)\b', t, re.I)
    if phx_m:
        return phx_m.group(1).upper()

    # Allen-Bradley: 1769-L33ER, 1756-L73, 2080-LC50-24QBB, 2711P-T10C22D9P, 25B-D010N104
    ab_m = re.search(r'\b(17[0-9]{2}-[A-Z0-9/_-]+|2080-[A-Z0-9/_-]+|2711[A-Z0-9/_-]+|25[A-Z]-[A-Z0-9/_-]+|5069-[A-Z0-9/_-]+)\b', t, re.I)
    if ab_m:
        return ab_m.group(1).upper()

    # Schneider: ATV310HD11N4E, TM221CE40T
    sch_m = re.search(r'\b(ATV[0-9]{3}[A-Z0-9/_-]+|TM[0-9]{3}[A-Z0-9/_-]+)\b', t, re.I)
    if sch_m:
        return sch_m.group(1).upper()

    # Generic code with dash/slash
    gen_m = re.findall(r'\b([A-Z0-9]{3,}[-/][A-Z0-9/_-]+)\b', t)
    for g in gen_m:
        g_up = g.upper()
        if g_up not in blacklist and not re.match(r'^\d+DI/\d+DO$', g_up, re.I) and not re.match(r'^\d+VDC$', g_up, re.I):
            return g_up

    # Clean title
    cleaned = re.sub(r'^(Siemens|Mitsubishi|Omron|Allen-?Bradley|ABB|Schneider|Danfoss|Fuji|Pro-?face|Weintek|Autonics|SICK|IFM|Delta|Pilz|Phoenix\s+Contact|Yaskawa|Inovance)\s+', '', t, flags=re.I).strip()
    cleaned = re.sub(r'^(PLC|VFD|HMI|Sensor|Sensors|AC\s+Drive|Drive|Touch\s+Panel|Rotary\s+Encoder|Encoder)\s+', '', cleaned, flags=re.I).strip()
    return cleaned if cleaned else t[:30]

test_titles = [
    "SIEMENS PLC S7 200 SMART 6ES72881SR300AA0,CPU SR30, AC/DC/Relay, 18DI/12DO",
    "Siemens PLC 6ES73327ND020AB0 SM332, 4AA, 0-10V, 0-5V,+/-10V,+/-20mA",
    "ABB VFD ACS560-01-206A-4  VFD, 150HP",
    "Mitsubishi PLC FX3S-10MR/ES",
    "Weintek HMI MT8071iE",
    "Danfoss VFD 132F 0022 3 HP / 2.2 KW VLT Micro Drive",
    "PFXGP4601TAD Proface HMI Touch Panel",
    "Pepperl and Fuchs OBD500-18GM60-E5-IR-1C"
]

for tt in test_titles:
    print(f"Title: {tt}")
    print(f"  -> Model: {extract_model_part_number(tt)}")
