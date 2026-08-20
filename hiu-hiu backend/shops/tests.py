from io import BytesIO
from unittest.mock import Mock, patch

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from PIL import Image
from rest_framework.test import APITestCase
from django.test import override_settings

from .models import Banner, RiskRecord, Shop


def make_test_image(name='banner.jpg'):
	buffer = BytesIO()
	Image.new('RGB', (2, 2), color='white').save(buffer, format='JPEG')
	return SimpleUploadedFile(name, buffer.getvalue(), content_type='image/jpeg')


class ShopApiTests(APITestCase):
	def setUp(self):
		User = get_user_model()
		self.user = User.objects.create_user(username='regular', password='pass-12345')
		self.admin = User.objects.create_user(
			username='admin-test', password='pass-12345', is_staff=True
		)
		self.shop = Shop.objects.create(
			name='Test Shop',
			url='https://example.com/test-shop',
			platform='facebook',
			status='pending',
		)

	def test_register_creates_and_logs_in_user(self):
		response = self.client.post(
			'/api/auth/register/',
			{'username': 'new-user', 'email': 'new@example.com', 'password': 'pass-12345'},
			format='json',
		)
		self.assertEqual(response.status_code, 201)
		self.assertFalse(response.data['user']['is_staff'])
		self.assertEqual(self.client.get('/api/auth/me/').status_code, 200)

	def test_regular_user_can_read_but_cannot_modify_shops(self):
		self.client.force_authenticate(self.user)
		self.assertEqual(self.client.get('/api/shops/').status_code, 200)
		response = self.client.patch(
			f'/api/shops/{self.shop.id}/', {'name': 'Changed'}, format='json'
		)
		self.assertEqual(response.status_code, 403)

	def test_admin_can_update_and_delete_shop(self):
		self.client.force_authenticate(self.admin)
		update = self.client.patch(
			f'/api/shops/{self.shop.id}/', {'status': 'safe'}, format='json'
		)
		self.assertEqual(update.status_code, 200)
		self.assertEqual(update.data['status'], 'safe')
		self.assertEqual(self.client.delete(f'/api/shops/{self.shop.id}/').status_code, 204)

	def test_banner_create_is_staff_only(self):
		image = make_test_image()
		self.client.force_authenticate(self.user)
		regular_response = self.client.post('/api/banners/', {'image': image}, format='multipart')
		self.assertEqual(regular_response.status_code, 403)

		self.client.force_authenticate(self.admin)
		admin_image = make_test_image()
		admin_response = self.client.post(
			'/api/banners/',
			{'image': admin_image, 'title': 'Test Banner', 'is_active': 'true'},
			format='multipart',
		)
		self.assertEqual(admin_response.status_code, 201)
		self.assertTrue(Banner.objects.filter(title='Test Banner').exists())

	@override_settings(
		RISK_SEARCH_PROVIDER='google',
		GOOGLE_API_KEY='test-key',
		SEARCH_ENGINE_ID='test-engine',
	)
	@patch('shops.views.requests.get')
	def test_risk_check_accepts_single_query(self, mock_get):
		mock_response = Mock()
		mock_response.json.return_value = {
			'searchInformation': {'totalResults': '2'},
		}
		mock_response.raise_for_status.return_value = None
		mock_get.return_value = mock_response

		response = self.client.post(
			'/api/check-risk/',
			{'query': '1234567890'},
			format='json',
		)

		self.assertEqual(response.status_code, 200)
		self.assertEqual(response.data['checked_fields'], ['ข้อมูลที่กรอก'])
		self.assertEqual(response.data['status'], 'pending')
		self.assertEqual(mock_get.call_count, 1)

	@patch('shops.views.requests.get')
	def test_safe_whitelist_result_takes_priority(self, mock_get):
		self.shop.status = 'safe'
		self.shop.save(update_fields=['status'])

		response = self.client.post('/api/check-risk/', {'query': 'Test Shop'}, format='json')

		self.assertEqual(response.status_code, 200)
		self.assertEqual(response.data['status'], 'safe')
		self.assertEqual(response.data['source'], 'whitelist')
		mock_get.assert_not_called()

	@patch('shops.views.requests.get')
	def test_safe_whitelist_matches_normalized_url_and_name(self, mock_get):
		self.shop.status = 'safe'
		self.shop.name = 'Test Shop (Verified)'
		self.shop.url = 'https://www.instagram.com/test_shop/'
		self.shop.save(update_fields=['status', 'name', 'url'])

		url_response = self.client.post(
			'/api/check-risk/',
			{'query': 'https://instagram.com/test_shop?utm_source=profile'},
			format='json',
		)
		name_response = self.client.post(
			'/api/check-risk/', {'query': 'test shop verified'}, format='json'
		)

		self.assertEqual(url_response.status_code, 200)
		self.assertEqual(url_response.data['status'], 'safe')
		self.assertEqual(name_response.status_code, 200)
		self.assertEqual(name_response.data['status'], 'safe')
		mock_get.assert_not_called()

	@override_settings(
		RISK_SEARCH_PROVIDER='google',
		GOOGLE_API_KEY='test-key',
		SEARCH_ENGINE_ID='test-engine',
	)
	@patch('shops.views.requests.get')
	def test_external_search_with_no_results_stays_pending(self, mock_get):
		mock_response = Mock()
		mock_response.json.return_value = {'items': []}
		mock_response.raise_for_status.return_value = None
		mock_get.return_value = mock_response

		response = self.client.post(
			'/api/check-risk/', {'query': 'unknown-shop-123'}, format='json'
		)

		self.assertEqual(response.status_code, 200)
		self.assertEqual(response.data['status'], 'pending')
		self.assertEqual(response.data['bad_records_found'], 0)

	@override_settings(RISK_SEARCH_PROVIDER='brave', BRAVE_SEARCH_API_KEY='test-key')
	@patch('shops.views.requests.get')
	def test_brave_search_returns_evidence_without_marking_scam(self, mock_get):
		mock_response = Mock()
		mock_response.json.return_value = {
			'web': {
				'results': [
					{
						'title': 'รายงานตัวอย่าง',
						'url': 'https://example.com/report',
						'description': 'ผลการค้นหาตัวอย่าง',
					},
				],
			},
		}
		mock_response.raise_for_status.return_value = None
		mock_get.return_value = mock_response

		response = self.client.post(
			'/api/check-risk/', {'query': 'unknown-shop-456'}, format='json'
		)

		self.assertEqual(response.status_code, 200)
		self.assertEqual(response.data['status'], 'pending')
		self.assertEqual(response.data['source'], 'brave')
		self.assertEqual(response.data['findings'][0]['url'], 'https://example.com/report')
		self.assertEqual(mock_get.call_args.kwargs['headers']['X-Subscription-Token'], 'test-key')

	def test_registry_matches_a_bank_account_without_external_search(self):
		RiskRecord.objects.create(
			identifier_type='bank_account',
			identifier='074-189-6575',
			status='scam',
			source_name='ผู้ดูแลระบบทดสอบ',
		)

		response = self.client.post(
			'/api/check-risk/', {'query': '0741896575'}, format='json'
		)

		self.assertEqual(response.status_code, 200)
		self.assertEqual(response.data['status'], 'scam')
		self.assertEqual(response.data['source'], 'registry')

	def test_risk_records_are_staff_only(self):
		self.assertEqual(self.client.get('/api/risk-records/').status_code, 403)
		self.client.force_authenticate(self.admin)
		response = self.client.post(
			'/api/risk-records/',
			{
				'identifier_type': 'bank_account',
				'identifier': '074-189-6575',
				'status': 'scam',
				'source_name': 'ผู้ดูแลระบบทดสอบ',
			},
			format='json',
		)
		self.assertEqual(response.status_code, 201)
		self.assertEqual(response.data['normalized_identifier'], '0741896575')

	def test_risk_check_requires_at_least_one_field(self):
		response = self.client.post('/api/check-risk/', {}, format='json')
		self.assertEqual(response.status_code, 400)
