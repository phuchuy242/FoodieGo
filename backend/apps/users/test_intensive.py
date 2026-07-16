from django.test import TestCase
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token
import io
from PIL import Image

User = get_user_model()

def generate_photo_file():
    file = io.BytesIO()
    image = Image.new('RGB', (100, 100), color=(255, 0, 0))
    image.save(file, 'jpeg')
    file.name = 'test.jpg'
    file.seek(0)
    return file

class UserViewSetIntensiveTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_superuser(
            email='admin_intensive@example.com', password='password123', user_name='admin_intensive'
        )
        self.user1 = User.objects.create_user(
            email='user1_int@example.com', password='password123', user_name='user1_int', role='customer'
        )
        
    def test_users(self):
        self.client.force_authenticate(user=self.admin)
        self.client.get('/api/v1/users/')
        self.client.get(f'/api/v1/users/{self.user1.id}/')
        
        self.client.patch(f'/api/v1/users/{self.user1.id}/', data={'first_name': 'Test'}, format='json')
        self.client.put(f'/api/v1/users/{self.user1.id}/', data={'email': 'user1_int@example.com', 'user_name': 'u1', 'first_name': '1', 'last_name': '2', 'role': 'customer'}, format='json')
        
        # Test avatar
        self.client.post(f'/api/v1/users/{self.user1.id}/upload-avatar/', data={'avatar': generate_photo_file()}, format='multipart')
        
        # Test me
        self.client.get('/api/v1/users/me/')
        self.client.patch('/api/v1/users/me/update-profile/', data={'first_name': 'Me'}, format='json')
        self.client.post('/api/v1/users/me/change-password/', data={'old_password': 'password123', 'new_password': 'newpassword123'}, format='json')
        
        # Delete
        self.client.delete(f'/api/v1/users/{self.user1.id}/')
