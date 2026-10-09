import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_api.settings')
django.setup()

from django.contrib.auth.models import User
from shops.models import Shop, Banner, RiskRecord, RiskEvidence

def migrate_data():
    print("🚀 เริ่มการย้ายข้อมูลจาก MySQL (Local) -> PostgreSQL (Supabase)")
    
    # ย้าย User (ยกเว้น admin ที่อาจจะมีอยู่แล้วบน cloud)
    print("\n📦 ย้ายข้อมูล Users...")
    local_users = User.objects.using('local_mysql').all()
    for user in local_users:
        if not User.objects.using('default').filter(username=user.username).exists():
            user.save(using='default')
            print(f"  ✅ ย้าย User: {user.username}")
        else:
            print(f"  ⏭️ ข้าม User: {user.username} (มีอยู่แล้ว)")

    # ย้าย Banners
    print("\n📦 ย้ายข้อมูล Banners...")
    local_banners = Banner.objects.using('local_mysql').all()
    for banner in local_banners:
        if not Banner.objects.using('default').filter(title=banner.title).exists():
            banner.save(using='default')
            print(f"  ✅ ย้าย Banner: {banner.title}")
        else:
            print(f"  ⏭️ ข้าม Banner: {banner.title}")

    # ย้าย Shops
    print("\n📦 ย้ายข้อมูล Shops...")
    local_shops = Shop.objects.using('local_mysql').all()
    for shop in local_shops:
        if not Shop.objects.using('default').filter(name=shop.name).exists():
            shop.save(using='default')
            print(f"  ✅ ย้าย Shop: {shop.name}")
        else:
            print(f"  ⏭️ ข้าม Shop: {shop.name}")

    # ย้าย RiskRecords
    print("\n📦 ย้ายข้อมูล Risk Records...")
    local_records = RiskRecord.objects.using('local_mysql').all()
    for record in local_records:
        if not RiskRecord.objects.using('default').filter(identifier_type=record.identifier_type, identifier=record.identifier).exists():
            record.save(using='default')
            print(f"  ✅ ย้าย Risk Record: {record.identifier}")
        else:
            print(f"  ⏭️ ข้าม Risk Record: {record.identifier}")

    print("\n🎉 ย้ายข้อมูลเสร็จสมบูรณ์!")

if __name__ == '__main__':
    migrate_data()
