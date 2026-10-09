import os

with open('project/frontend/app/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    "result.status === 'safe' ? 'border-green-400 bg-green-50' : \\n                result.status === 'scam' ? 'border-red-400 bg-red-50' : 'border-yellow-400 bg-yellow-50'",
    "result.status === 'safe' ? 'border-green-400 bg-green-50' : \\n                result.status === 'scam' ? 'border-red-400 bg-red-50' : \\n                result.status === 'warning' ? 'border-orange-400 bg-orange-50' :\\n                result.status === 'neutral' ? 'border-gray-400 bg-gray-50' :\\n                'border-yellow-400 bg-yellow-50'"
)

content = content.replace(
    "result.status === 'safe' ? 'bg-green-500' : \\n                    result.status === 'scam' ? 'bg-red-500' : 'bg-yellow-500'",
    "result.status === 'safe' ? 'bg-green-500' : \\n                    result.status === 'scam' ? 'bg-red-500' : \\n                    result.status === 'warning' ? 'bg-orange-500' :\\n                    result.status === 'neutral' ? 'bg-gray-500' :\\n                    'bg-yellow-500'"
)

content = content.replace(
    "{result.status === 'safe' ? 'ปลอดภัย' : \\n                   result.status === 'scam' ? 'ควรระวัง' : \\n                   result.status === 'pending' ? 'รอการตรวจสอบ' :\\n                   result.bad_records_found > 0 ? 'พบสัญญาณน่าสงสัย' : 'ไม่พบประวัติการโกง'}",
    "{result.status === 'safe' ? 'ตรวจสอบแล้ว ปลอดภัย' : \\n                   result.status === 'scam' ? 'บัญชีอันตราย' : \\n                   result.status === 'warning' ? 'พบข้อมูลน่าสงสัย' :\\n                   result.status === 'neutral' ? 'ไม่พบประวัติ' :\\n                   result.status === 'pending' ? 'รอการตรวจสอบ' :\\n                   'ไม่ทราบสถานะ'}"
)

with open('project/frontend/app/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
