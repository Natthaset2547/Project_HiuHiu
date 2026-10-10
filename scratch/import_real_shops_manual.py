import os
import sys
import django
import urllib.request
import time

sys.path.append(os.path.join(os.getcwd(), 'hiu-hiu backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_api.settings')
django.setup()

from shops.models import Shop

real_shops = [
    {
        "name": "cintageshop",
        "url": "https://www.instagram.com/cintageshop/",
        "platform": "instagram",
        "desc": "CINTAGE OFFICIAL🎀\n• LINE: @cintageshop\n• หน้าร้าน: Siam Square Soi 6"
    },
    {
        "name": "matchbox.official",
        "url": "https://www.instagram.com/matchbox.official/",
        "platform": "instagram",
        "desc": "MATCHBOX Multi-brand store\n• Siam Square, Megabangna, Central Ladprao, Zpell, Central Pinklao"
    },
    {
        "name": "mitr",
        "url": "https://www.instagram.com/mitr/",
        "platform": "instagram",
        "desc": "MITR | Everyday feminine wear\n• LINE: @mitr\n• Central World & Emporium"
    },
    {
        "name": "basicsbysita",
        "url": "https://www.instagram.com/basicsbysita/",
        "platform": "instagram",
        "desc": "BASICS BY SITA ☁️\n• The original basic wear\n• Order via LINE: @basicsbysita"
    },
    {
        "name": "flat2112",
        "url": "https://www.instagram.com/flat2112/",
        "platform": "instagram",
        "desc": "FLAT2112 👗\n• Fashion & Clothing\n• BKK, TH 🇹🇭"
    },
    {
        "name": "pomelofashion",
        "url": "https://www.instagram.com/pomelofashion/",
        "platform": "instagram",
        "desc": "Pomelo Fashion\n• Fashion everywhere you go\n• Shop in-app & online & in-store"
    },
    {
        "name": "tresfashion.co",
        "url": "https://www.instagram.com/tresfashion.co/",
        "platform": "instagram",
        "desc": "TRES. Fashion\n• Multi-brand store in Siam Square Soi 5\n• Everyday 12.00 - 21.00"
    },
    {
        "name": "gotchaofficial",
        "url": "https://www.instagram.com/gotchaofficial/",
        "platform": "instagram",
        "desc": "GOTCHA | Bags & Accessories\n• Premium PU Leather\n• LINE: @gotchaofficial"
    },
    {
        "name": "ninetiesdesign",
        "url": "https://www.instagram.com/ninetiesdesign/",
        "platform": "instagram",
        "desc": "NINETIES DESIGN 🌈\n• Colorful everyday wear\n• LINE SHOPPING & Shopee"
    },
    {
        "name": "salisa_official",
        "url": "https://www.instagram.com/salisa_official/",
        "platform": "instagram",
        "desc": "SALISA 🖤\n• Modern Women's Apparel\n• Available online and at Siam Center"
    },
    {
        "name": "Merge Official",
        "url": "https://www.facebook.com/merge.official.th",
        "platform": "facebook",
        "desc": "Merge Official เสื้อผ้าแฟชั่นสไตล์มินิมอล ใส่สบายได้ทุกวัน"
    },
    {
        "name": "Rally Movement",
        "url": "https://www.instagram.com/rallymovement/",
        "platform": "instagram",
        "desc": "Rally Movement™\n• Contemporary clothing brand\n• Worldwide shipping"
    },
    {
        "name": "Gente Official",
        "url": "https://www.instagram.com/gente.official/",
        "platform": "instagram",
        "desc": "Gente Official 🤍\n• Premium Quality Shoes\n• LINE: @gente"
    },
    {
        "name": "Fallen Angels",
        "url": "https://twitter.com/fallenangels_th",
        "platform": "x_twitter",
        "desc": "Fallen Angels 🪽\nสตรีทแวร์ เครื่องประดับ Y2K พรีออเดอร์"
    },
    {
        "name": "K-Pop Merch TH",
        "url": "https://twitter.com/kpopmerch_th",
        "platform": "x_twitter",
        "desc": "K-Pop Merch Thailand\nรับพรีออเดอร์อัลบั้ม การ์ด และกู้ดส์ศิลปินเกาหลี 🇰🇷 ส่งตรงจากเกาหลีแท้ 100%"
    }
]

# Ensure media dir exists
media_dir = os.path.join(os.getcwd(), 'hiu-hiu backend', 'media', 'shops')
os.makedirs(media_dir, exist_ok=True)

print("Starting to insert REAL Thai shops...")

# Wipe previous fake shops if any
Shop.objects.filter(description='ร้านค้ายอดนิยม (Seeded by AI)').delete()
Shop.objects.filter(name__startswith='cute_').delete()
Shop.objects.filter(name__startswith='beauty_').delete()

count = 0
for shop in real_shops:
    try:
        # Check if exists
        if Shop.objects.filter(url=shop['url']).exists():
            continue
            
        print(f"Adding {shop['name']}...")
        
        # Download logo from UI-Avatars
        # Replace spaces for the URL
        avatar_name = shop['name'].replace(' ', '+').replace('.', '')
        img_url = f"https://ui-avatars.com/api/?name={avatar_name}&background=random&color=fff&size=200&font-size=0.33"
        img_filename = f"{avatar_name}_logo.png"
        img_path = os.path.join(media_dir, img_filename)
        
        # Download image with a User-Agent
        req = urllib.request.Request(img_url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response, open(img_path, 'wb') as out_file:
            out_file.write(response.read())
            
        Shop.objects.create(
            name=shop['name'],
            url=shop['url'],
            platform=shop['platform'],
            status='safe',
            description=shop['desc'],
            image=f"shops/{img_filename}"
        )
        count += 1
        time.sleep(0.5)
        
    except Exception as e:
        print(f"Error adding {shop['name']}: {e}")

print(f"Successfully added {count} REAL shops with logos and descriptions!")
