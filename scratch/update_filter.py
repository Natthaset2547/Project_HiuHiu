import os

with open('hiu-hiu backend/shops/views.py', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if 'def filter_relevant_findings' in line:
        start_idx = i
        break

new_func = """def query_matches_finding(query: str, finding: dict) -> bool:
    text = (finding.get('title', '') + ' ' + finding.get('snippet', '') + ' ' + finding.get('url', '')).lower()
    query_parts = str(query).lower().split()
    for part in query_parts:
        if len(part) >= 3 and part in text:
            return True
    return False

def filter_relevant_findings(findings, query):
    if not findings:
        return []

    trusted = []
    for f in findings:
        # Check if the result actually mentions the query (avoid Google's broad match false positives)
        if not query_matches_finding(query, f):
            continue
            
        # 1. ถ้าเป็นเว็บขึ้นแบล็คลิสต์โดยตรง ถือว่าใช่เลย
        if is_always_scam_domain(f['url']):
            trusted.append(f)
        # 2. ถ้าเป็นเว็บข่าว/เว็บบอร์ดทั่วไป ต้องมีคำเกี่ยวกับการโกงในเนื้อหาด้วย
        elif is_trusted_domain(f['url']) and has_scam_signal(f):
            trusted.append(f)

    if trusted:
        return trusted[:5]
    return []
"""

with open('hiu-hiu backend/shops/views.py', 'w', encoding='utf-8') as f:
    f.writelines(lines[:start_idx])
    f.write(new_func)
    f.write('\n')
    
    skip = True
    for line in lines[start_idx+1:]:
        if skip and line.startswith('def '):
            skip = False
        if not skip:
            f.write(line)
