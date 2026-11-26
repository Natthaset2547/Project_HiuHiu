import json
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_api.settings')
django.setup()

from django.contrib.auth.models import User
from shops.models import UserProfile, RiskRecord, RiskEvidence, Banner, Shop, Review

def populate():
    with open(r'D:\project\scratch\mysql_full_export.json', 'r', encoding='utf-8') as f:
        export_data = json.load(f)
    with open(r'D:\project\scratch\backup_before_antiscam.json', 'r', encoding='utf-8') as f:
        backup_data = json.load(f)

    # 1. Users
    for u_data in export_data['users']:
        user, _ = User.objects.update_or_create(
            id=u_data['id'],
            defaults={
                'username': u_data['username'],
                'email': u_data['email'],
                'password': u_data['password'],
                'is_staff': u_data['is_staff'],
                'is_superuser': u_data['is_superuser'],
                'is_active': u_data['is_active'],
            }
        )
    print(f"Imported {User.objects.count()} users.")

    # 2. Profiles
    for p_data in export_data['profiles']:
        if User.objects.filter(id=p_data['user_id']).exists():
            profile, _ = UserProfile.objects.get_or_create(user_id=p_data['user_id'])
            if p_data['avatar']:
                profile.avatar.name = p_data['avatar']
                profile.save()

    # 3. RiskRecords & Evidences
    for r_data in export_data['risk_records']:
        rec, _ = RiskRecord.objects.update_or_create(
            id=r_data['id'],
            defaults={
                'identifier_type': r_data['identifier_type'],
                'identifier': r_data['identifier'],
                'status': r_data['status'],
                'source_name': r_data['source_name'],
                'evidence_url': r_data['evidence_url'] or '',
                'notes': r_data['notes'] or '',
                'is_active': r_data['is_active'],
            }
        )
        if r_data['evidence_image']:
            rec.evidence_image.name = r_data['evidence_image']
            rec.save()

    RiskEvidence.objects.all().delete()
    for e_data in export_data['evidences']:
        if RiskRecord.objects.filter(id=e_data['record_id']).exists() and e_data['image']:
            ev = RiskEvidence(record_id=e_data['record_id'])
            ev.image.name = e_data['image']
            ev.save()
    print(f"Imported {RiskRecord.objects.count()} risk records.")

    # 4. Banners (with anti-scam titles + original banner images)
    Banner.objects.all().delete()
    banner_templates = [
        {
            'title': 'HiuHiu Anti-Scam 🛡️ รู้ทันมิจฉาชีพ เช็กก่อนโอน',
            'subtitle': 'ศูนย์กลางตรวจสอบรายชื่อคนโกง เลขบัญชีต้องสงสัย และสแกนข้อความแชทหลอกลวงก่อนโอนเงิน',
            'link': 'https://www.thaipoliceonline.go.th',
            'button_type': 'shop',
        },
        {
            'title': 'เตือนภัย! กลโกงใกล้ตัวนักศึกษา & ขาช้อปออนไลน์',
            'subtitle': 'รวบรวมเคสหลอกขายบัตรคอนเสิร์ต หลอกเช่าหอพักทิพย์ งานเสริมปั่นออเดอร์ และเพจปลอมระบาดหนัก',
            'link': 'https://www.thaipoliceonline.go.th',
            'button_type': 'shop',
        },
        {
            'title': 'โดนโกงต้องทำยังไง? สายด่วนอายัดบัญชี AOC 1441',
            'subtitle': 'เช็กขั้นตอนแจ้งความออนไลน์และเบอร์สายด่วนอายัดบัญชีม้าฉุกเฉิน 24 ชั่วโมงของทุกธนาคาร',
            'link': 'https://www.thaipoliceonline.go.th',
            'button_type': 'website',
        },
    ]
    for idx, b_data in enumerate(backup_data['banners']):
        tpl = banner_templates[idx % len(banner_templates)]
        b = Banner(
            title=tpl['title'],
            subtitle=tpl['subtitle'],
            link=tpl['link'],
            button_type=tpl['button_type'],
            is_active=b_data['is_active'],
            sort_order=b_data['sort_order'],
        )
        if b_data['image']:
            b.image.name = b_data['image']
        b.save()
    print(f"Imported {Banner.objects.count()} banners.")

    # 5. Populate 12 Scam Cases using existing images from backup_data['shops']
    Shop.objects.all().delete()
    old_images = [s['image'] for s in backup_data['shops'] if s.get('image')]
    for idx, s in enumerate(backup_data['shops'][:12]):
        shop = Shop(
            name=f"temp_{idx}",
            url=f"https://example.com/{idx}",
            platform=s['platform'],
            status=s['status'],
            description='',
        )
        if idx < len(old_images):
            shop.image.name = old_images[idx]
        shop.save()

    # Run convert_to_antiscam logic to set the 12 scam case titles, descriptions, and comments
    from convert_to_antiscam import run as run_antiscam
    run_antiscam()
    print(f"Final Shop (Scam Case) count: {Shop.objects.count()}, Reviews: {Review.objects.count()}")

if __name__ == '__main__':
    populate()
