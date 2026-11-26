import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_api.settings')
django.setup()

from django.contrib.auth.models import User
from shops.models import Shop, Banner, Review
from seed_detailed_dossiers import DOSSIERS

SCAM_CASES_META = [
    ('เตือนภัย! หลอกขายบัตรคอนเสิร์ต & การ์ดศิลปิน K-Pop ใน X', 'https://www.thaipoliceonline.go.th/#case-kpop-ticket', 'x_twitter', 'scam', [
        (5, 'เจอมุกนี้ใน X เหมือนกันเลยครับ อ้างว่ามีคนรอคิวต่อให้รีบโอนภายใน 5 นาที พอขอวิดีโอคอลดูบัตรจริงก็ไม่ยอม'),
        (5, 'อันตรายมาก ชอบเอาภาพบัตรคนอื่นมาตัดต่อชื่อตัวเอง ต้องเช็กชื่อบัญชีก่อนโอนทุกครั้ง'),
    ]),
    ('ระวัง! เพจปลอมหลอกพรีออเดอร์ Art Toy & กล่องสุ่มยกบ็อกซ์', 'https://www.thaipoliceonline.go.th/#case-arttoy-preorder', 'facebook', 'scam', [
        (5, 'เพจยิงแอดมาหน้าฟีดเลย มีคนกดโกรธในโพสต์เพียบแต่ปิดคอมเมนต์ไว้ เกือบโอนแล้วดีที่มาเช็กก่อน'),
        (4, 'ถ้าเจอราคาถูกกว่าช็อปเกินครึ่ง ให้ระวังไว้ก่อนเลยว่าเป็นเพจมิจฉาชีพ'),
    ]),
    ('กลโกงหลอกปล่อยเช่าหอพัก/คอนโดทิพย์ รอบมหาวิทยาลัย', 'https://www.thaipoliceonline.go.th/#case-dorm-deposit', 'facebook', 'scam', [
        (5, 'เพื่อนในคณะเพิ่งโดนไป 3,000 บาท บอกว่าถ้าไม่โอนจองวันนี้จะมีคนอื่นเอาห้องไป พอไปดูที่หอจริงเจ้าของหอบอกไม่มีห้องว่าง'),
    ]),
    ('หลอกรับสมัครงานพาร์ทไทม์ กดรับออเดอร์สำรองจ่าย', 'https://www.thaipoliceonline.go.th/#case-parttime-job', 'instagram', 'scam', [
        (5, 'ในกลุ่ม OpenChat มีหน้าม้าคอยส่งสลิปว่าถอนได้จริง อย่าหลงเชื่อโอนเงินค่าปลดล็อกระบบเด็ดขาด!'),
    ]),
    ('เตือนภัย! ร้านเสื้อผ้าแฟชั่น IG ทิพย์ ก๊อปรูปเน็ตส่งของไม่ตรงปก', 'https://www.thaipoliceonline.go.th/#case-fashion-ig', 'instagram', 'scam', []),
    ('ระวัง! สกินแคร์และครีมเคาน์เตอร์แบรนด์ปลอม ตัดราคา 70%', 'https://www.thaipoliceonline.go.th/#case-fake-skincare', 'instagram', 'pending', []),
    ('มุกหลอกขายกระเป๋าแบรนด์เนมมือสอง ให้โอนเข้าบัญชีม้า', 'https://www.thaipoliceonline.go.th/#case-brandname-bag', 'facebook', 'scam', []),
    ('เพจปลอมขายคูปองบุฟเฟต์ / วอยเชอร์ร้านอาหารดังราคาถูก', 'https://www.thaipoliceonline.go.th/#case-food-voucher', 'facebook', 'pending', []),
    ('SMS แนบลิงก์ปลอมอ้างพัสดุตกค้าง / การไฟฟ้าคืนเงินค่าประกัน', 'https://www.thaipoliceonline.go.th/#case-sms-phishing', 'x_twitter', 'scam', []),
    ('หลอกส่งต่อไอแพด/มือถือมือสองหลุดจำนำ ราคาถูกผิดปกติ', 'https://www.thaipoliceonline.go.th/#case-ipad-secondhand', 'facebook', 'scam', []),
    ('แนวทางป้องกัน: 5 วิธีเช็กเพจขายเสื้อผ้า/รองเท้าใน IG ก่อนโอน', 'https://www.thaipoliceonline.go.th/#guide-check-ig', 'instagram', 'safe', []),
    ('แนวทางป้องกัน: วิธีตรวจสอบคนรับหิ้วของ K-Pop & Art Toy ไม่ให้โดนบิด', 'https://www.thaipoliceonline.go.th/#guide-kpop-arttoy', 'x_twitter', 'safe', []),
]

def update_cloud():
    # 1. Update Banners
    banner_templates = [
        {
            'title': 'HiuHiu Anti-Scam 🛡️ รู้ทันมิจฉาชีพ เช็กก่อนโอน',
            'subtitle': 'ศูนย์กลางตรวจสอบรายชื่อคนโกง เลขบัญชีต้องสงสัย และสแกนข้อความแชทหลอกลวงก่อนโอนเงิน',
            'link': '',
            'button_type': 'shop',
        },
        {
            'title': 'เตือนภัย! กลโกงใกล้ตัวนักศึกษา & ขาช้อปออนไลน์',
            'subtitle': 'รวบรวมเคสหลอกขายบัตรคอนเสิร์ต หลอกเช่าหอพักทิพย์ งานเสริมปั่นออเดอร์ และเพจปลอมระบาดหนัก',
            'link': '',
            'button_type': 'shop',
        },
        {
            'title': 'โดนโกงต้องทำยังไง? สายด่วนอายัดบัญชี AOC 1441',
            'subtitle': 'เช็กขั้นตอนแจ้งความออนไลน์และเบอร์สายด่วนอายัดบัญชีม้าฉุกเฉิน 24 ชั่วโมงของทุกธนาคาร',
            'link': 'https://www.thaipoliceonline.go.th',
            'button_type': 'website',
        },
    ]
    banners = list(Banner.objects.all().order_by('sort_order', 'id'))
    for idx, banner in enumerate(banners):
        tpl = banner_templates[idx % len(banner_templates)]
        banner.title = tpl['title']
        banner.subtitle = tpl['subtitle']
        banner.link = tpl['link']
        banner.button_type = tpl['button_type']
        banner.save()

    # Check if already migrated to anti-scam cases
    if Shop.objects.filter(url='https://www.thaipoliceonline.go.th/#case-kpop-ticket').exists():
        print("Cloud DB already has anti-scam cases; updating descriptions and cover images...")

    all_shops = list(Shop.objects.all().order_by('id'))
    users = list(User.objects.all()[:3])
    Review.objects.all().delete()

    kept_ids = []
    for idx, (name, url, platform, status, comments) in enumerate(SCAM_CASES_META):
        d = DOSSIERS[idx % len(DOSSIERS)]
        full_desc = (
            f"{d['summary']}\n"
            f"---STEPS---\n" + "\n".join(d['steps']) + "\n"
            f"---REDFLAGS---\n" + "\n".join(d['redflags']) + "\n"
            f"---PREVENTION---\n" + "\n".join(d['prevention']) + "\n"
            f"[Tags: {d['tags']}]"
        )
        if idx < len(all_shops):
            shop = all_shops[idx]
        else:
            shop = Shop()
        shop.name = name
        shop.url = url
        shop.platform = platform
        shop.status = status
        shop.description = full_desc
        shop.image.name = f"shops/antiscam_case_{idx + 1}.png"
        shop.save()
        kept_ids.append(shop.id)

        for c_idx, (rating, comment_text) in enumerate(comments):
            if users:
                u = users[c_idx % len(users)]
                Review.objects.update_or_create(
                    shop=shop,
                    user=u,
                    defaults={'rating': rating, 'comment': comment_text},
                )

    Shop.objects.exclude(id__in=kept_ids).delete()
    print(f"Cloud DB updated with {len(kept_ids)} anti-scam cases.")

if __name__ == '__main__':
    update_cloud()
