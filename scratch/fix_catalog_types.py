"""
Fix type and category for every product in src/data/catalog.ts
based on the Products mapping.xlsx structure:

Category (type)    -> Brands/keywords
PLC                -> Siemens, Mitsubishi, Allen Bradley, Omron + keywords plc,cpu,melsec,simatic,compactlogix,micrologix
HMI                -> Proface, Weintek, Siemens, Mitsubishi, Allen Bradley, Omron, Fuji + keywords hmi,touch panel,panelview,got,tp,ktp
VFD                -> Danfoss, ABB, Omron, Allen Bradley, Schneider, Fuji, Inovance + keywords vfd,drive,inverter,frenic,freqrol,sinamics,vlT,powerflex,altivar
Servo System       -> Siemens, Mitsubishi + keywords servo,motion,simotics,melservo
Sensors            -> IFM, SICK, Omron, Pepperl+Fuchs, Keyence + keywords sensor,photoelectric,inductive,proximity,light curtain
Encoder            -> Hengstler,Heidenhain,Omron,Autonics,SICK,Pepperl+Fuchs,Baumer,Kubler,Tamagawa + keywords encoder,rotary
Industrial Networking -> Phoenix Contact, Siemens Ethernet Switches + keywords switch,scalance,ethernet,networking,fl switch
"""

import re, json

with open('src/data/catalog.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Extract all product objects as JSON-like blocks
# We'll do a targeted replacement of type and category fields per product

def classify_product(name, brand, category, current_type):
    n = (name or '').lower()
    b = (brand or '').lower()
    cat = (category or '').lower()
    ct = (current_type or '').lower()

    # --- ENCODER (check before sensor — Pepperl/Omron/SICK appear in both) ---
    encoder_brands = ['hengstler','heidenhain','autonics','baumer','kubler','kübler','tamagawa']
    encoder_kw = ['encoder','rotary encoder','incremental encoder','absolute encoder']
    is_encoder_brand = any(x in b for x in encoder_brands)
    is_encoder_kw = any(x in n or x in cat for x in encoder_kw)
    # Pepperl/Omron/SICK encoder — check name/category explicitly
    pf_encoder = ('pepperl' in b or 'omron' in b or 'sick' in b or 'autonics' in b) and is_encoder_kw

    if is_encoder_brand or pf_encoder or (is_encoder_kw and not ('sensor' in b)):
        return 'Encoder', 'Sensors & Encoders'

    # --- SENSORS ---
    sensor_brands = ['ifm','sick','keyence','pepperl','omron']
    sensor_kw = ['sensor','photoelectric','inductive','proximity','light curtain','optical','diffuse','retro','through-beam','ultrasonic','laser']
    is_sensor_brand = any(x in b for x in sensor_brands)
    is_sensor_kw = any(x in n or x in cat for x in sensor_kw)
    if is_sensor_brand and is_sensor_kw:
        return 'Sensor', 'Sensors & Encoders'
    if is_sensor_kw and not any(x in b for x in ['siemens','mitsubishi','allen','omron plc','danfoss','abb','fuji','schneider']):
        return 'Sensor', 'Sensors & Encoders'

    # --- SERVO SYSTEM ---
    servo_kw = ['servo','motion control','simotics','melservo','s120','s210','sinamics s','mr-j','mr-e','mr-c']
    if any(x in n or x in cat for x in servo_kw):
        return 'Servo Drive System', 'Servo & Motion Systems'

    # --- VFD ---
    vfd_brands = ['danfoss','abb','fuji','schneider','inovance','innovance']
    vfd_kw = ['vfd','ac drive','frequency drive','inverter','frenic','freqrol','vlt','powerflex','altivar','sinamics v','sinamics g','acs','acq','acb','fr-','lenze']
    is_vfd_brand = any(x in b for x in vfd_brands)
    is_vfd_kw = any(x in n or x in cat for x in vfd_kw)
    # Allen Bradley VFD: powerflex in name
    ab_vfd = 'allen' in b and ('powerflex' in n or 'vfd' in n or 'vfd' in cat or 'drive' in cat)
    # Omron VFD
    omron_vfd = 'omron' in b and ('vfd' in n or 'drive' in n or 'inverter' in n or 'mx2' in n or '3g3' in n)
    if is_vfd_brand or is_vfd_kw or ab_vfd or omron_vfd:
        return 'VFD', 'VFD & AC Drives'

    # --- HMI ---
    hmi_brands = ['proface','weintek']
    hmi_kw = ['hmi','touch panel','touch screen','operator panel','got','panelview','tp1','tp2','ktp','comfort panel','basic panel','gp-','pfx','cimr']
    is_hmi_brand = any(x in b for x in hmi_brands)
    is_hmi_kw = any(x in n or x in cat for x in hmi_kw)
    if is_hmi_brand or is_hmi_kw:
        return 'HMI', 'HMI Touch Panels'

    # --- NETWORKING ---
    net_kw = ['ethernet switch','scalance','fl switch','networking','managed switch','unmanaged switch','industrial switch']
    if any(x in n or x in cat for x in net_kw):
        return 'Industrial Networking', 'Industrial Networking'

    # --- PLC (default for known automation brands) ---
    plc_kw = ['plc','cpu','programmable','s7-','s7 ','1200','1500','fx3','fx5','fx2','cp1','cp2','cj','cs1','nj','melsec','simatic','compactlogix','micrologix','controllogix','slc','im151','im152','im153','im154','sm3','sm2','sm4','sm5','6es7','6gk','6ag','et200','dp/dp','profibus']
    if any(x in n or x in cat for x in plc_kw):
        return 'PLC', 'PLC Systems'

    # fallback — keep current if it already matches known types
    type_map = {
        'plc': ('PLC', 'PLC Systems'),
        'hmi': ('HMI', 'HMI Touch Panels'),
        'vfd': ('VFD', 'VFD & AC Drives'),
        'sensor': ('Sensor', 'Sensors & Encoders'),
        'sensors': ('Sensor', 'Sensors & Encoders'),
        'encoder': ('Encoder', 'Sensors & Encoders'),
        'servo': ('Servo Drive System', 'Servo & Motion Systems'),
        'servo drive system': ('Servo Drive System', 'Servo & Motion Systems'),
        'modules': ('PLC', 'PLC Systems'),
    }
    if ct in type_map:
        return type_map[ct]

    return current_type, category


# Parse all product entries from the TS file
# We'll find each product block and update type and category
product_pattern = re.compile(
    r'(\{[^{}]*?"id"\s*:\s*"[^"]*"[^{}]*?\})',
    re.DOTALL
)

def fix_block(match):
    block = match.group(1)

    name_m = re.search(r'"name"\s*:\s*"([^"]*)"', block)
    brand_m = re.search(r'"brand"\s*:\s*"([^"]*)"', block)
    cat_m = re.search(r'"category"\s*:\s*"([^"]*)"', block)
    type_m = re.search(r'"type"\s*:\s*"([^"]*)"', block)

    name = name_m.group(1) if name_m else ''
    brand = brand_m.group(1) if brand_m else ''
    cat = cat_m.group(1) if cat_m else ''
    current_type = type_m.group(1) if type_m else ''

    new_type, new_cat = classify_product(name, brand, cat, current_type)

    # Replace type
    if type_m and new_type != current_type:
        block = block.replace(f'"type": "{current_type}"', f'"type": "{new_type}"')
    elif not type_m and new_type:
        # insert type after category
        block = re.sub(
            r'("category"\s*:\s*"[^"]*")',
            f'\\1,\n    "type": "{new_type}"',
            block, count=1
        )

    # Replace category
    if cat_m and new_cat != cat:
        block = block.replace(f'"category": "{cat}"', f'"category": "{new_cat}"')

    return block

new_content = product_pattern.sub(fix_block, content)

with open('src/data/catalog.ts', 'w', encoding='utf-8') as f:
    f.write(new_content)

# Count changes
orig_types = re.findall(r'"type"\s*:\s*"([^"]*)"', content)
new_types = re.findall(r'"type"\s*:\s*"([^"]*)"', new_content)
changes = sum(1 for o, n in zip(orig_types, new_types) if o != n)
print(f'Total products processed: {len(orig_types)}')
print(f'Type values changed: {changes}')

from collections import Counter
c = Counter(new_types)
print('Type distribution after fix:')
for t, count in sorted(c.items(), key=lambda x: -x[1]):
    print(f'  {t}: {count}')
