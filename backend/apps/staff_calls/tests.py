from django.test import TestCase
from rest_framework.test import APIClient
from .models import StaffCall
from apps.tables.models import Table
from django.contrib.auth import get_user_model

User = get_user_model()

class StaffCallViewSetTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.staff = User.objects.create_user(
            email='staff@example.com', password='password123', user_name='staff1', role='staff', is_staff=True
        )
        self.table = Table.objects.create(table_number='T1', capacity=4)
        
        # Create some calls
        self.call1 = StaffCall.objects.create(table=self.table, call_type='order', status='pending')
        self.call2 = StaffCall.objects.create(table=self.table, call_type='bill', status='acknowledged', assigned_staff=self.staff)
        self.list_url = '/api/v1/staff-calls/'

    def test_list_unauthenticated(self):
        r = self.client.get(self.list_url)
        self.assertEqual(r.status_code, 401)

    def test_list_authenticated(self):
        self.client.force_authenticate(user=self.staff)
        r = self.client.get(self.list_url)
        self.assertEqual(r.status_code, 200)

    def test_create_call_public(self):
        # Create call is public
        r = self.client.post(self.list_url, data={'table': self.table.id, 'call_type': 'water'}, format='json')
        self.assertEqual(r.status_code, 201)
        self.assertEqual(StaffCall.objects.filter(call_type='water').count(), 1)

    def test_pending_action(self):
        self.client.force_authenticate(user=self.staff)
        r = self.client.get(self.list_url + 'pending/')
        self.assertEqual(r.status_code, 200)

    def test_active_action(self):
        self.client.force_authenticate(user=self.staff)
        r = self.client.get(self.list_url + 'active/')
        self.assertEqual(r.status_code, 200)

    def test_by_table_action(self):
        self.client.force_authenticate(user=self.staff)
        r = self.client.get(self.list_url + 'by_table/?table_id=' + str(self.table.id))
        self.assertEqual(r.status_code, 200)

    def test_my_assignments(self):
        self.client.force_authenticate(user=self.staff)
        r = self.client.get(self.list_url + 'my_assignments/')
        self.assertEqual(r.status_code, 200)

    def test_assign_staff(self):
        self.client.force_authenticate(user=self.staff)
        r = self.client.post(f"{self.list_url}{self.call1.id}/assign_staff/")
        self.assertEqual(r.status_code, 200)
        self.call1.refresh_from_db()
        self.assertEqual(self.call1.assigned_staff, self.staff)
        self.assertEqual(self.call1.status, 'acknowledged')

    def test_acknowledge(self):
        self.client.force_authenticate(user=self.staff)
        r = self.client.post(f"{self.list_url}{self.call1.id}/acknowledge/")
        self.assertEqual(r.status_code, 200)
        self.call1.refresh_from_db()
        self.assertEqual(self.call1.status, 'acknowledged')

    def test_complete(self):
        self.client.force_authenticate(user=self.staff)
        r = self.client.post(f"{self.list_url}{self.call2.id}/complete/")
        self.assertEqual(r.status_code, 200)
        self.call2.refresh_from_db()
        self.assertEqual(self.call2.status, 'completed')

    def test_cancel(self):
        self.client.force_authenticate(user=self.staff)
        r = self.client.post(f"{self.list_url}{self.call1.id}/cancel/")
        self.assertEqual(r.status_code, 200)
        self.call1.refresh_from_db()
        self.assertEqual(self.call1.status, 'cancelled')

    def test_statistics(self):
        self.client.force_authenticate(user=self.staff)
        r = self.client.get(self.list_url + 'statistics/')
        self.assertEqual(r.status_code, 200)
        self.assertIn('total_calls', r.data.get('data', {}))
