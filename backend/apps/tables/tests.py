from django.test import TestCase
from rest_framework.test import APIClient
from .models import Table
from django.contrib.auth import get_user_model

User = get_user_model()

class TableViewSetTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_superuser(
            email='admin@example.com', password='password123', user_name='admin_tables'
        )
        self.table1 = Table.objects.create(table_number='T1', capacity=4, status='available')
        self.table2 = Table.objects.create(table_number='T2', capacity=2, status='occupied')
        self.list_url = '/api/v1/tables/'

    def test_list_tables_public(self):
        r = self.client.get(self.list_url)
        self.assertEqual(r.status_code, 200)
        data = r.data.get('data', [])
        # Handle pagination if any
        if isinstance(data, dict) and 'results' in data:
            data = data['results']
        self.assertEqual(len(data), 2)

    def test_list_tables_filter_status(self):
        r = self.client.get(self.list_url + '?status=available')
        self.assertEqual(r.status_code, 200)
        data = r.data.get('data', [])
        if isinstance(data, dict) and 'results' in data:
            data = data['results']
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['table_number'], 'T1')

    def test_create_table_unauthenticated(self):
        r = self.client.post(self.list_url, data={'table_number': 'T3', 'capacity': 6}, format='json')
        self.assertEqual(r.status_code, 401)

    def test_create_table_authenticated(self):
        self.client.force_authenticate(user=self.admin)
        r = self.client.post(self.list_url, data={'table_number': 'T3', 'capacity': 6}, format='json')
        self.assertEqual(r.status_code, 201)
        self.assertTrue(Table.objects.filter(table_number='T3').exists())

    def test_available_action(self):
        r = self.client.get(self.list_url + 'available/')
        self.assertEqual(r.status_code, 200)
        data = r.data.get('data', [])
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['table_number'], 'T1')

    def test_update_status_action(self):
        self.client.force_authenticate(user=self.admin)
        url = f'{self.list_url}{self.table1.pk}/update-status/'
        r = self.client.patch(url, data={'status': 'reserved'}, format='json')
        self.assertEqual(r.status_code, 200)
        self.table1.refresh_from_db()
        self.assertEqual(self.table1.status, 'reserved')


