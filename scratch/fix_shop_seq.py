import os
import sys
import django
from django.db import connection

sys.path.append(os.path.join(os.getcwd(), 'hiu-hiu backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_api.settings')
django.setup()

with connection.cursor() as cursor:
    cursor.execute("SELECT setval('shops_shop_id_seq', (SELECT MAX(id) FROM shops_shop));")
