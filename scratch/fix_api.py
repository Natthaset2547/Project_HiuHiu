import os

with open('project/frontend/lib/api.ts', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    "process.env.NEXT_PUBLIC_BACKEND_URL ||\n  `http://${localBackendHost}:8000`",
    "process.env.NEXT_PUBLIC_BACKEND_URL || (process.env.NODE_ENV === 'production' ? 'https://hiuhiu-backend.onrender.com' : `http://${localBackendHost}:8000`)"
)

with open('project/frontend/lib/api.ts', 'w', encoding='utf-8') as f:
    f.write(content)
