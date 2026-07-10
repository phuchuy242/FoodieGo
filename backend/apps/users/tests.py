from django.test import TestCase
from rest_framework.test import APIClient
from django.urls import reverse
from .models import User, RefreshToken
from .jwt_utils import decode_jwt


class UsersAuthTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.register_url = '/api/v1/users/register/'
        self.login_url = '/api/v1/users/login/'
        self.refresh_url = '/api/v1/users/refresh/'
        self.logout_url = '/api/v1/users/logout/'

        self.user_data = {
            'email': 'testuser@example.com',
            'user_name': 'testuser',
            'first_name': 'Test',
            'last_name': 'User',
            'password': 'TestPass123!',
            'password_confirm': 'TestPass123!',
        }

    def test_register_and_login_success(self):
        # Register
        r = self.client.post(self.register_url, data=self.user_data, format='json')
        self.assertEqual(r.status_code, 201)
        self.assertTrue(r.data.get('status'))

        # Login with email
        login_resp = self.client.post(self.login_url, data={'user_name': self.user_data['email'], 'password': self.user_data['password']}, format='json')
        self.assertEqual(login_resp.status_code, 200)
        # tokens are in response.data['data'] now
        self.assertIn('access', login_resp.data.get('data', {}))
        self.assertIn('refresh', login_resp.data.get('data', {}))

        # Check refresh token stored
        refresh_token = login_resp.data['data']['refresh']
        payload = decode_jwt(refresh_token)
        jti = payload.get('jti')
        self.assertIsNotNone(jti)
        self.assertTrue(RefreshToken.objects.filter(jti=jti).exists())

    def test_login_wrong_password(self):
        User.objects.create_user(email='u2@example.com', password='RightPass1', user_name='u2', first_name='U', last_name='Two')
        r = self.client.post(self.login_url, data={'user_name': 'u2', 'password': 'wrong'}, format='json')
        self.assertEqual(r.status_code, 400)
        # response uses standardized msg in top-level 'msg'
        self.assertIn('Username or password', r.data.get('msg', '') or r.data.get('detail', ''))

    def test_refresh_rotates_and_revokes_old(self):
        # Register and login
        self.client.post(self.register_url, data=self.user_data, format='json')
        login_resp = self.client.post(self.login_url, data={'user_name': self.user_data['email'], 'password': self.user_data['password']}, format='json')
        old_refresh = login_resp.data['data']['refresh']
        old_payload = decode_jwt(old_refresh)
        old_jti = old_payload['jti']

        # Refresh
        r = self.client.post(self.refresh_url, data={'refresh': old_refresh}, format='json')
        self.assertEqual(r.status_code, 200)
        self.assertIn('access', r.data.get('data', {}))
        self.assertIn('refresh', r.data.get('data', {}))

        # Old token revoked
        old_obj = RefreshToken.objects.get(jti=old_jti)
        self.assertTrue(old_obj.revoked)

        # New token stored
        new_payload = decode_jwt(r.data['data']['refresh'])
        self.assertTrue(RefreshToken.objects.filter(jti=new_payload['jti'], revoked=False).exists())

    def test_logout_revokes_token(self):
        self.client.post(self.register_url, data=self.user_data, format='json')
        login_resp = self.client.post(self.login_url, data={'user_name': self.user_data['email'], 'password': self.user_data['password']}, format='json')
        refresh = login_resp.data['data']['refresh']
        payload = decode_jwt(refresh)
        jti = payload['jti']

        r = self.client.post(self.logout_url, data={'refresh': refresh}, format='json')
        self.assertEqual(r.status_code, 200)
        obj = RefreshToken.objects.get(jti=jti)
        self.assertTrue(obj.revoked)

    def test_env_sig_mismatch_blocks_refresh(self):
        # Register and login
        self.client.post(self.register_url, data=self.user_data, format='json')
        login_resp = self.client.post(self.login_url, data={'user_name': self.user_data['email'], 'password': self.user_data['password']}, format='json')
        refresh = login_resp.data['data']['refresh']
        payload = decode_jwt(refresh)
        jti = payload['jti']

        # Change user's user_name to cause env_sig mismatch
        user = User.objects.get(email=self.user_data['email'])
        user.user_name = 'newusername'
        user.save()

        r = self.client.post(self.refresh_url, data={'refresh': refresh}, format='json')
        self.assertEqual(r.status_code, 401)
        self.assertIn('Token environment mismatch', r.data.get('msg', ''))

    def test_lockout_after_failed_attempts(self):
        # create user
        User.objects.create_user(email='lock@example.com', password='Right1!', user_name='lockuser', first_name='L', last_name='O')
        # try wrong password repeatedly
        for i in range(5):
            r = self.client.post(self.login_url, data={'user_name': 'lockuser', 'password': 'wrong'}, format='json')
        # next attempt should be locked
        r2 = self.client.post(self.login_url, data={'user_name': 'lockuser', 'password': 'Right1!'}, format='json')
        self.assertEqual(r2.status_code, 400)
        self.assertIn('Account locked', r2.data.get('msg', '') or r2.data.get('detail', ''))
