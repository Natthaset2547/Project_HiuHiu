import json
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_api.settings')
django.setup()

from django.contrib.auth.models import User
from shops.models import Shop, Banner, Review

def run():
    # 1. Backup existing data first
    backup = {
        'shops': [
            {
                'id': s.id,
                'name': s.name,
                'url': s.url,
                'platform': s.platform,
                'status': s.status,
                'description': s.description,
                'image': s.image.name if s.image else None,
            }
            for s in Shop.objects.all()
        ],
        'banners': [
            {
                'id': b.id,
                'title': b.title,
                'subtitle': b.subtitle,
                'image': b.image.name if b.image else None,
                'link': b.link,
                'button_type': b.button_type,
                'is_active': b.is_active,
                'sort_order': b.sort_order,
            }
            for b in Banner.objects.all()
        ],
        'reviews': [
            {
                'id': r.id,
                'shop_id': r.shop_id,
                'user_id': r.user_id,
                'rating': r.rating,
                'comment': r.comment,
            }
            for r in Review.objects.all()
        ],
    }

    backup_path = r'D:\project\scratch\backup_before_antiscam.json'
    if not os.path.exists(backup_path):
        with open(backup_path, 'w', encoding='utf-8') as f:
            json.dump(backup, f, ensure_ascii=False, indent=2)
        print(f'Backed up {len(backup["shops"])} shops and {len(backup["banners"])} banners to {backup_path}')

    # 2. Update Banners to Anti-Scam theme
    banner_templates = [
        {
            'title': 'HiuHiu Anti-Scam 🛡️ รู้ทันมิจฉาชีพ เช็กก่อนโอน',
            'subtitle': 'ศูนย์กลางตรวจสอบรายชื่อคนโกง เลขบัญชีต้องสงสัย และสแกนข้อความแชทหลอกลวงก่อนโอนเงิน',
            'link': '/shops',
            'button_type': 'shop',
        },
        {
            'title': 'เตือนภัย! กลโกงใกล้ตัวนักศึกษา & ขาช้อปออนไลน์',
            'subtitle': 'รวบรวมเคสหลอกขายบัตรคอนเสิร์ต หลอกเช่าหอพักทิพย์ งานเสริมปั่นออเดอร์ และเพจปลอมระบาดหนัก',
            'link': '/shops',
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
    print(f'Updated {len(banners)} banners.')

    # 3. Define 12 realistic Scam Alert Cases covering all categories
    scam_cases = [
        {
            'name': 'เตือนภัย! หลอกขายบัตรคอนเสิร์ต & การ์ดศิลปิน K-Pop ใน X',
            'url': 'https://www.thaipoliceonline.go.th/#case-kpop-ticket',
            'platform': 'x_twitter',
            'status': 'scam',
            'description': 'มิจฉาชีพสวมรอยใช้รูปบัตรคอนเสิร์ตของคนอื่นมาโพสต์ปล่อยบัตรหลุดจองราคาถูก อ้างว่ามีคิวรอต่อเยอะ เร่งให้โอนมัดจำด่วนแล้วบล็อกหนี [Tags: k-pop ติ่ง อัลบั้ม การ์ด คอนเสิร์ต บัตรคอน ศิลปิน รับกดบัตร]',
            'comments': [
                (5, 'เจอมุกนี้ใน X เหมือนกันเลยครับ อ้างว่ามีคนรอคิวต่อให้รีบโอนภายใน 5 นาที พอขอวิดีโอคอลดูบัตรจริงก็ไม่ยอม'),
                (5, 'อันตรายมาก ชอบเอาภาพบัตรคนอื่นมาตัดต่อชื่อตัวเอง ต้องเช็กชื่อบัญชีก่อนโอนทุกครั้ง'),
            ],
        },
        {
            'name': 'ระวัง! เพจปลอมหลอกพรีออเดอร์ Art Toy & กล่องสุ่มยกบ็อกซ์',
            'url': 'https://www.thaipoliceonline.go.th/#case-arttoy-preorder',
            'platform': 'facebook',
            'status': 'scam',
            'description': 'เปิดเพจยิงแอดขายกล่องสุ่ม Art Toy รุ่นฮิตในราคาต่ำกว่าช็อป อ้างว่าเป็นสินค้านำเข้าล็อตพิเศษ ให้โอนเต็มจำนวนแล้วปิดเพจหนี [Tags: art toy ของเล่น กล่องสุ่ม ฟิกเกอร์ โมเดล ตุ๊กตา popmart พรีออเดอร์]',
            'comments': [
                (5, 'เพจยิงแอดมาหน้าฟีดเลย มีคนกดโกรธในโพสต์เพียบแต่ปิดคอมเมนต์ไว้ เกือบโอนแล้วดีที่มาเช็กก่อน'),
                (4, 'ถ้าเจอราคาถูกกว่าช็อปเกินครึ่ง ให้ระวังไว้ก่อนเลยว่าเป็นเพจมิจฉาชีพ'),
            ],
        },
        {
            'name': 'กลโกงหลอกปล่อยเช่าหอพัก/คอนโดทิพย์ รอบมหาวิทยาลัย',
            'url': 'https://www.thaipoliceonline.go.th/#case-dorm-deposit',
            'platform': 'facebook',
            'status': 'scam',
            'description': 'มิจฉาชีพก๊อปปี้รูปห้องพักสวยๆ มาโพสต์ในกลุ่มหาหอพักนักศึกษา ตั้งราคาเช่าถูกกว่าปกติ แล้วหลอกให้โอนเงินค่ามัดจำจองสิทธิ์ดูห้องล่วงหน้า [Tags: ของใช้ หอพัก เช่าหอ คอนโด สัญญาเช่า มัดจำหอ ไลฟ์สไตล์ จิปาถะ]',
            'comments': [
                (5, 'เพื่อนในคณะเพิ่งโดนไป 3,000 บาท บอกว่าถ้าไม่โอนจองวันนี้จะมีคนอื่นเอาห้องไป พอไปดูที่หอจริงเจ้าของหอบอกไม่มีห้องว่าง'),
            ],
        },
        {
            'name': 'หลอกรับสมัครงานพาร์ทไทม์ กดรับออเดอร์สำรองจ่าย',
            'url': 'https://www.thaipoliceonline.go.th/#case-parttime-job',
            'platform': 'instagram',
            'status': 'scam',
            'description': 'ยิงโฆษณาชวนทำงานเสริมออนไลน์ผ่าน IG / LINE OpenChat ช่วงแรกได้เงินจริงหลักร้อย จากนั้นบังคับให้โอนเงินสำรองจ่ายค่าเปิดระบบหลักพันถึงหลักหมื่นแล้วถอนไม่ได้ [Tags: ร้านค้า งานเสริม พาร์ทไทม์ ปั่นออเดอร์ คอลเซ็นเตอร์ บัญชีม้า พรีออเดอร์]',
            'comments': [
                (5, 'ในกลุ่ม OpenChat มีหน้าม้าคอยส่งสลิปว่าถอนได้จริง อย่าหลงเชื่อโอนเงินค่าปลดล็อกระบบเด็ดขาด!'),
            ],
        },
        {
            'name': 'เตือนภัย! ร้านเสื้อผ้าแฟชั่น IG ทิพย์ ก๊อปรูปเน็ตส่งของไม่ตรงปก',
            'url': 'https://www.thaipoliceonline.go.th/#case-fashion-ig',
            'platform': 'instagram',
            'status': 'scam',
            'description': 'สร้างไอจีขายเสื้อผ้าและรองเท้าผ้าใบมือสอง ปั๊มยอดฟอลปลอม เปลี่ยนชื่อไอจีมาแล้วมากกว่า 5 ครั้ง เมื่อโอนเงินแล้วไม่ส่งของหรือส่งเศษผ้ามาแทน [Tags: แฟชั่น เสื้อผ้า เสื้อ กางเกง เดรส รองเท้า sneaker ผ้าใบ]',
            'comments': [],
        },
        {
            'name': 'ระวัง! สกินแคร์และครีมเคาน์เตอร์แบรนด์ปลอม ตัดราคา 70%',
            'url': 'https://www.thaipoliceonline.go.th/#case-fake-skincare',
            'platform': 'instagram',
            'status': 'pending',
            'description': 'แอบอ้างว่านำเข้าสกินแคร์และเครื่องสำอางแบรนด์ดังปลอดภาษี ลดราคา 70-80% แต่ส่งสินค้าลอกเลียนแบบที่เป็นอันตรายต่อผิวหน้า [Tags: สกินแคร์ เครื่องสำอาง ครีม แต่งหน้า เมคอัพ ความงาม บำรุงผิว ปลอม]',
            'comments': [],
        },
        {
            'name': 'มุกหลอกขายกระเป๋าแบรนด์เนมมือสอง ให้โอนเข้าบัญชีม้า',
            'url': 'https://www.thaipoliceonline.go.th/#case-brandname-bag',
            'platform': 'facebook',
            'status': 'scam',
            'description': 'โพสต์ขายกระเป๋าแบรนด์เนมและกระเป๋าสตางค์ในกลุ่มซื้อขาย ใช้บัตรประชาชนคนอื่นที่ขโมยมาสร้างความน่าเชื่อถือ แต่ชื่อบัญชีที่ให้โอนไม่ตรงกับบัตร [Tags: กระเป๋า แบรนด์เนม เป้ สะพาย ถุงผ้า wallet กระเป๋าสตางค์ มือสอง]',
            'comments': [],
        },
        {
            'name': 'เพจปลอมขายคูปองบุฟเฟต์ / วอยเชอร์ร้านอาหารดังราคาถูก',
            'url': 'https://www.thaipoliceonline.go.th/#case-food-voucher',
            'platform': 'facebook',
            'status': 'pending',
            'description': 'สร้างเพจเลียนแบบร้านอาหาร ขาย E-Voucher บุฟเฟต์และขนมแบบซื้อ 1 แถม 1 ให้สแกนจ่ายผ่าน QR บัญชีบุคคลธรรมดาแทนที่จะเป็นบัญชีบริษัท [Tags: ของกิน อาหาร ขนม คูปอง บุฟเฟต์ วอยเชอร์ เบเกอรี่]',
            'comments': [],
        },
        {
            'name': 'SMS แนบลิงก์ปลอมอ้างพัสดุตกค้าง / การไฟฟ้าคืนเงินค่าประกัน',
            'url': 'https://www.thaipoliceonline.go.th/#case-sms-phishing',
            'platform': 'x_twitter',
            'status': 'scam',
            'description': 'ส่ง SMS แนบลิงก์ย่อ bit.ly อ้างว่าพัสดุจัดส่งไม่สำเร็จหรือได้รับเงินคืนค่าไฟ หลอกให้แอดไลน์และติดตั้งแอป .apk เพื่อควบคุมมือถือดูดเงิน [Tags: ร้านค้า งานเสริม คอลเซ็นเตอร์ sms ลิงก์ปลอม บัญชีม้า กู้เงิน]',
            'comments': [],
        },
        {
            'name': 'หลอกส่งต่อไอแพด/มือถือมือสองหลุดจำนำ ราคาถูกผิดปกติ',
            'url': 'https://www.thaipoliceonline.go.th/#case-ipad-secondhand',
            'platform': 'facebook',
            'status': 'scam',
            'description': 'โพสต์ขายไอแพดสำหรับนักศึกษาอ้างว่าร้อนเงิน ไม่สะดวกนัดรับเพราะอยู่ต่างจังหวัด พอโอนเงินค่าเครื่องหรือค่ามัดจำแล้วปิดเฟซหนีทันที [Tags: ของใช้ ไอแพด มือถือ หอพัก แก้ว จิปาถะ เครื่องเขียน]',
            'comments': [],
        },
        {
            'name': 'แนวทางป้องกัน: 5 วิธีเช็กเพจขายเสื้อผ้า/รองเท้าใน IG ก่อนโอน',
            'url': 'https://www.thaipoliceonline.go.th/#guide-check-ig',
            'platform': 'instagram',
            'status': 'safe',
            'description': '1. กดดู "เกี่ยวกับบัญชีนี้" ว่าเปลี่ยนชื่อมากี่ครั้ง 2. เช็กชื่อบัญชีธนาคารกับ Blacklist 3. สังเกตรีวิวว่ามาจากแอคจริงไหม [Tags: แฟชั่น เสื้อผ้า รองเท้า sneaker กระเป๋า สกินแคร์]',
            'comments': [],
        },
        {
            'name': 'แนวทางป้องกัน: วิธีตรวจสอบคนรับหิ้วของ K-Pop & Art Toy ไม่ให้โดนบิด',
            'url': 'https://www.thaipoliceonline.go.th/#guide-kpop-arttoy',
            'platform': 'x_twitter',
            'status': 'safe',
            'description': 'ห้ามโอนบัญชีที่ไม่ตรงกับชื่อผู้ขาย ขอหลักฐานใบเสร็จการกดสั่งซื้อจริง และนำเลขบัญชีมาตรวจในระบบ HiuHiu ก่อนโอนเงินทุกครั้ง [Tags: k-pop art toy ของเล่น คอนเสิร์ต พรีออเดอร์ หิ้ว]',
            'comments': [],
        },
    ]

    all_shops = list(Shop.objects.all().order_by('id'))
    users = list(User.objects.all()[:3])

    # Clear old reviews so no old shop reviews remain
    Review.objects.all().delete()

    kept_ids = []
    for idx, case in enumerate(scam_cases):
        if idx < len(all_shops):
            shop = all_shops[idx]
        else:
            shop = Shop()
        shop.name = case['name']
        shop.url = case['url']
        shop.platform = case['platform']
        shop.status = case['status']
        shop.description = case['description']
        shop.save()
        kept_ids.append(shop.id)

        # Add realistic warning comments
        for c_idx, (rating, comment_text) in enumerate(case['comments']):
            if users:
                u = users[c_idx % len(users)]
                Review.objects.update_or_create(
                    shop=shop,
                    user=u,
                    defaults={'rating': rating, 'comment': comment_text},
                )

    # Delete remaining third-party shop records so zero external shops remain
    deleted_count, _ = Shop.objects.exclude(id__in=kept_ids).delete()
    print(f'Updated {len(kept_ids)} scam cases and removed {deleted_count} old third-party shop records.')

if __name__ == '__main__':
    run()
