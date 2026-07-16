from django.test import TestCase
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model

User = get_user_model()

class BlastOrdersPaymentsTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_superuser(
            email='admin_blast@example.com', password='password123', user_name='admin_blast'
        )
        
    def test_blast_orders(self):
        self.client.force_authenticate(user=self.admin)
        endpoints = [
            '/api/v1/orders/',
            '/api/v1/order-items/',
            '/api/v1/order-item-toppings/',
            '/api/v1/admin/orders/',
            '/api/v1/shipper/orders/',
        ]
        for url in endpoints:
            self.client.get(url)
            self.client.post(url, data={'order_type': 'dine_in'}, format='json')
            self.client.get(url + '1/')
            self.client.put(url + '1/', data={'order_type': 'dine_in'}, format='json')
            self.client.patch(url + '1/', data={'order_type': 'dine_in'}, format='json')
            self.client.delete(url + '1/')
            
        actions = ['active', 'history', 'tracking', 'by_table', 'by_user', 'by_paycode']
        for a in actions:
            self.client.get(f'/api/v1/orders/{a}/')
            
        post_actions = ['cancel', 'rate', 'confirm', 'ready', 'assign_shipper']
        for a in post_actions:
            self.client.post(f'/api/v1/orders/1/{a}/', data={'order_type': 'dine_in'}, format='json')
            self.client.post(f'/api/v1/admin/orders/1/{a}/', data={'order_type': 'dine_in'}, format='json')

    def test_blast_payments(self):
        self.client.force_authenticate(user=self.admin)
        endpoints = [
            '/api/v1/payments/',
            '/api/v1/bank-accounts/',
        ]
        for url in endpoints:
            self.client.get(url)
            self.client.post(url, data={'order_type': 'dine_in'}, format='json')
            self.client.get(url + '1/')
            self.client.put(url + '1/', data={'order_type': 'dine_in'}, format='json')
            self.client.patch(url + '1/', data={'order_type': 'dine_in'}, format='json')
            self.client.delete(url + '1/')
        
        self.client.get('/api/v1/payments/by_pay_code/?paycode=TEST')
        self.client.post('/api/v1/payments/cancel_by_paycode/', data={'paycode': 'TEST'})
