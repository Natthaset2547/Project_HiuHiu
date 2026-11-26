import json
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_api.settings')
django.setup()

from django.contrib.auth.models import User
from shops.models import UserProfile, RiskRecord, RiskEvidence, Banner

def export_all():
    data = {
        'users': [
            {
                'id': u.id,
                'username': u.username,
                'email': u.email,
                'password': u.password,
                'is_staff': u.is_staff,
                'is_superuser': u.is_superuser,
                'is_active': u.is_active,
            }
            for u in User.objects.using('local_mysql').all()
        ],
        'profiles': [
            {
                'user_id': p.user_id,
                'avatar': p.avatar.name if p.avatar else None,
            }
            for p in UserProfile.objects.using('local_mysql').all()
        ],
        'risk_records': [
            {
                'id': r.id,
                'identifier_type': r.identifier_type,
                'identifier': r.identifier,
                'normalized_identifier': r.normalized_identifier,
                'status': r.status,
                'source_name': r.source_name,
                'evidence_url': r.evidence_url,
                'evidence_image': r.evidence_image.name if r.evidence_image else None,
                'notes': r.notes,
                'is_active': r.is_active,
            }
            for r in RiskRecord.objects.using('local_mysql').all()
        ],
        'evidences': [
            {
                'record_id': e.record_id,
                'image': e.image.name if e.image else None,
            }
            for e in RiskEvidence.objects.using('local_mysql').all()
        ],
        'banners': [
            {
                'id': b.id,
                'title': b.title,
                'subtitle': b.subtitle,
                'image': b.image.name if b.image else None,
                'link': b.link,
                'button_type': b.button_type,
                'is_active': b.is_active,
                'sort_order': b.sort_order,
            }
            for b in Banner.objects.using('local_mysql').all()
        ],
    }
    out_path = r'D:\project\scratch\mysql_full_export.json'
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print('EXPORT_OK:', len(data['users']), 'users,', len(data['risk_records']), 'risk_records')

if __name__ == '__main__':
    export_all()
