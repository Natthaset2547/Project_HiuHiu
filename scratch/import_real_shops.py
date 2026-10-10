import os
import sys
import django
import instaloader
import urllib.request
import time

sys.path.append(os.path.join(os.getcwd(), 'hiu-hiu backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_api.settings')
django.setup()

from shops.models import Shop

real_shops = [
    "cintageshop",
    "matchbox.official",
    "mitr",
    "lovetoothailand",
    "flat2112",
    "basicsbysita",
    "lookbooklookbook",
    "kimmamesshop",
    "sense.th",
    "camp.bkk",
    "salisa_official",
    "pomelofashion",
    "tresfashion.co",
    "gotchaofficial",
    "jellyplease",
    "kannistudio",
    "stolenstores",
    "ninetiesdesign",
    "ruged_th",
    "daily.squad"
]

L = instaloader.Instaloader()

# Ensure media dir exists
media_dir = os.path.join(os.getcwd(), 'hiu-hiu backend', 'media', 'shops')
os.makedirs(media_dir, exist_ok=True)

print("Starting to fetch real IG shops...")

for shop_name in real_shops:
    try:
        # Check if already exists
        if Shop.objects.filter(url__icontains=shop_name).exists():
            print(f"Skipping {shop_name}, already in database.")
            continue
            
        print(f"Fetching {shop_name}...")
        profile = instaloader.Profile.from_username(L.context, shop_name)
        
        # Download image
        img_url = profile.profile_pic_url
        img_filename = f"{shop_name}.jpg"
        img_path = os.path.join(media_dir, img_filename)
        urllib.request.urlretrieve(img_url, img_path)
        
        # Get bio
        bio = profile.biography
        if not bio:
            bio = f"ร้านเสื้อผ้าแบรนด์ไทยยอดฮิตใน Instagram: {profile.full_name}"
            
        Shop.objects.create(
            name=profile.full_name or shop_name,
            url=f"https://www.instagram.com/{shop_name}/",
            platform='instagram',
            status='safe',
            description=bio,
            image=f"shops/{img_filename}"
        )
        print(f"Added {shop_name} successfully!")
        
        # Sleep to avoid rate limits
        time.sleep(2)
        
    except Exception as e:
        print(f"Error fetching {shop_name}: {e}")

print("Finished importing real shops!")
