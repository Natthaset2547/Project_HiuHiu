import os
import django
from PIL import Image, ImageDraw, ImageFont

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_api.settings')
django.setup()

from shops.models import Shop

COVER_SPECS = [
    ("SCAM ALERT #01", "กลโกงบัตรคอนเสิร์ต & K-Pop", "ระวังมุกบัตรหลุดจอง เร่งโอนมัดจำใน X", (30, 27, 75), (124, 58, 237), "DANGER: HIGH RISK"),
    ("SCAM ALERT #02", "เพจปลอมพรีออเดอร์ Art Toy", "ยิงแอดตัดราคาช็อป โอนแล้วปิดเพจหนี", (69, 10, 10), (220, 38, 38), "DANGER: HIGH RISK"),
    ("SCAM ALERT #03", "หลอกเช่าหอพัก/คอนโดทิพย์", "ก๊อปรูปห้องสวย เร่งให้โอนมัดจำจองห้อง", (23, 37, 84), (37, 99, 235), "DANGER: HIGH RISK"),
    ("SCAM ALERT #04", "งานพาร์ทไทม์ ปั่นออเดอร์ทิพย์", "หลอกสำรองจ่ายค่าเปิดระบบ ถอนเงินไม่ได้", (76, 5, 25), (225, 29, 72), "DANGER: HIGH RISK"),
    ("SCAM ALERT #05", "ร้านเสื้อผ้าแฟชั่น IG ทิพย์", "ปั๊มฟอลปลอม เปลี่ยนชื่อไอจีบ่อย ไม่ส่งของ", (59, 7, 100), (147, 51, 234), "DANGER: HIGH RISK"),
    ("SCAM ALERT #06", "สกินแคร์ & ครีมแบรนด์ปลอม", "อ้างของหิ้วปลอดภาษี ลดราคา 70-80%", (67, 20, 7), (234, 88, 12), "WARNING: WATCHLIST"),
    ("SCAM ALERT #07", "หลอกขายกระเป๋าแบรนด์เนม", "สวมรอยบัตรประชาชนคนอื่น ให้โอนบัญชีม้า", (69, 10, 10), (185, 28, 28), "DANGER: HIGH RISK"),
    ("SCAM ALERT #08", "คูปองบุฟเฟต์ & วอยเชอร์ปลอม", "เพจปลอมขายโปร 1 แถม 1 โอนเข้าบัญชีบุคคล", (66, 32, 6), (217, 119, 6), "WARNING: WATCHLIST"),
    ("SCAM ALERT #09", "SMS ลิงก์ปลอม พัสดุตกค้าง", "แนบลิงก์ย่อ bit.ly หลอกลงแอปดูดเงิน", (69, 10, 10), (239, 68, 68), "DANGER: HIGH RISK"),
    ("SCAM ALERT #10", "หลอกขาย iPad / มือถือมือสอง", "อ้างร้อนเงิน ไม่นัดรับ โอนมัดจำแล้วบล็อก", (15, 23, 42), (71, 85, 105), "DANGER: HIGH RISK"),
    ("SAFETY GUIDE #11", "5 วิธีเช็กเพจเสื้อผ้า IG ก่อนโอน", "ดูประวัติเปลี่ยนชื่อเพจ & เช็กเลขบัญชี", (6, 78, 59), (16, 185, 129), "PREVENTION GUIDE"),
    ("SAFETY GUIDE #12", "วิธีเช็กคนรับหิ้ว K-Pop & Art Toy", "ห้ามโอนบัญชีไม่ตรงชื่อ ขอหลักฐานใบเสร็จ", (20, 83, 45), (34, 197, 94), "PREVENTION GUIDE"),
]

def get_font(size, bold=False):
    candidates = [
        r"C:\Windows\Fonts\leelawdb.ttf" if bold else r"C:\Windows\Fonts\leelawui.ttf",
        r"C:\Windows\Fonts\tahomabd.ttf" if bold else r"C:\Windows\Fonts\tahoma.ttf",
        r"C:\Windows\Fonts\arialbd.ttf" if bold else r"C:\Windows\Fonts\arial.ttf",
    ]
    for path in candidates:
        if os.path.exists(path):
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()

def make_covers():
    media_shops_dir = r"D:\project\hiu-hiu backend\media\shops"
    os.makedirs(media_shops_dir, exist_ok=True)

    font_tag = get_font(20, bold=True)
    font_title = get_font(38, bold=True)
    font_sub = get_font(24, bold=False)
    font_badge = get_font(18, bold=True)

    shops = list(Shop.objects.all().order_by('id'))
    for idx, shop in enumerate(shops):
        tag, title, sub, bg_dark, bg_accent, badge_text = COVER_SPECS[idx % len(COVER_SPECS)]
        w, h = 800, 500
        img = Image.new("RGB", (w, h), bg_dark)
        draw = ImageDraw.Draw(img)

        # Gradient background
        for y in range(h):
            ratio = y / h
            r = int(bg_dark[0] * (1 - ratio) + bg_accent[0] * ratio * 0.7)
            g = int(bg_dark[1] * (1 - ratio) + bg_accent[1] * ratio * 0.7)
            b = int(bg_dark[2] * (1 - ratio) + bg_accent[2] * ratio * 0.7)
            draw.line([(0, y), (w, y)], fill=(r, g, b))

        # Decorative circles / border frame
        draw.ellipse([w - 220, -80, w + 80, 220], fill=bg_accent)
        draw.rounded_rectangle([36, 96, w - 36, h - 36], radius=24, outline=(255, 255, 255), width=2)

        # Top tag pill (placed below the top-left heart and top-right badge)
        draw.rounded_rectangle([68, 126, 300, 168], radius=12, fill=(255, 255, 255))
        draw.text((84, 134), tag, fill=bg_dark, font=font_tag)

        # Main Thai Title & Subtitle
        draw.text((68, 205), title, fill=(255, 255, 255), font=font_title)
        draw.text((68, 268), sub, fill=(230, 230, 240), font=font_sub)

        # Bottom footer bar inside card
        draw.rounded_rectangle([68, 376, 460, 424], radius=12, fill=bg_dark)
        draw.text((88, 389), f"HiuHiu Anti-Scam • {badge_text}", fill=(255, 255, 255), font=font_badge)

        filename = f"antiscam_case_{idx + 1}.png"
        filepath = os.path.join(media_shops_dir, filename)
        img.save(filepath, "PNG")

        shop.image.name = f"shops/{filename}"
        shop.save()

    print(f"Generated and assigned {len(shops)} anti-scam cover images.")

if __name__ == "__main__":
    make_covers()
