from urllib.parse import urlparse

from rest_framework import serializers
from .models import Banner, RiskRecord, RiskEvidence, Shop, normalize_risk_identifier


class RiskEvidenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = RiskEvidence
        fields = ['id', 'image', 'created_at']


def normalize_shop_url(value):
    if value is None:
        raise serializers.ValidationError('กรุณากรอกลิงก์ร้านค้า')

    cleaned = str(value).strip()
    if not cleaned:
        raise serializers.ValidationError('กรุณากรอกลิงก์ร้านค้า')

    normalized = cleaned if cleaned.lower().startswith(('http://', 'https://')) else f'https://{cleaned}'
    parsed = urlparse(normalized)

    if parsed.scheme not in {'http', 'https'} or not parsed.netloc:
        raise serializers.ValidationError('URL ร้านค้าไม่ถูกต้อง ต้องเป็น http:// หรือ https://')

    return normalized


class ShopSerializer(serializers.ModelSerializer):
    url = serializers.URLField(max_length=500)

    def validate_url(self, value):
        return normalize_shop_url(value)

    class Meta:
        model = Shop
        fields = '__all__'


class RiskRecordSerializer(serializers.ModelSerializer):
    normalized_identifier = serializers.CharField(read_only=True)
    evidences = RiskEvidenceSerializer(many=True, read_only=True)

    class Meta:
        model = RiskRecord
        fields = '__all__'

    def validate(self, attrs):
        identifier_type = attrs.get('identifier_type', self.instance.identifier_type if self.instance else '')
        identifier = attrs.get('identifier', self.instance.identifier if self.instance else '')
        normalized_identifier = normalize_risk_identifier(identifier_type, identifier)

        if not normalized_identifier:
            label = dict(RiskRecord.IDENTIFIER_TYPE_CHOICES).get(identifier_type, 'ข้อมูล')
            raise serializers.ValidationError({'identifier': f'{label}ไม่ถูกต้อง'})

        attrs['normalized_identifier'] = normalized_identifier
        return attrs


class BannerSerializer(serializers.ModelSerializer):
    link = serializers.URLField(max_length=500, required=False, allow_blank=True)

    class Meta:
        model = Banner
        fields = '__all__'