from django.test import TestCase
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model

User = get_user_model()

class PaymentViewSetTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_superuser(
            email='admin_pay@example.com', password='password123', user_name='admin_pay'
        )
        self.list_url = '/api/v1/payments/'
        self.bank_url = '/api/v1/bank-accounts/'

    def test_bank_accounts(self):
        self.client.force_authenticate(user=self.admin)
        self.client.get(self.bank_url)
        self.client.get(self.bank_url + 'default_account/')

    def test_payments(self):
        self.client.force_authenticate(user=self.admin)
        self.client.get(self.list_url)
        self.client.get(self.list_url + 'by_pay_code/?paycode=TEST')
