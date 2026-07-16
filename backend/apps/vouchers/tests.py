from django.test import TestCase
from rest_framework.test import APIClient
from .models import Voucher
from django.utils import timezone
from datetime import timedelta

class VoucherViewSetTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.voucher = Voucher.objects.create(
            code='DISCOUNT10',
            discount_type='percentage',
            discount_value=10,
            max_usage=100,
            current_usage=0,
            is_active=True,
            start_date=timezone.now() - timedelta(days=1),
            end_date=timezone.now() + timedelta(days=10)
        )
        self.list_url = '/api/v1/vouchers/'

    def test_list_vouchers(self):
        r = self.client.get(self.list_url)
        self.assertEqual(r.status_code, 200)

    def test_validate_code_success(self):
        r = self.client.post(self.list_url + 'validate/', data={'code': 'DISCOUNT10'}, format='json')
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.data['data']['code'], 'DISCOUNT10')

    def test_validate_code_not_found(self):
        r = self.client.post(self.list_url + 'validate/', data={'code': 'FAKE'}, format='json')
        self.assertEqual(r.status_code, 404)

    def test_validate_code_expired(self):
        self.voucher.is_active = False
        self.voucher.save()
        r = self.client.post(self.list_url + 'validate/', data={'code': 'DISCOUNT10'}, format='json')
        self.assertEqual(r.status_code, 400)

    def test_apply_voucher(self):
        r = self.client.post(f"{self.list_url}{self.voucher.id}/apply/")
        self.assertEqual(r.status_code, 200)
        self.voucher.refresh_from_db()
        self.assertEqual(self.voucher.current_usage, 1)

    def test_apply_voucher_invalid(self):
        self.voucher.is_active = False
        self.voucher.save()
        r = self.client.post(f"{self.list_url}{self.voucher.id}/apply/")
        self.assertEqual(r.status_code, 400)
