from django.conf import settings
import sys

def print_db():
    print(settings.DATABASES['default'])

if __name__ == '__main__':
    import os
    import django
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_api.settings')
    django.setup()
    print_db()
