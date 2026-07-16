from django.test import TestCase
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model

User = get_user_model()

class ReportViewSetTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_superuser(
            email='admin_report@example.com', password='password123', user_name='admin_report'
        )
        self.list_url = '/api/v1/reports/'

    def test_reports(self):
        self.client.force_authenticate(user=self.admin)
        self.client.get(self.list_url)
        self.client.get(self.list_url + 'summary/')
        self.client.get(self.list_url + 'revenue_chart/')
        self.client.get(self.list_url + 'top_dishes/')
        self.client.get(self.list_url + 'order_status_stats/')
        self.client.get(self.list_url + 'recent_orders/')
