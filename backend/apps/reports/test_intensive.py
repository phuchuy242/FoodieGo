from django.test import TestCase
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta

User = get_user_model()

class ReportViewSetIntensiveTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_superuser(
            email='admin_rep_int@example.com', password='password123', user_name='admin_rep_int'
        )
        self.today_str = timezone.now().strftime('%Y-%m-%d')
        self.last_month_str = (timezone.now() - timedelta(days=30)).strftime('%Y-%m-%d')
        
    def test_reports(self):
        self.client.force_authenticate(user=self.admin)
        
        # Test summary
        self.client.get('/api/v1/reports/summary/')
        self.client.get(f'/api/v1/reports/summary/?period=custom&start_date={self.last_month_str}&end_date={self.today_str}')
        
        # Test revenue chart
        self.client.get('/api/v1/reports/revenue_chart/')
        self.client.get(f'/api/v1/reports/revenue_chart/?period=custom&start_date={self.last_month_str}&end_date={self.today_str}')
        
        # Test top dishes
        self.client.get('/api/v1/reports/top_dishes/')
        
        # Test order status
        self.client.get('/api/v1/reports/order_status_stats/')
        
        # Test recent orders
        self.client.get('/api/v1/reports/recent_orders/')
