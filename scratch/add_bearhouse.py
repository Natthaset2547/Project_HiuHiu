import os
import sys
import django

sys.path.append(os.path.join(os.getcwd(), 'hiu-hiu backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_api.settings')
django.setup()

from shops.models import Shop

if not Shop.objects.filter(name__icontains="Bearhouse").exists():
    Shop.objects.create(
        name="Bearhouse",
        url="https://www.instagram.com/bearhouse_thailand/",
        platform="instagram",
        status="safe",
        description="Bearhouse 🧋\n• ร้านชานมไข่มุกโมจิโดยพี่กานต์พี่ซาน (Sunbeary & KNN) เครื่องดื่มและขนมยอดฮิต\n\n[Tags: ของกิน ขนม อาหารเสริม]",
        image=None
    )
    print("Successfully added Bearhouse!")
else:
    print("Bearhouse already exists.")
