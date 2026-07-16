from django.test import TestCase
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model

User = get_user_model()

class MenuInventoryTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_superuser(
            email='admin_menu@example.com', password='password123', user_name='admin_menu'
        )
        
    def test_menu_endpoints(self):
        self.client.force_authenticate(user=self.admin)
        endpoints = [
            '/api/v1/categories/',
            '/api/v1/foods/',
            '/api/v1/toppings/',
            '/api/v1/combos/',
        ]
        for url in endpoints:
            self.client.get(url)
            self.client.post(url, data={}, format='json')
            self.client.get(url + '1/')
            self.client.put(url + '1/', data={}, format='json')
            self.client.patch(url + '1/', data={}, format='json')
            self.client.delete(url + '1/')

    def test_inventory_endpoints(self):
        self.client.force_authenticate(user=self.admin)
        endpoints = [
            '/api/v1/ingredients/',
            '/api/v1/suppliers/',
            '/api/v1/purchase-orders/',
        ]
        for url in endpoints:
            self.client.get(url)
            self.client.post(url, data={}, format='json')
            self.client.get(url + '1/')
            self.client.put(url + '1/', data={}, format='json')
            self.client.patch(url + '1/', data={}, format='json')
            self.client.delete(url + '1/')
