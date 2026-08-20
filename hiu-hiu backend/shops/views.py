from urllib.parse import urlparse

import requests
from django.conf import settings
from django.contrib.auth import authenticate, get_user_model, login, logout
from django.contrib.auth.hashers import make_password
from django.middleware.csrf import get_token
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework.decorators import api_view
from rest_framework.permissions import BasePermission
from rest_framework.response import Response
from rest_framework import viewsets
from .models import Banner, RiskRecord, Shop, normalize_risk_identifier
from .serializers import BannerSerializer, RiskRecordSerializer, ShopSerializer


SOCIAL_HOST_ALIASES = {
    'm.facebook.com': 'facebook.com',
    'web.facebook.com': 'facebook.com',
    'mobile.twitter.com': 'x.com',
    'twitter.com': 'x.com',
}
SOCIAL_PROFILE_HOSTS = {'facebook.com', 'instagram.com', 'x.com'}


def normalize_identity(value):
    return ''.join(character for character in str(value).casefold() if character.isalnum())


def canonical_url(value):
    cleaned = str(value).strip()
    if not cleaned:
        return ''

    if '://' not in cleaned:
        host_candidate = cleaned.split('/', 1)[0]
        if '.' not in host_candidate:
            return ''
        cleaned = f'https://{cleaned}'

    parsed = urlparse(cleaned)
    if parsed.scheme not in {'http', 'https'} or not parsed.hostname:
        return ''

    host = parsed.hostname.casefold()
    if host.startswith('www.'):
        host = host[4:]
    host = SOCIAL_HOST_ALIASES.get(host, host)
    path = '/'.join(segment for segment in parsed.path.casefold().split('/') if segment)
    return f'{host}/{path}' if path else host


def profile_key(url):
    host, separator, path = url.partition('/')
    if not separator or host not in SOCIAL_PROFILE_HOSTS or not path:
        return ''

    handle = normalize_identity(path.split('/', 1)[0])
    return f'{host}:{handle}' if handle else ''


def shop_lookup_keys(shop):
    keys = set()
    name = normalize_identity(shop.name)
    if name:
        keys.add(f'name:{name}')
        keys.add(f'handle:{name}')

    url = canonical_url(shop.url)
    if url:
        keys.add(f'url:{url}')
        profile = profile_key(url)
        if profile:
            keys.add(f'profile:{profile}')
            keys.add(f'handle:{profile.rsplit(":", 1)[1]}')
    return keys


def query_lookup_keys(query):
    keys = set()
    normalized = normalize_identity(query)
    if normalized:
        keys.add(f'name:{normalized}')
        keys.add(f'handle:{normalized}')

    url = canonical_url(query)
    if url:
        keys.add(f'url:{url}')
        profile = profile_key(url)
        if profile:
            keys.add(f'profile:{profile}')
    return keys


def find_matching_shops(query):
    query_keys = query_lookup_keys(query)
    if not query_keys:
        return []

    return [
        shop
        for shop in Shop.objects.all()
        if query_keys.intersection(shop_lookup_keys(shop))
    ]


def find_matching_risk_records(query):
    query_values = {
        identifier_type: normalize_risk_identifier(identifier_type, query)
        for identifier_type, _ in RiskRecord.IDENTIFIER_TYPE_CHOICES
    }

    return [
        record
        for record in RiskRecord.objects.filter(is_active=True)
        if query_values.get(record.identifier_type) == record.normalized_identifier
    ]


def local_risk_response(query):
    matching_records = find_matching_risk_records(query)
    if matching_records:
        statuses = {record.status for record in matching_records}
        sources = ', '.join(dict.fromkeys(record.source_name for record in matching_records))

        if 'scam' in statuses:
            return {
                'status': 'scam',
                'message': 'พบข้อมูลที่ผู้ดูแลระบบระบุว่าควรระวัง',
                'bad_records_found': len(matching_records),
                'source': 'registry',
                'record_sources': sources,
                'disclaimer': 'โปรดตรวจสอบหลักฐานและติดต่อหน่วยงานที่เกี่ยวข้องก่อนทำรายการ',
            }

        if 'safe' in statuses:
            return {
                'status': 'safe',
                'message': 'พบข้อมูลที่ผู้ดูแลระบบยืนยันแล้ว',
                'bad_records_found': 0,
                'source': 'registry',
                'record_sources': sources,
                'disclaimer': 'สถานะนี้อ้างอิงจากแหล่งข้อมูลที่ผู้ดูแลระบบบันทึกไว้ ไม่ใช่การรับรองความปลอดภัย 100%',
            }

        return {
            'status': 'pending',
            'message': 'พบข้อมูลในทะเบียน แต่ยังอยู่ระหว่างการตรวจสอบ',
            'bad_records_found': 0,
            'source': 'registry',
            'record_sources': sources,
            'disclaimer': 'โปรดตรวจสอบข้อมูลเพิ่มเติมก่อนทำรายการ',
        }

    matching_shops = find_matching_shops(query)
    if not matching_shops:
        return None

    statuses = {shop.status for shop in matching_shops}
    matched_names = ', '.join(shop.name for shop in matching_shops[:3])

    if 'scam' in statuses:
        return {
            'status': 'scam',
            'message': 'พบข้อมูลร้านค้าที่ผู้ดูแลระบบระบุว่าควรระวัง',
            'bad_records_found': 0,
            'source': 'whitelist',
            'matched_shops': matched_names,
            'disclaimer': 'สถานะนี้อ้างอิงจากข้อมูลที่ผู้ดูแลระบบตรวจสอบแล้ว',
        }

    if 'safe' in statuses:
        return {
            'status': 'safe',
            'message': 'ร้านค้านี้อยู่ใน Whitelist และผ่านการตรวจสอบโดยผู้ดูแลระบบแล้ว',
            'bad_records_found': 0,
            'source': 'whitelist',
            'matched_shops': matched_names,
            'disclaimer': 'สถานะนี้อ้างอิงจากการตรวจสอบของผู้ดูแลระบบ ไม่ใช่การรับรองความปลอดภัย 100%',
        }

    return {
        'status': 'pending',
        'message': 'พบร้านค้านี้ในรายการผู้ดูแลระบบ แต่ยังอยู่ระหว่างการตรวจสอบ',
        'bad_records_found': 0,
        'source': 'whitelist',
        'matched_shops': matched_names,
        'disclaimer': 'โปรดตรวจสอบข้อมูลเพิ่มเติมก่อนทำรายการ',
    }


def risk_search_query(value):
    return f'"{value}" (โกง OR มิจฉาชีพ OR หลอก)'


def valid_external_url(value):
    parsed = urlparse(str(value))
    return value if parsed.scheme in {'http', 'https'} and parsed.netloc else ''


def make_finding(title, url, snippet):
    safe_url = valid_external_url(url)
    if not safe_url:
        return None

    return {
        'title': str(title).strip()[:300] or safe_url,
        'url': safe_url,
        'snippet': str(snippet).strip()[:600],
    }


def search_google_for_risk(query):
    if not settings.GOOGLE_API_KEY or not settings.SEARCH_ENGINE_ID:
        raise ValueError('ยังไม่ได้ตั้งค่า Google Custom Search API')

    response = requests.get(
        'https://www.googleapis.com/customsearch/v1',
        params={
            'q': risk_search_query(query),
            'key': settings.GOOGLE_API_KEY,
            'cx': settings.SEARCH_ENGINE_ID,
        },
        timeout=10,
    )
    response.raise_for_status()
    data = response.json()
    findings = [
        make_finding(item.get('title'), item.get('link'), item.get('snippet'))
        for item in data.get('items', [])
    ]
    return 'google', [finding for finding in findings if finding]


def search_brave_for_risk(query):
    if not settings.BRAVE_SEARCH_API_KEY:
        raise ValueError('ยังไม่ได้ตั้งค่า Brave Search API')

    response = requests.get(
        'https://api.search.brave.com/res/v1/web/search',
        headers={'X-Subscription-Token': settings.BRAVE_SEARCH_API_KEY},
        params={
            'q': risk_search_query(query),
            'count': 10,
            'country': 'TH',
            'search_lang': 'th',
        },
        timeout=10,
    )
    response.raise_for_status()
    data = response.json()
    findings = [
        make_finding(item.get('title'), item.get('url'), item.get('description'))
        for item in data.get('web', {}).get('results', [])
    ]
    return 'brave', [finding for finding in findings if finding]


def search_external_risk_sources(query):
    if settings.RISK_SEARCH_PROVIDER in {'none', 'local', 'off'}:
        return 'local-only', []
    if settings.RISK_SEARCH_PROVIDER == 'brave':
        return search_brave_for_risk(query)
    if settings.RISK_SEARCH_PROVIDER == 'google':
        return search_google_for_risk(query)
    raise ValueError('ไม่รู้จักผู้ให้บริการค้นหาที่ตั้งค่าไว้')

# API สำหรับจัดการข้อมูลร้านค้าในฐานข้อมูล (อันเดิม)
class IsStaffOrReadOnly(BasePermission):
    def has_permission(self, request, view):
        return request.method in ('GET', 'HEAD', 'OPTIONS') or (
            request.user.is_authenticated and request.user.is_staff
        )


class IsStaff(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_staff


class ShopViewSet(viewsets.ModelViewSet):
    queryset = Shop.objects.all()
    serializer_class = ShopSerializer
    permission_classes = [IsStaffOrReadOnly]


class RiskRecordViewSet(viewsets.ModelViewSet):
    queryset = RiskRecord.objects.all()
    serializer_class = RiskRecordSerializer
    permission_classes = [IsStaff]


class BannerViewSet(viewsets.ModelViewSet):
    queryset = Banner.objects.all()
    serializer_class = BannerSerializer
    permission_classes = [IsStaffOrReadOnly]

    def get_queryset(self):
        queryset = super().get_queryset()
        if not self.request.user.is_authenticated or not self.request.user.is_staff:
            return queryset.filter(is_active=True)
        return queryset


def user_payload(user):
    return {
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'is_staff': user.is_staff,
    }


@api_view(['GET'])
@ensure_csrf_cookie
def csrf_token(request):
    return Response({'csrfToken': get_token(request)})


@api_view(['POST'])
def register(request):
    username = str(request.data.get('username', '')).strip()
    email = str(request.data.get('email', '')).strip()
    password = str(request.data.get('password', ''))

    if not username or not email or not password:
        return Response({'error': 'Username, email, and password are required.'}, status=400)
    if len(password) < 8:
        return Response({'error': 'Password must be at least 8 characters.'}, status=400)

    User = get_user_model()
    if User.objects.filter(username__iexact=username).exists():
        return Response({'error': 'Username is already in use.'}, status=400)
    if User.objects.filter(email__iexact=email).exists():
        return Response({'error': 'Email is already in use.'}, status=400)

    user = User.objects.create_user(username=username, email=email, password=password)
    login(request, user)
    return Response({'user': user_payload(user)}, status=201)


@api_view(['POST'])
def login_view(request):
    identifier = str(request.data.get('identifier', '')).strip()
    password = str(request.data.get('password', ''))
    User = get_user_model()
    user = User.objects.filter(email__iexact=identifier).first()
    username = user.username if user else identifier
    authenticated_user = authenticate(request, username=username, password=password)

    if authenticated_user is None:
        return Response({'error': 'Invalid username/email or password.'}, status=400)

    login(request, authenticated_user)
    return Response({'user': user_payload(authenticated_user)})


@api_view(['POST'])
def logout_view(request):
    logout(request)
    return Response({'message': 'Logged out.'})


@api_view(['GET'])
def current_user(request):
    if not request.user.is_authenticated:
        return Response({'user': None}, status=401)
    return Response({'user': user_payload(request.user)})

# API สำหรับประเมินประวัติความเสี่ยงจากข้อมูลที่ผู้ใช้ระบุ
@api_view(['GET', 'POST'])
def check_shop_risk(request):
    if request.method == 'POST':
        payload = request.data
    else:
        payload = request.query_params

    query = str(payload.get('query', '')).strip()
    if not query:
        query = next((str(payload.get(field, '')).strip() for field in ('name', 'url', 'account_number', 'account_name') if payload.get(field)), '')
    if not query:
        return Response({'error': 'กรุณากรอกชื่อร้าน ลิงก์ เลขบัญชี หรือชื่อเจ้าของบัญชี'}, status=400)

    local_result = local_risk_response(query)
    if local_result:
        return Response(local_result)

    try:
        provider, findings = search_external_risk_sources(query)
        if provider == 'local-only':
            return Response({
                'checked_fields': ['ข้อมูลที่กรอก'],
                'bad_records_found': 0,
                'status': 'pending',
                'message': 'ยังไม่พบข้อมูลในฐานข้อมูลภายใน และระบบค้นหาภายนอกยังไม่เปิดใช้งาน',
                'findings': [],
                'source': 'registry',
                'disclaimer': 'ขณะนี้ตรวจสอบได้จากข้อมูลภายในระบบเท่านั้น หากต้องการค้นหาทั่วเว็บให้เปิดใช้งานผู้ให้บริการค้นหาภายนอก',
            })

        if not findings:
            message = 'ไม่พบข้อมูลจากผลการค้นหาภายนอก แต่ยังยืนยันความปลอดภัยไม่ได้'
        else:
            message = 'พบข้อมูลภายนอกที่เกี่ยวข้อง โปรดตรวจสอบแหล่งอ้างอิงก่อนทำรายการ'

        return Response({
            'checked_fields': ['ข้อมูลที่กรอก'],
            'bad_records_found': len(findings),
            'status': 'pending',
            'message': message,
            'findings': findings,
            'source': provider,
            'disclaimer': 'ผลการค้นหาออนไลน์เป็นข้อมูลประกอบเท่านั้น และไม่ใช่การยืนยันว่าปลอดภัยหรือโกง',
        })
    except ValueError as error:
        return Response({'error': str(error)}, status=503)
    except requests.HTTPError as error:
        status_code = error.response.status_code if error.response is not None else 503
        provider = settings.RISK_SEARCH_PROVIDER.capitalize()
        if status_code in {401, 403}:
            message = f'{provider} Search API ปฏิเสธคำขอ โปรดตรวจสอบ API key, การเปิดใช้บริการ และโควตา'
        elif status_code == 429:
            message = f'{provider} Search API ใช้งานเกินโควตา โปรดลองใหม่ภายหลัง'
        else:
            message = f'{provider} Search API ตอบกลับผิดพลาด โปรดลองใหม่ภายหลัง'
        return Response({'error': message}, status=503)
    except requests.RequestException:
        return Response({'error': 'ระบบเชื่อมต่อผู้ให้บริการค้นหามีปัญหา กรุณาลองใหม่ภายหลัง'}, status=503)