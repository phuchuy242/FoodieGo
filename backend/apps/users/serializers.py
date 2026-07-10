from rest_framework import serializers
from django.contrib.auth import authenticate
from django.core.cache import cache
from django.utils import timezone
from django.conf import settings
from django.db.models import Q
from .models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            'id',
            'uuid',
            'user_name',
            'email',
            'phone_number',
            'first_name',
            'last_name',
            'full_name',
            'avatar_url',
            'is_active',
            'is_verified',
            'is_staff',
            'created_at',
            'updated_at',
        )
        read_only_fields = fields


# REGISTER SERIALIZER
class RegisterSerializer(serializers.Serializer):
    """
    Serializer for user registration.
    Supports registration with email, username, or phone number.
    """
    email = serializers.EmailField(required=False, allow_blank=True)
    user_name = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=150,
        help_text="Username (3-150 characters)"
    )
    phone_number = serializers.CharField(
        required=False,
        allow_blank=True,
        max_length=20,
        help_text="Phone number with country code"
    )
    password = serializers.CharField(
        write_only=True,
        min_length=8,
        help_text="Password (minimum 8 characters)"
    )
    password_confirm = serializers.CharField(
        write_only=True,
        help_text="Confirm password"
    )
    first_name = serializers.CharField(required=False, allow_blank=True, max_length=50)
    last_name = serializers.CharField(required=False, allow_blank=True, max_length=150)

    def validate_email(self, value):
        """Validate email is unique."""
        if value and User.objects.filter(email=value).exists():
            raise serializers.ValidationError("This email is already in use.")
        return value or None

    def validate_user_name(self, value):
        """Validate username is unique and format."""
        if value:
            if len(value) < 3:
                raise serializers.ValidationError("Username must be at least 3 characters.")
            if User.objects.filter(user_name=value).exists():
                raise serializers.ValidationError("This username already exists.")
        return value or None

    def validate_phone_number(self, value):
        """Validate phone number is unique."""
        if value and User.objects.filter(phone_number=value).exists():
            raise serializers.ValidationError("This phone number is already in use.")
        return value or None


    def validate(self, attrs):
        """Cross-field validation."""
        # Check password confirmation
        if attrs.get("password") != attrs.get("password_confirm"):
            raise serializers.ValidationError({
                "password_confirm": "Password confirmation does not match."
            })

        # Require at least one identifier
        email = attrs.get('email')
        phone_number = attrs.get('phone_number')
        user_name = attrs.get('user_name')

        if not email and not phone_number and not user_name:
            raise serializers.ValidationError(
                "You must provide at least one of: Email, Phone number, or Username."
            )

        return attrs

    def create(self, validated_data):
        """Create and return a new user."""
        validated_data.pop("password_confirm")
        password = validated_data.pop("password")

        # Create user using manager method
        user = User.objects.create_user(password=password, **validated_data)
        return user


class LoginSerializer(serializers.Serializer):
    """
    Serializer for user login.
    Supports login with email, username, or phone number.
    """
    identifier = serializers.CharField(
        required=False,
        allow_blank=True,
        help_text="Email, Username hoặc Số điện thoại"
    )
    email = serializers.EmailField(required=False, allow_blank=True)
    user_name = serializers.CharField(required=False, allow_blank=True)
    phone_number = serializers.CharField(required=False, allow_blank=True)
    password = serializers.CharField(required=True, write_only=True)

    def validate(self, attrs):
        """Validate login credentials and handle rate limiting."""
        # Extract identifier from various possible fields
        identifier = (
            attrs.get('identifier') or
            attrs.get('email') or
            attrs.get('user_name') or
            attrs.get('phone_number')
        )
        password = attrs.get('password')

        if not identifier:
            raise serializers.ValidationError({
                "identifier": "Please enter Email, Username, or Phone number."
            })

        if not password:
            raise serializers.ValidationError({
                "password": "Please enter password."
            })

        # Rate limiting configuration
        max_attempts = getattr(settings, 'LOGIN_MAX_ATTEMPTS', 5)
        lockout_seconds = getattr(settings, 'LOGIN_LOCKOUT_SECONDS', 300)
        cache_key = f"login_attempts:{identifier}"

        # Find user by identifier
        user_obj = self._find_user(identifier)

        # Check if user account is locked
        if user_obj and user_obj.locked_until and user_obj.locked_until > timezone.now():
            wait_time = int((user_obj.locked_until - timezone.now()).total_seconds())
            raise serializers.ValidationError({
                "detail": f"Account has been temporarily locked. Please try again after {wait_time} seconds."
            })

        # Authenticate user
        request = self.context.get('request')
        user = authenticate(request=request, username=identifier, password=password)

        if not user:
            # Increment failed login attempts
            attempts = cache.get(cache_key, 0) + 1
            cache.set(cache_key, attempts, timeout=lockout_seconds)

            # Lock account if max attempts exceeded
            if attempts >= max_attempts and user_obj:
                user_obj.locked_until = timezone.now() + timedelta(seconds=lockout_seconds)
                user_obj.save(update_fields=['locked_until'])
                cache.delete(cache_key)
                raise serializers.ValidationError({
                    "detail": f"Account has been locked due to {max_attempts} failed login attempts. Please try again after {lockout_seconds // 60} minutes."
                })

            remaining_attempts = max_attempts - attempts
            raise serializers.ValidationError({
                "detail": f"Incorrect login credentials. {remaining_attempts} attempts remaining."
            })

        # Check if user is active
        if not user.is_active:
            raise serializers.ValidationError({
                "detail": "Account has been disabled."
            })

        # Clear failed login attempts on successful login
        cache.delete(cache_key)

        # Update last login time
        user.last_login_at = timezone.now()
        user.save(update_fields=['last_login_at'])

        attrs['user'] = user
        return attrs

    def _find_user(self, identifier):
        """Find user by email, username, or phone number."""
        return User.objects.filter(
            Q(email=identifier) |
            Q(phone_number=identifier) |
            Q(user_name=identifier)
        ).first()


# REFRESH TOKEN SERIALIZER
class RefreshTokenSerializer(serializers.Serializer):
    refresh_token = serializers.CharField(required=True)



# PASSWORD CHANGE SERIALIZER
class PasswordChangeSerializer(serializers.Serializer):
    """Serializer for changing password."""
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True, min_length=8)
    new_password_confirm = serializers.CharField(required=True, write_only=True)

    def validate_old_password(self, value):
        """Validate old password is correct."""
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect.")
        return value

    def validate(self, attrs):
        """Validate new password confirmation."""
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({
                "new_password_confirm": "Password confirmation does not match."
            })
        return attrs

    def save(self):
        """Update user password."""
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save(update_fields=['password'])
        return user
