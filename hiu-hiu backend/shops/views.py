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
from .models import Banner, RiskRecord, RiskEvidence, Shop, normalize_risk_identifier
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
                'disclaimer': 'ข้อมูลนี้ถูกเพิ่มโดยผู้ดูแลระบบเพื่อเตือนภัยผู้ใช้งาน โปรดระมัดระวังก่อนทำรายการ',
            }

        if 'safe' in statuses:
            return {
                'status': 'safe',
                'message': 'พบข้อมูลที่ผู้ดูแลระบบยืนยันแล้วว่าปลอดภัย',
                'bad_records_found': 0,
                'source': 'registry',
                'record_sources': sources,
                'disclaimer': 'ข้อมูลนี้ได้รับการตรวจสอบโดยผู้ดูแลระบบ',
            }

        return {
            'status': 'pending',
            'message': 'พบข้อมูลนี้ในระบบ แต่ยังอยู่ระหว่างการตรวจสอบ',
            'bad_records_found': 0,
            'source': 'registry',
            'record_sources': sources,
            'disclaimer': 'ข้อมูลนี้อยู่ระหว่างรอผู้ดูแลระบบตรวจสอบความถูกต้อง',
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
            'country': 'ALL',
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


# เว็บที่น่าเชื่อถือสำหรับรายงานคนโกงในไทย
TRUSTED_SCAM_DOMAINS = {
    'blacklistseller.com',
    'checkscam.in.th',
    'thaipoliceonline.com',
    'sondhitalk.com',
    'nafifa.com',
    'pantip.com',           # pantip มีกระทู้แจ้งโกงเยอะมาก
    'thairath.co.th',       # ข่าวไทยรัฐ
    'kapook.com',
    'sanook.com',
    'manager.co.th',
    'prachachat.net',
    'bangkokbiznews.com',
}

# คำในชื่อลิงก์/เนื้อหาที่บ่งบอกว่าเป็นการรายงานโกง
SCAM_SIGNAL_WORDS = {
    'โกง', 'หลอก', 'มิจฉาชีพ', 'แบล็คลิสต์', 'blacklist',
    'scam', 'fraud', 'แจ้งความ', 'ระวัง', 'เตือน', 'หลอกลวง',
    'ไม่ได้รับของ', 'โอนแล้วหาย', 'ปิด ig', 'บล็อค',
}


def is_trusted_domain(url: str) -> bool:
    from urllib.parse import urlparse
    try:
        hostname = urlparse(url).hostname or ''
        return any(hostname == d or hostname.endswith('.' + d) for d in TRUSTED_SCAM_DOMAINS)
    except Exception:
        return False


def has_scam_signal(finding: dict) -> bool:
    """เช็คว่าผลลัพธ์นี้มีสัญญาณเกี่ยวกับการโกงจริงๆ ไหม"""
    text = (finding.get('title', '') + ' ' + finding.get('snippet', '')).lower()
    return any(word in text for word in SCAM_SIGNAL_WORDS)


def is_always_scam_domain(url: str) -> bool:
    """เช็คว่าเป็นเว็บฐานข้อมูลคนโกงโดยตรงหรือไม่ (ถ้าใช่ ไม่ต้องเช็ค keyword โกงในเนื้อหา)"""
    from urllib.parse import urlparse
    try:
        hostname = urlparse(url).hostname or ''
        always_scam = {'blacklistseller.com', 'checkscam.in.th', 'thaipoliceonline.com', 'checkgon.go.th', 'police9.go.th'}
        return any(hostname == d or hostname.endswith('.' + d) for d in always_scam)
    except Exception:
        return False

def query_matches_finding(query: str, finding: dict) -> bool:
    text = (finding.get('title', '') + ' ' + finding.get('snippet', '') + ' ' + finding.get('url', '')).lower()
    query_parts = str(query).lower().split()
    for part in query_parts:
        if len(part) >= 3 and part in text:
            return True
    return False

def filter_relevant_findings(findings, query):
    if not findings:
        return []

    trusted = []
    for f in findings:
        # Check if the result actually mentions the query (avoid Google's broad match false positives)
        if not query_matches_finding(query, f):
            continue
            
        # 1. ถ้าเป็นเว็บขึ้นแบล็คลิสต์โดยตรง ถือว่าใช่เลย
        if is_always_scam_domain(f['url']):
            trusted.append(f)
        # 2. ถ้าเป็นเว็บข่าว/เว็บบอร์ดทั่วไป ต้องมีคำเกี่ยวกับการโกงในเนื้อหาด้วย
        elif is_trusted_domain(f['url']) and has_scam_signal(f):
            trusted.append(f)

    if trusted:
        return trusted[:5]
    return []

def search_serper_for_risk(query):
    if not settings.SERPER_API_KEY:
        raise ValueError('ยังไม่ได้ตั้งค่า Serper API')

    response = requests.post(
        'https://google.serper.dev/search',
        headers={
            'X-API-KEY': settings.SERPER_API_KEY,
            'Content-Type': 'application/json',
        },
        json={
            'q': risk_search_query(query),
            'gl': 'th',
            'hl': 'th',
            'num': 10,
        },
        timeout=10,
    )
    response.raise_for_status()
    data = response.json()
    findings = [
        make_finding(item.get('title'), item.get('link'), item.get('snippet'))
        for item in data.get('organic', [])
    ]
    return 'serper', [f for f in findings if f]


def search_external_risk_sources(query):
    if settings.RISK_SEARCH_PROVIDER in {'none', 'local', 'off'}:
        return 'local-only', []
    if settings.RISK_SEARCH_PROVIDER == 'serper':
        provider, findings = search_serper_for_risk(query)
    elif settings.RISK_SEARCH_PROVIDER == 'brave':
        provider, findings = search_brave_for_risk(query)
    elif settings.RISK_SEARCH_PROVIDER == 'google':
        provider, findings = search_google_for_risk(query)
    else:
        raise ValueError('ไม่รู้จักผู้ให้บริการค้นหาที่ตั้งค่าไว้')

    return provider, filter_relevant_findings(findings, query)

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

    def create(self, request, *args, **kwargs):
        evidence_images = request.FILES.getlist('evidence_images')
        
        # DRF's standard create logic
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        # Save multiple images if provided
        if evidence_images:
            for img in evidence_images:
                from .models import RiskEvidence
                RiskEvidence.objects.create(record=serializer.instance, image=img)
                
        headers = self.get_success_headers(serializer.data)
        # re-fetch data so it includes evidences in the response
        result_serializer = self.get_serializer(serializer.instance)
        return Response(result_serializer.data, status=201, headers=headers)


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
@api_view(['POST'])
def report_risk(request):
    data = request.data
    reporter_name = str(data.get('reporter_name', '')).strip() or 'แจ้งจากผู้ใช้งานทั่วไป'
    notes = str(data.get('notes', '')).strip()
    evidence_images = request.FILES.getlist('evidence_images')

    fields_to_create = []
    if data.get('bank_account'):
        fields_to_create.append(('bank_account', str(data.get('bank_account', '')).strip()))
    if data.get('account_owner'):
        fields_to_create.append(('account_owner', str(data.get('account_owner', '')).strip()))
    if data.get('shop_name'):
        fields_to_create.append(('shop_name', str(data.get('shop_name', '')).strip()))
    if data.get('shop_link'):
        fields_to_create.append(('shop_link', str(data.get('shop_link', '')).strip()))

    if not fields_to_create:
        return Response({'error': 'กรุณากรอกข้อมูลอย่างน้อย 1 อย่าง'}, status=400)

    created_count = 0
    for id_type, id_val in fields_to_create:
        if id_val:
            # ใช้ get_or_create เพื่อป้องกัน error 500 (IntegrityError) ถ้าข้อมูลซ้ำ
            record, created = RiskRecord.objects.get_or_create(
                identifier_type=id_type,
                identifier=id_val,
                defaults={
                    'status': 'pending',
                    'source_name': reporter_name,
                    'notes': notes,
                    'is_active': True,
                }
            )
            # Save all uploaded images for this record
            if evidence_images:
                for img in evidence_images:
                    RiskEvidence.objects.create(record=record, image=img)
            
            if created:
                created_count += 1
            # ถ้ามีอยู่แล้ว แต่ถูกตั้งว่าปลอดภัย อาจจะไม่ได้แก้ แต่ก็โอเค เพราะแจ้งเบาะแสไม่ควรทับข้อมูลแอดมิน

    if created_count == 0:
        return Response({'message': 'ข้อมูลนี้ได้รับแจ้งไว้แล้วในระบบ ขอบคุณที่แจ้งเบาะแสครับ'})

    return Response({'message': 'แจ้งเบาะแสสำเร็จ ข้อมูลของท่านเข้าสู่ระบบตรวจสอบแล้ว ขอบคุณครับ'})

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

    # ตรวจว่าเป็นเลขบัญชีธนาคารหรือไม่ (ตัวเลขล้วน 8-20 หลัก)
    is_bank_account = query.replace('-', '').replace(' ', '').isdigit() and 8 <= len(query.replace('-', '').replace(' ', '')) <= 20

    # สร้างคำค้นหาสำหรับ Google (ถ้าใส่ลิงก์มา ให้สกัดเอาแค่ชื่อร้าน หรือ ID)
    external_query = query
    if '://' in query or 'www.' in query or '.com' in query:
        from urllib.parse import urlparse, parse_qs
        try:
            url_to_parse = query if '://' in query else f'https://{query}'
            parsed = urlparse(url_to_parse)
            
            # ดึง username/ID ออกมาจาก Path หรือ Query
            if 'profile.php' in parsed.path and 'id' in parse_qs(parsed.query):
                external_query = parse_qs(parsed.query)['id'][0]
            elif parsed.path and parsed.path != '/':
                # ใช้ path ส่วนสุดท้ายเป็นชื่อร้าน เช่น facebook.com/therpshop -> therpshop
                parts = [p for p in parsed.path.split('/') if p]
                if parts:
                    external_query = parts[-1].replace('@', '') # ตัด @ ออกด้วยเผื่อเป็น @LINE
        except Exception:
            pass

    try:
        provider, findings = search_external_risk_sources(external_query)
    except ValueError as error:
        provider, findings = 'error', []
        error_message = str(error)
    except requests.HTTPError as error:
        provider, findings = 'error', []
        status_code = error.response.status_code if error.response is not None else 503
        provider_name = settings.RISK_SEARCH_PROVIDER.capitalize()
        if status_code in {401, 403}:
            error_message = f'{provider_name} Search API ปฏิเสธคำขอ โปรดตรวจสอบ API key, การเปิดใช้บริการ และโควตา'
        elif status_code == 429:
            error_message = f'{provider_name} Search API ใช้งานเกินโควตา โปรดลองใหม่ภายหลัง'
        else:
            error_message = f'{provider_name} Search API ตอบกลับผิดพลาด โปรดลองใหม่ภายหลัง'
    except requests.RequestException:
        provider, findings = 'error', []
        error_message = 'ระบบเชื่อมต่อผู้ให้บริการค้นหามีปัญหา กรุณาลองใหม่ภายหลัง'

    # ถ้ามีข้อมูลที่แอดมินยืนยันไว้แล้ว (ในฐานข้อมูลเรา)
    if local_result:
        local_result['findings'] = findings
        if findings:
            local_result['source'] = f"{local_result['source']} + {provider}"
        return Response(local_result)
        
    if provider == 'error':
        return Response({'error': error_message}, status=503)

    if provider == 'local-only':
        if is_bank_account:
            msg = 'ไม่พบเลขบัญชีนี้ในรายการบัญชีต้องสงสัย'
            disclaimer = 'ข้อมูลอ้างอิงจากฐานข้อมูลภายในระบบ แนะนำให้ตรวจสอบกับธนาคารโดยตรงก่อนโอนเงิน'
        else:
            msg = 'ไม่พบประวัติการโกงในระบบของเรา'
            disclaimer = 'แนะนำให้ตรวจสอบรีวิวและความน่าเชื่อถือของร้านเพิ่มเติมก่อนตัดสินใจโอนเงิน'
        return Response({
            'checked_fields': ['ข้อมูลที่กรอก'],
            'bad_records_found': 0,
            'status': 'neutral',
            'message': msg,
            'findings': [],
            'source': 'registry',
            'disclaimer': disclaimer,
        })

    if not findings:
        if is_bank_account:
            message = 'ไม่พบเลขบัญชีนี้ในรายการบัญชีต้องสงสัย'
            disclaimer = 'ไม่พบประวัติการโกงจากการค้นหา แนะนำให้ตรวจสอบกับธนาคารโดยตรงก่อนโอนเงิน'
        else:
            message = 'ไม่พบประวัติการโกงจากการค้นหา'
            disclaimer = 'แนะนำให้ตรวจสอบรีวิวและความน่าเชื่อถือของร้านเพิ่มเติมก่อนตัดสินใจโอนเงิน'
    else:
        message = 'พบข้อมูลที่ควรตรวจสอบเพิ่มเติม โปรดดูแหล่งอ้างอิงด้านล่างก่อนทำรายการ'
        disclaimer = 'ผลการค้นหาออนไลน์เป็นข้อมูลประกอบเท่านั้น ควรตรวจสอบหลักฐานให้ครบก่อนตัดสินใจ'

    return Response({
        'checked_fields': ['ข้อมูลที่กรอก'],
        'bad_records_found': len(findings),
        'status': 'warning' if findings else 'neutral',
        'message': message,
        'findings': findings,
        'source': provider,
        'disclaimer': disclaimer,
    })