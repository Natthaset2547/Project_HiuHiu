import os
import sys
import random
import django

sys.path.append(os.path.join(os.getcwd(), 'hiu-hiu backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_api.settings')
django.setup()

from shops.models import RiskRecord

platforms = [
    ('https://www.instagram.com/', 'IG'),
    ('https://www.facebook.com/', 'FB'),
    ('https://twitter.com/', 'X')
]

shop_names = [
    "cute_clothes", "beauty_store", "bag_fashion", "toy_collector", "lifestyle_shop",
    "healthy_food", "kpop_merch", "preorder_japan", "korean_style", "makeup_lover",
    "luxury_bags", "arttoy_th", "cute_mug", "snack_box", "idol_goods", "preorder_korea",
    "vintage_clothing", "skincare_routine", "leather_bag", "blindbox_th", "home_decor",
    "diet_supplement", "concert_ticket", "us_preorder", "streetwear_bkk", "organic_beauty",
    "canvas_tote", "gachapon_th", "stationery_cute", "homemade_bakery", "photocard_trade",
    "uk_preorder", "minimal_style", "perfume_shop", "brandname_bag", "bearbrick_th",
    "kitchenware", "keto_food", "album_kpop", "china_preorder", "jeans_fashion",
    "lipstick_lover", "backpack_th", "popmart_th", "gift_shop", "clean_food",
    "lightstick_kpop", "taiwan_preorder", "sneaker_head", "sunscreen_shop"
]

adjectives = ["_official", "_shop", "_store", "_bkk", "_th", "_online", "_boutique"]

print("Seeding 100 shops...")

RiskRecord.objects.filter(identifier_type='social_link', status='safe', notes='Seeded by AI').delete()

for i in range(100):
    base_name = random.choice(shop_names)
    suffix = random.choice(adjectives) if random.random() > 0.5 else ""
    shop_id = f"{base_name}{suffix}{random.randint(1, 9999)}"
    
    platform_url, platform_name = random.choice(platforms)
    full_url = f"{platform_url}{shop_id}"
    
    record = RiskRecord(
        identifier_type='social_link',
        identifier=full_url,
        status='safe',
        notes='Seeded by AI'
    )
    record.save()

print("Successfully seeded 100 dummy shops with correct platforms!")
