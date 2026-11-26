import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_api.settings')
django.setup()

from django.contrib.auth.models import User
from shops.models import Shop, Banner, Review
from seed_detailed_dossiers import DOSSIERS

SCAM_CASES_META = [
    ('เตือนภัย! หลอกขายบัตรคอนเสิร์ต & การ์ดศิลปิน K-Pop ใน X', 'https://www.thaipoliceonline.go.th/#case-kpop-ticket', 'x_twitter', 'scam', [
        (5, 'เจอมุกนี้ใน X เหมือนกันเลยครับ อ้างว่ามีคนรอคิวต่อให้รีบโอนภายใน 5 นาที พอขอวิดีโอคอลดูบัตรจริงในแอปก็ไม่ยอม'),
        (5, 'อันตรายมาก ชอบเอาภาพบัตรคนอื่นมาตัดต่อใส่ลายน้ำชื่อแอคตัวเอง ต้องเอาชื่อบัญชีไปเช็กก่อนโอนทุกครั้ง'),
    ]),
    ('ระวัง! เพจปลอมหลอกพรีออเดอร์ Art Toy & กล่องสุ่มยกบ็อกซ์', 'https://www.thaipoliceonline.go.th/#case-arttoy-preorder', 'facebook', 'scam', [
        (5, 'เพจยิงแอดมาหน้าฟีดเลย มีคนกดโกรธในโพสต์เพียบแต่ปิดคอมเมนต์ไว้ เกือบโอนแล้วดีที่มาเช็กในเว็บก่อน'),
        (4, 'ถ้าเจอราคาถูกกว่าช็อป Pop Mart เกินครึ่ง ให้ระวังไว้ก่อนเลยว่าเป็นเพจผียิงแอดหลอกโอน'),
    ]),
    ('กลโกงหลอกปล่อยเช่าหอพัก/คอนโดทิพย์ รอบมหาวิทยาลัย', 'https://www.thaipoliceonline.go.th/#case-dorm-deposit', 'facebook', 'scam', [
        (5, 'เพื่อนในคณะเพิ่งโดนไป 3,000 บาท บอกว่าถ้าไม่โอนจองวันนี้จะมีคนอื่นเอาห้องไป พอไปดูที่หอจริงเจ้าของหอบอกไม่มีห้องว่าง'),
        (5, 'เจอบ่อยมากช่วงก่อนเปิดเทอม เอารูปคอนโดหรูในกรุงเทพมาโพสต์บอกว่าเป็นหอหน้ามอ ราคา 2,500 บาท ห้ามโอนจองก่อนเห็นห้องจริงเด็ดขาด'),
    ]),
    ('หลอกรับสมัครงานพาร์ทไทม์ กดรับออเดอร์สำรองจ่าย', 'https://www.thaipoliceonline.go.th/#case-parttime-job', 'instagram', 'scam', [
        (5, 'ในกลุ่ม OpenChat มีหน้าม้าคอยส่งสลิปว่าถอนได้จริง อย่าหลงเชื่อโอนเงินค่าปลดล็อกระบบเด็ดขาด!'),
        (5, 'รอบแรกมันจะโอนคืนให้เราก่อน 100-200 บาทเพื่อให้ตายใจ พอรอบสองให้สำรองจ่ายหลักพันแล้วอ้างว่าทำผิดขั้นตอน ถอนไม่ได้เลย'),
    ]),
    ('เตือนภัย! ร้านเสื้อผ้าแฟชั่น IG ทิพย์ ก๊อปรูปเน็ตส่งของไม่ตรงปก', 'https://www.thaipoliceonline.go.th/#case-fashion-ig', 'instagram', 'scam', [
        (5, 'พอกดดูตรง "เกี่ยวกับบัญชีนี้" ใน IG คือเปลี่ยนชื่อร้านมาแล้ว 8 ครั้ง! ยอดฟอลเป็นหมื่นแต่ไม่มีคนกดไลก์เลย'),
        (5, 'เคยสั่งกางเกงยีนส์จากร้านแนวนี้ โอนเสร็จส่งเสื้อยืดเก่าๆ ขาดๆ มาให้แทน พอทักไปทวงก็โดนบล็อกไอจีทันที'),
    ]),
    ('ระวัง! สกินแคร์และครีมเคาน์เตอร์แบรนด์ปลอม ตัดราคา 70%', 'https://www.thaipoliceonline.go.th/#case-fake-skincare', 'instagram', 'pending', [
        (5, 'อ้างว่าเป็นของหิ้วปลอดภาษีจาก Duty Free ลดเหลือขวดละ 290 บาท พอเปิดขวดมากลิ่นน้ำยาปรับผ้านุ่มชัดๆ ของปลอม 100%'),
        (4, 'อย่าเห็นแก่ของถูกเลยครับ หน้าพังขึ้นมาค่ารักษาแพงกว่าค่าครีมของแท้หลายเท่า ซื้อจาก Official ชัวร์สุด'),
    ]),
    ('มุกหลอกขายกระเป๋าแบรนด์เนมมือสอง ให้โอนเข้าบัญชีม้า', 'https://www.thaipoliceonline.go.th/#case-brandname-bag', 'facebook', 'scam', [
        (5, 'มันส่งรูปบัตรประชาชนมาให้ดูเองเลยเพื่อให้เราเชื่อใจ แต่พอจะโอนบอกให้โอนเข้าบัญชีแฟนชื่อไม่ตรงบัตร โป๊ะมาก!'),
        (5, 'บัตรประชาชนที่มันส่งมาคือบัตรของเหยื่อคนก่อนหน้าที่โดนหลอกขอรูปบัตรไป ต้องเช็กให้ชื่อบัญชีตรงกับชื่อเฟซเท่านั้น'),
    ]),
    ('เพจปลอมขายคูปองบุฟเฟต์ / วอยเชอร์ร้านอาหารดังราคาถูก', 'https://www.thaipoliceonline.go.th/#case-food-voucher', 'facebook', 'pending', [
        (5, 'ก๊อปโลโก้ร้านบุฟเฟต์ดังมาเป๊ะเลย จัดโปร 1 แถม 1 แต่พอสแกน QR จ่ายเงิน ชื่อบัญชีดันเป็นชื่อนายอะไรก็ไม่รู้ ไม่ใช่ชื่อบริษัท'),
        (4, 'ทางร้านจริงประกาศเตือนแล้วว่าไม่มีการขายวอยเชอร์ผ่านแชทเพจ ถ้าให้โอนเข้าบัญชีบุคคลคือมิจฉาชีพแน่นอนครับ'),
    ]),
    ('SMS แนบลิงก์ปลอมอ้างพัสดุตกค้าง / การไฟฟ้าคืนเงินค่าประกัน', 'https://www.thaipoliceonline.go.th/#case-sms-phishing', 'x_twitter', 'scam', [
        (5, 'ได้รับ SMS บอกพัสดุจัดส่งไม่สำเร็จพร้อมลิงก์ bit.ly เหมือนในเคสนี้เป๊ะเลย ลองก๊อปข้อความไปสแกนในหน้าแรกขึ้นความเสี่ยง 85%'),
        (5, 'ญาติผู้ใหญ่ที่บ้านเกือบกดโหลดแอป .apk ตามที่มันบอกในไลน์ปลอมแล้ว ดีที่รีบเปิดโหมดเครื่องบินตัดเน็ตทัน'),
    ]),
    ('หลอกส่งต่อไอแพด/มือถือมือสองหลุดจำนำ ราคาถูกผิดปกติ', 'https://www.thaipoliceonline.go.th/#case-ipad-secondhand', 'facebook', 'scam', [
        (5, 'โพสต์ขาย iPad Air พร้อมปากกาในกลุ่มมหาลัยแค่ 5,000 บาท บอกร้อนเงินค่าเทอม แต่พอขอนัดรับหน้ามอบอกอยู่ต่างจังหวัดทุกราย'),
        (5, 'พอขอให้เขียนชื่อเราใส่กระดาษวางคู่ไอแพดแล้วถ่ายรูปสดๆ ให้ดู อ้างว่าแพ็กลงกล่องส่งขนส่งไปแล้วแกะไม่ได้ มุกเดิมเป๊ะ'),
    ]),
    ('เตือนภัย! เพจสวมรอยขายรองเท้า Sneaker รุ่นฮิตใน IG โอนแล้วบล็อก', 'https://www.thaipoliceonline.go.th/#guide-check-ig', 'instagram', 'safe', [
        (5, 'เทคนิคกดดู "เกี่ยวกับบัญชีนี้" บน IG มีประโยชน์มากครับ ช่วยกรองร้านที่ซื้อแอคมาเปลี่ยนชื่อหลอกขายรองเท้าได้เยอะเลย'),
        (5, 'เกือบโดนร้านรองเท้าในไอจีที่เปลี่ยนชื่อมา 6 รอบหลอกเหมือนกันครับ ดีที่เช็กประวัติดูก่อน'),
    ]),
    ('ระวัง! แอครับหิ้วสินค้า K-Pop & Art Toy เปิดพรีออเดอร์แล้วบิดเงินหนี', 'https://www.thaipoliceonline.go.th/#guide-kpop-arttoy', 'x_twitter', 'safe', [
        (5, 'จริงมากครับ เวลาฝากกดบัตรหรือพรีอัลบั้ม ต้องขอดูใบ Order Confirmation จากเว็บหลักทุกครั้ง และห้ามโอนบัญชีที่ไม่ตรงชื่อคนรับหิ้ว'),
        (5, 'สายสะสม Art Toy กับติ่งเกาหลีต้องระวังพวกที่เปิดพรีล็อตใหม่ราคาถูกไปหมุนจ่ายล็อตเก่าด้วยนะครับ เช็กประวัติในเว็บนี้ก่อนโอนชัวร์สุด'),
    ]),
]

def get_comment_users():
    u1, _ = User.objects.get_or_create(
        username='ณัฐเศรษฐ์ ศรีกลัด',
        defaults={'email': 'natthaset_member@hiuhiu.local', 'is_staff': False, 'is_active': True}
    )
    u2, _ = User.objects.get_or_create(
        username='พลอยใส วัยเรียน',
        defaults={'email': 'ploysai_student@hiuhiu.local', 'is_staff': False, 'is_active': True}
    )
    return [u1, u2]

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

    all_shops = list(Shop.objects.all().order_by('id'))
    comment_users = get_comment_users()
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
        shop.image.name = "shops/antiscam_photo_6_v2.jpg" if idx == 5 else f"shops/antiscam_photo_{idx + 1}.jpg"
        shop.save()
        kept_ids.append(shop.id)

        for c_idx, (rating, comment_text) in enumerate(comments):
            u = comment_users[c_idx % len(comment_users)]
            Review.objects.update_or_create(
                shop=shop,
                user=u,
                defaults={'rating': rating, 'comment': comment_text},
            )

    Shop.objects.exclude(id__in=kept_ids).delete()

    # Ensure existing on-disk avatars are backed up into avatar_base64 if not already set
    try:
        import base64
        from shops.models import UserProfile
        for prof in UserProfile.objects.all():
            if not prof.avatar_base64 and prof.avatar and prof.avatar.name:
                if prof.avatar.storage.exists(prof.avatar.name):
                    with prof.avatar.open('rb') as f:
                        b64 = base64.b64encode(f.read()).decode('ascii')
                        prof.avatar_base64 = f"data:image/jpeg;base64,{b64}"
                        prof.save()
    except Exception as e:
        print("Avatar base64 init skipped:", e)

    print(f"DB updated with {len(kept_ids)} anti-scam cases and {Review.objects.count()} comments.")

if __name__ == '__main__':
    update_cloud()
