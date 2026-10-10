import os
import sys
import django

sys.path.append(os.path.join(os.getcwd(), 'hiu-hiu backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_api.settings')
django.setup()

from shops.models import Shop

# First, remove images from the previously added real shops (we can just find all logos)
# Since I used image=f"shops/{avatar_name}_logo.png", I can just find them and clear the image.
shops_to_clear = Shop.objects.filter(image__icontains='_logo.png')
for s in shops_to_clear:
    s.image = None
    s.save()
print(f"Cleared images from {shops_to_clear.count()} shops.")

more_real_shops = [
    # FACEBOOK
    {
        "name": "GENTLEWOMAN",
        "url": "https://www.facebook.com/gentlewomanstore/",
        "platform": "facebook",
        "desc": "GENTLEWOMAN Store\n• แบรนด์เสื้อผ้าและกระเป๋ายอดฮิตของผู้หญิงยุคใหม่"
    },
    {
        "name": "EVEANDBOY",
        "url": "https://www.facebook.com/eveandboy/",
        "platform": "facebook",
        "desc": "EVEANDBOY\n• The Underground Beauty Destination\n• อาณาจักรเครื่องสำอางของแท้"
    },
    {
        "name": "BEAUTRIUM",
        "url": "https://www.facebook.com/beautrium/",
        "platform": "facebook",
        "desc": "BEAUTRIUM บิวเทรี่ยม\n• ศูนย์รวมเครื่องสำอาง น้ำหอม สกินแคร์ ของแท้ 100%"
    },
    {
        "name": "Carnival Store",
        "url": "https://www.facebook.com/carnivalbkk/",
        "platform": "facebook",
        "desc": "Carnival Store\n• ร้านรองเท้า Sneakers และ Streetwear อันดับ 1 ของไทย"
    },
    {
        "name": "Kloset & Etcetera",
        "url": "https://www.facebook.com/klosetdesign/",
        "platform": "facebook",
        "desc": "Kloset & Etcetera\n• กระเป๋า เครื่องประดับ และเสื้อผ้าแบรนด์ไทยดีไซน์เอกลักษณ์"
    },
    {
        "name": "UNIQLO THAILAND",
        "url": "https://www.facebook.com/uniqlo.th/",
        "platform": "facebook",
        "desc": "UNIQLO THAILAND\n• LifeWear เสื้อผ้าคุณภาพสูง ใส่สบาย สำหรับทุกคน"
    },
    {
        "name": "H&M Thailand",
        "url": "https://www.facebook.com/hmthailand/",
        "platform": "facebook",
        "desc": "H&M Thailand\n• แฟชั่นเสื้อผ้าสำหรับผู้หญิง ผู้ชาย และเด็ก อัปเดตเทรนด์ใหม่ล่าสุด"
    },
    {
        "name": "Camp BKK",
        "url": "https://www.facebook.com/Campbkk/",
        "platform": "facebook",
        "desc": "CAMP Multi-brand Store\n• แหล่งรวมแบรนด์ดังในไอจีมาไว้ที่เดียว สยามสแควร์"
    },
    {
        "name": "Jelly Please",
        "url": "https://www.facebook.com/jellyplease/",
        "platform": "facebook",
        "desc": "Jelly Please\n• เสื้อผ้าสไตล์หวานๆ มินิมอล ลูกคุณหนู ใส่ไปคาเฟ่"
    },
    {
        "name": "Kanni Studio",
        "url": "https://www.facebook.com/kannistudio/",
        "platform": "facebook",
        "desc": "Kanni Studio\n• ชุดทำงานและชุดไปเที่ยว สไตล์เรียบหรูดูแพง"
    },
    
    # X (TWITTER)
    {
        "name": "Ktown4u Thailand",
        "url": "https://twitter.com/Ktown4u_TH",
        "platform": "x_twitter",
        "desc": "Ktown4u TH 🇹🇭\n• ร้านขายอัลบั้มและสินค้า K-POP ส่งตรงจากเกาหลี"
    },
    {
        "name": "POP MART Thailand",
        "url": "https://twitter.com/popmartth",
        "platform": "x_twitter",
        "desc": "POP MART THAILAND\n• อาร์ตทอยกล่องสุ่ม (Blind Box) ลิขสิทธิ์แท้ 100%"
    },
    {
        "name": "SM True",
        "url": "https://twitter.com/SMTrueThailand",
        "platform": "x_twitter",
        "desc": "SM True Official\n• สินค้า Official (MD) และบัตรคอนเสิร์ตศิลปินค่าย SM Entertainment"
    },
    {
        "name": "Applewood Thailand",
        "url": "https://twitter.com/applewood_th",
        "platform": "x_twitter",
        "desc": "APPLEWOOD THAILAND\n• ผู้จัดคอนเสิร์ตและขายสินค้า Official กู้ดส์ K-Pop"
    },
    {
        "name": "GMMTV",
        "url": "https://twitter.com/GMMTV",
        "platform": "x_twitter",
        "desc": "GMMTV Official\n• GMMTV Shop ขายสินค้าซีรีส์ แท่งไฟ และแฟนมีตติ้ง"
    },
    {
        "name": "Pre-order Korea by K",
        "url": "https://twitter.com/korea_preorder_k",
        "platform": "x_twitter",
        "desc": "ร้านรับพรีเกาหลี 🇰🇷\n• รับกดเว็บเกาหลี เครื่องสำอาง เสื้อผ้า รองเท้า ส่งแอร์/เรือ"
    },
    {
        "name": "NCT Dream Center TH",
        "url": "https://twitter.com/NCTDREAMCENTER",
        "platform": "x_twitter",
        "desc": "NCT DREAM CENTER 💚\n• รับกดบัตรพรีออเดอร์อัลบั้ม การ์ด NCT ตามหาของแรร์"
    },
    {
        "name": "Bunjang Thailand",
        "url": "https://twitter.com/bunjangth",
        "platform": "x_twitter",
        "desc": "Bunjang TH 📦\n• รับกดของมือสองจากแอป Bunjang เกาหลี เรทถูก ส่งไว"
    },
    {
        "name": "Animate Bangkok",
        "url": "https://twitter.com/animatejma_bkk",
        "platform": "x_twitter",
        "desc": "animate Bangkok 🇯🇵\n• ร้านขายสินค้าอนิเมะ มังงะ ไลท์โนเวล ลิขสิทธิ์แท้จากญี่ปุ่น MBK Center"
    },
    {
        "name": "Kino Store TH",
        "url": "https://twitter.com/kinokuniyath",
        "platform": "x_twitter",
        "desc": "Kinokuniya Thailand 📚\n• หนังสือต่างประเทศ อาร์ตบุ๊ค อนิเมะกู้ดส์ สาขาพารากอน และเซ็นทรัลเวิลด์"
    }
]

print("Starting to insert 20 new Facebook and X shops...")
count = 0
for shop in more_real_shops:
    try:
        # Check if exists
        if Shop.objects.filter(url=shop['url']).exists():
            continue
            
        Shop.objects.create(
            name=shop['name'],
            url=shop['url'],
            platform=shop['platform'],
            status='safe',
            description=shop['desc'],
            image=None  # Explicitly set no image per user request
        )
        count += 1
    except Exception as e:
        print(f"Error adding {shop['name']}: {e}")

print(f"Successfully added {count} NEW shops (FB and X) without images!")
