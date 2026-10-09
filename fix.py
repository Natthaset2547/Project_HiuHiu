with open('hiu-hiu backend/shops/views.py', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if \"'status': 'pending',\" in line:
        if 'bad_records_found' in lines[i-1]:
            # This is the return block
            if '0,' in lines[i-1]:
                lines[i] = line.replace(\"'pending'\", \"'safe'\")
            elif 'len(findings)' in lines[i-1]:
                lines[i] = line.replace(\"'pending'\", \"'scam' if findings else 'safe'\")

with open('hiu-hiu backend/shops/views.py', 'w', encoding='utf-8') as f:
    f.writelines(lines)
