from django.test import TestCase
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from apps.tables.models import Table
from apps.orders.models import Order
from .models import Payment, BankAccount

User = get_user_model()

class PaymentViewSetIntensiveTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_superuser(
            email='admin_pay_int@example.com', password='password123', user_name='admin_pay_int'
        )
        self.table = Table.objects.create(table_number='T_PAY', capacity=4)
        self.order = Order.objects.create(
            user=self.admin,
            table=self.table,
            order_type='dine_in',
            status='pending',
            total_amount=1000
        )
        self.bank = BankAccount.objects.create(
            account_number='1234',
            account_name='Admin',
            bank_name='VCB',
            is_active=True,
            is_default=True
        )
        self.payment = Payment.objects.create(
            order=self.order,
            amount=1000,
            payment_method='transfer',
            status='pending',
            paycode='PAYTEST'
        )
        
    def test_payments(self):
        self.client.force_authenticate(user=self.admin)
        self.client.get('/api/v1/payments/')
        self.client.get(f'/api/v1/payments/{self.payment.id}/')
        
        # Test creation with QR
        self.client.post('/api/v1/payments/create_with_qr/', data={'order_id': self.order.id, 'payment_method': 'transfer', 'amount': 1000}, format='json')
        
        # Cancel
        self.client.post('/api/v1/payments/cancel_by_paycode/', data={'paycode': 'PAYTEST'}, format='json')
        
        self.client.patch(f'/api/v1/payments/{self.payment.id}/', data={'status': 'completed'}, format='json')
        
        # Test bank accounts
        self.client.get('/api/v1/bank-accounts/')
        self.client.get('/api/v1/bank-accounts/default_account/')
        self.client.post(f'/api/v1/bank-accounts/{self.bank.id}/set_as_default/')
        self.client.post(f'/api/v1/bank-accounts/{self.bank.id}/toggle_active/')
