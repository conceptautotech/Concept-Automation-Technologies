import re

t = "Pepperl and Fuchs OBD500-18GM60-E5-IR-1C"
# with hyphen at start:
m = re.search(r'\b(OBD[-A-Z0-9_/]+)\b', t, re.I)
print("With fixed regex:", m.group(1) if m else None)

# Also test Danfoss:
t2 = "Danfoss VFD 132F 0022 3 HP / 2.2 KW VLT Micro Drive"
# Notice 132F 0022 has space!
m2 = re.search(r'\b(132F\s*[0-9]{4})\b', t2, re.I)
print("Danfoss 132F match:", m2.group(1) if m2 else None)
