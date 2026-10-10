import os
files = [
    'project/frontend/components/report-modal.tsx',
    'project/frontend/components/admin/risk-record-client.tsx'
]

for file_path in files:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    content = content.replace(
        'className="w-full flex items-center justify-center gap-2 border-dashed border-2 bg-slate-50/50 hover:bg-slate-100 text-muted-foreground"',
        'className="w-full flex items-center justify-center gap-2 border-dashed border-2 bg-transparent hover:bg-white/10 text-white/70 hover:text-white transition-all"'
    )
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
