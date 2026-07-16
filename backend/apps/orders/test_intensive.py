from django.test import TestCase
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from apps.tables.models import Table
from apps.foods.models import Category, Food, Topping
from .models import Order, OrderItem, OrderItemTopping

User = get_user_model()

class OrderViewSetIntensiveTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_superuser(
            email='admin_ord_int@example.com', password='password123', user_name='admin_ord_int'
        )
        self.table = Table.objects.create(table_number='T_INT', capacity=4)
        self.category = Category.objects.create(name='Cat 1')
        self.food = Food.objects.create(category=self.category, name='Food 1', base_price=100)
        self.topping = Topping.objects.create(name='Top 1', price=10)
        self.order = Order.objects.create(
            user=self.admin,
            table=self.table,
            order_type='dine_in',
            status='pending',
            total_amount=1000
        )
        
    def test_orders(self):
        self.client.force_authenticate(user=self.admin)
        self.client.get('/api/v1/orders/')
        self.client.get(f'/api/v1/orders/{self.order.id}/')
        
        self.client.patch(f'/api/v1/orders/{self.order.id}/', data={'notes': 'Test'}, format='json')
        self.client.put(f'/api/v1/orders/{self.order.id}/', data={'order_type': 'dine_in', 'status': 'confirmed'}, format='json')
        
        # Test creation with valid payload
        valid_payload = {
            'order_type': 'dine_in',
            'table': self.table.id,
            'items': [
                {
                    'food': self.food.id,
                    'quantity': 2,
                    'unit_price': 100,
                    'toppings': [
                        {'topping': self.topping.id, 'quantity': 1, 'unit_price': 10}
                    ]
                }
            ]
        }
        self.client.post('/api/v1/orders/', data=valid_payload, format='json')
        
        # Test actions with actual valid data
        self.client.post(f'/api/v1/orders/{self.order.id}/confirm/', data={'notes': 'confirm'}, format='json')
        self.client.post(f'/api/v1/orders/{self.order.id}/ready/', data={}, format='json')
        self.client.post(f'/api/v1/orders/{self.order.id}/assign_shipper/', data={'shipper_id': self.admin.id}, format='json')
        self.client.post(f'/api/v1/orders/{self.order.id}/rate/', data={'rating': 5, 'review': 'Good'}, format='json')
        
        self.client.delete(f'/api/v1/orders/{self.order.id}/')
