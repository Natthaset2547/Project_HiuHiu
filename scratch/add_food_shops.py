import os
import sys
import django

sys.path.append(os.path.join(os.getcwd(), 'hiu-hiu backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_api.settings')
django.setup()

from shops.models import Shop

food_shops = [
    # FACEBOOK (2 shops)
    {
        "name": "Jones' Salad",
        "url": "https://www.facebook.com/JonesSaladThailand/",
        "platform": "facebook",
        "desc": "Jones' Salad\n• ร้านอาหารเพื่อสุขภาพ ของกิน สลัด และอาหารเสริมสำหรับคนรักสุขภาพ"
    },
    {
        "name": "Diamond Grains",
        "url": "https://www.facebook.com/diamondgrains/",
        "platform": "facebook",
        "desc": "Diamond Grains กราโนล่าคลีน\n• ขนม และ ของกิน คลีนๆ ไฟเบอร์สูง ดีต่อสุขภาพ อาหารเสริมยามเช้า"
    },
    
    # INSTAGRAM (2 shops)
    {
        "name": "Wink White Official",
        "url": "https://www.instagram.com/winkwhite_ceo/",
        "platform": "instagram",
        "desc": "WINK WHITE 💎\n• อาหารเสริม เพื่อสุขภาพและผิวพรรณ โปรตีน คอลลาเจน วิตามิน"
    },
    {
        "name": "KariKori Thailand",
        "url": "https://www.instagram.com/karikorithailand/",
        "platform": "instagram",
        "desc": "KariKori น้ำแข็งไสญี่ปุ่น 🍧\n• ขนม หวานเย็น ของกิน คลายร้อน สาขาเพียบ"
    },
    
    # X (TWITTER) (2 shops)
    {
        "name": "Planto Monster",
        "url": "https://twitter.com/plantomonster",
        "platform": "x_twitter",
        "desc": "Planto Monster 🌿\n• แพลนต์เบสโปรตีน อาหารเสริม โปรตีนพืช รสช็อกโกแลต ของกิน คลีน"
    },
    {
        "name": "Nims Crispy Choco Tub",
        "url": "https://twitter.com/NimsChocoTH",
        "platform": "x_twitter",
        "desc": "Nims Crispy Choco Tub 🍫\n• ขนม ช็อกโกแลตกระปุก ของกิน เล่นยอดฮิต อร่อยเคี้ยวเพลิน"
    }
]

print("Starting to insert 6 Food/Supplement shops...")
count = 0
for shop in food_shops:
    try:
        if Shop.objects.filter(url=shop['url']).exists():
            continue
            
        Shop.objects.create(
            name=shop['name'],
            url=shop['url'],
            platform=shop['platform'],
            status='safe',
            description=shop['desc'],
            image=None
        )
        count += 1
    except Exception as e:
        print(f"Error adding {shop['name']}: {e}")

print(f"Successfully added {count} NEW Food/Supplement shops!")
