"""
Custom authentication backends for flexible user login.
"""
from django.contrib.auth.backends import ModelBackend
from django.db.models import Q
from .models import User


class EmailOrUsernameOrPhoneBackend(ModelBackend):

    def authenticate(self, request, username=None, password=None, **kwargs):

        if username is None or password is None:
            return None

        try:
            # Try to find user by email, username, or phone number
            user = User.objects.filter(
                Q(email=username) |
                Q(user_name=username) |
                Q(phone_number=username)
            ).first()

            if user and user.check_password(password):
                return user
        except User.DoesNotExist:
            # Run the default password hasher once to reduce the timing
            # difference between an existing and a nonexistent user (#20760).
            User().set_password(password)
            return None

    def get_user(self, user_id):

        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None

