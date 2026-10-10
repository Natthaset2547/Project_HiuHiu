import os
import sys
import django

sys.path.append(os.path.join(os.getcwd(), 'hiu-hiu backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_api.settings')
django.setup()

from shops.models import Shop, RiskRecord
import random

# Get the 100 seeded records
seeded = RiskRecord.objects.filter(notes='Seeded by AI')

count = 0
for r in seeded:
    url = r.identifier
    
    # parse platform
    platform_val = 'facebook'
    if 'instagram.com' in url:
        platform_val = 'instagram'
    elif 'twitter.com' in url or 'x.com' in url:
        platform_val = 'x_twitter'
    elif 'facebook.com' in url:
        platform_val = 'facebook'
        
    # parse name (get the last part of url)
    name = url.rstrip('/').split('/')[-1]
    
    # Try to insert into Shop
    try:
        Shop.objects.create(
            name=name,
            url=url,
            platform=platform_val,
            status='safe',
            description='ร้านค้ายอดนิยม (Seeded by AI)'
        )
        count += 1
    except Exception as e:
        print(f"Skipping {url}: {e}")

# Delete from RiskRecord
seeded.delete()

print(f"Successfully moved {count} shops into Whitelist!")
