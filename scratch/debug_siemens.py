import re

t = "SIEMENS PLC S7 200 SMART 6ES72881SR300AA0,CPU SR30, AC/DC/Relay, 18DI/12DO"

siemens_match = re.search(r'\b(6[A-Z0-9]{3}[-\s]?[0-9][A-Z0-9]{3,4}[-\s]?[0-9][A-Z0-9]{3,4})\b', t, re.I)
print("siemens match:", siemens_match.group(1) if siemens_match else None)

# Why did it fail?
# In 6ES72881SR300AA0:
# 6 [A-Z0-9]{3} -> 6ES7
# [-\s]? -> None
# [0-9][A-Z0-9]{3,4} -> 2881S (5 chars)
# [-\s]? -> None
# [0-9][A-Z0-9]{3,4} -> R300AA0 (7 chars -> length 7 > 4, so doesn't match!)
