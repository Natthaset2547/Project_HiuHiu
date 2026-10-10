import os
import sys
import django

sys.path.append(os.path.join(os.getcwd(), 'hiu-hiu backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_api.settings')
django.setup()

from shops.models import Shop

bad_shop = Shop.objects.filter(url__icontains="KrispyKremeTH").first()
if bad_shop:
    bad_shop.name = "KFC Thailand"
    bad_shop.url = "https://twitter.com/kfcth"
    bad_shop.description = "KFC Thailand 🍗\n• ไก่ทอดผู้พัน ของกิน อาหาร และโปรโมชั่นสุดคุ้ม\n\n[Tags: ของกิน ขนม อาหารเสริม]"
    bad_shop.save()
    print("Replaced Krispy Kreme with KFC Thailand")
else:
    print("Shop not found")
