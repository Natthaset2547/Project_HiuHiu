import os
import sys
import django

sys.path.append(os.path.join(os.getcwd(), 'hiu-hiu backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_api.settings')
django.setup()

from shops.models import Shop

# Replace Nims
s1 = Shop.objects.filter(name__icontains="Nims Crispy").first()
if s1:
    s1.name = "Bearhouse"
    s1.url = "https://twitter.com/bearhouseth"
    s1.description = "Bearhouse 🧋\n• ชานมไข่มุกโมจิ ขนม ของกิน และเครื่องดื่ม แบรนด์ของคนไทย"
    s1.save()
    print("Replaced Nims with Bearhouse")

# Replace Jones
s2 = Shop.objects.filter(name__icontains="Jones").first()
if s2:
    s2.name = "สวนผัก โอ้กะจู๋ (Ohkajhu)"
    s2.url = "https://www.facebook.com/ohkajhu"
    s2.description = "สวนผัก โอ้กะจู๋ 🥗\n• ร้านอาหารเพื่อสุขภาพ สลัดผักออร์แกนิค อาหารเสริมสุขภาพ และของกินเพื่อสุขภาพ"
    s2.save()
    print("Replaced Jones with Ohkajhu")

