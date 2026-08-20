from urllib.parse import urlparse

from django.core.exceptions import ValidationError
from django.db import models


def normalize_risk_identifier(identifier_type, value):
    cleaned = str(value).strip()
    if not cleaned:
        return ''

    if identifier_type == 'bank_account':
        digits = ''.join(character for character in cleaned if character.isdigit())
        return digits if 8 <= len(digits) <= 30 else ''

    if identifier_type == 'shop_link':
        if '://' not in cleaned:
            cleaned = f'https://{cleaned}'
        parsed = urlparse(cleaned)
        if parsed.scheme not in {'http', 'https'} or not parsed.hostname:
            return ''

        host = parsed.hostname.casefold()
        if host.startswith('www.'):
            host = host[4:]
        path = '/'.join(segment for segment in parsed.path.casefold().split('/') if segment)
        return f'{host}/{path}' if path else host

    return ''.join(character for character in cleaned.casefold() if character.isalnum())

class Shop(models.Model):
    # กำหนดตัวเลือกสำหรับแพลตฟอร์ม
    PLATFORM_CHOICES = [
        ('facebook', 'Facebook'),
        ('instagram', 'Instagram'),
        ('x_twitter', 'X (Twitter)'),
    ]

    # กำหนดตัวเลือกสำหรับสถานะความน่าเชื่อถือ
    STATUS_CHOICES = [
        ('safe', 'ปลอดภัย (สีเขียว)'),
        ('pending', 'กำลังตรวจสอบ (สีเหลือง)'),
        ('scam', 'มิจฉาชีพ (สีแดง)'),
    ]

    name = models.CharField(max_length=255, verbose_name="ชื่อร้านค้า")
    url = models.URLField(max_length=500, unique=True, verbose_name="ลิงก์ร้านค้า (Deep Link)")
    platform = models.CharField(max_length=50, choices=PLATFORM_CHOICES, verbose_name="แพลตฟอร์ม")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending', verbose_name="สถานะความน่าเชื่อถือ")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="วันที่เพิ่มข้อมูล")
    
    description = models.TextField(null=True, blank=True, verbose_name="คำอธิบายร้านค้า")
    image = models.ImageField(upload_to='shops/', null=True, blank=True, verbose_name="รูปร้านค้า")

    def __str__(self):
        return f"{self.name} ({self.get_platform_display()})"


class RiskRecord(models.Model):
    IDENTIFIER_TYPE_CHOICES = [
        ('shop_name', 'ชื่อร้านค้า'),
        ('shop_link', 'ลิงก์ร้านค้า'),
        ('bank_account', 'เลขบัญชี'),
        ('account_owner', 'ชื่อเจ้าของบัญชี'),
    ]

    STATUS_CHOICES = [
        ('safe', 'ปลอดภัย'),
        ('pending', 'กำลังตรวจสอบ'),
        ('scam', 'ควรระวัง'),
    ]

    identifier_type = models.CharField(max_length=30, choices=IDENTIFIER_TYPE_CHOICES)
    identifier = models.CharField(max_length=500)
    normalized_identifier = models.CharField(max_length=500, db_index=True, editable=False)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    source_name = models.CharField(max_length=255, default='ผู้ดูแลระบบ')
    evidence_url = models.URLField(max_length=500, blank=True)
    notes = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['identifier_type', 'normalized_identifier'],
                name='unique_risk_record_identifier',
            ),
        ]
        ordering = ['-updated_at']

    def clean(self):
        normalized_identifier = normalize_risk_identifier(
            self.identifier_type,
            self.identifier,
        )
        if not normalized_identifier:
            label = dict(self.IDENTIFIER_TYPE_CHOICES).get(self.identifier_type, 'ข้อมูล')
            raise ValidationError({'identifier': f'{label}ไม่ถูกต้อง'})
        self.normalized_identifier = normalized_identifier

    def save(self, *args, **kwargs):
        self.normalized_identifier = normalize_risk_identifier(
            self.identifier_type,
            self.identifier,
        )
        super().save(*args, **kwargs)

    def __str__(self):
        return f'{self.get_identifier_type_display()}: {self.identifier}'


class Banner(models.Model):
    title = models.CharField(max_length=255, blank=True)
    subtitle = models.TextField(blank=True)
    image = models.ImageField(upload_to='banners/')
    link = models.URLField(max_length=500, blank=True)
    is_active = models.BooleanField(default=True)
    sort_order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['sort_order', '-created_at']

    def __str__(self):
        return self.title or f'Banner {self.pk}'