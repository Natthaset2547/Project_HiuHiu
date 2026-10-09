import os

with open('hiu-hiu backend/shops/views.py', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "'status': 'safe'," in line and "bad_records_found" in lines[i-1] and "checked_fields" in lines[i-2]:
        lines[i] = "            'status': 'neutral',\n"
    elif "'status': 'scam' if findings else 'safe'," in line:
        lines[i] = "        'status': 'warning' if findings else 'neutral',\n"

with open('hiu-hiu backend/shops/views.py', 'w', encoding='utf-8') as f:
    f.writelines(lines)
