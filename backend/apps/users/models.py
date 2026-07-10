import uuid
from django.db import models
from django.contrib.auth.models import (
    AbstractBaseUser,
    PermissionsMixin,
    BaseUserManager,
)
from django.db.models import Q  # Import Q để query phức tạp


class UserManager(BaseUserManager):
    def create_user(self, password=None, email=None, phone_number=None, user_name=None, **extra_fields):
        # 1. Kiểm tra phải có ít nhất 1 định danh
        if not email and not phone_number and not user_name:
            raise ValueError("You must provide at least an email address, phone number, or username.")

        # 2. Normalize email nếu có
        if email:
            email = self.normalize_email(email)

        # 3. Tạo instance (Lưu ý: user_name nên là unique, nếu thiếu thì phải tự sinh hoặc handle ở view)
        user = self.model(
            email=email,
            phone_number=phone_number,
            user_name=user_name,
            **extra_fields
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, password=None, email=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)

        # Supe ruser thường bắt buộc cần email hoặc username để quản lý
        if not email:
            raise ValueError("Superuser must have an email address.")

        return self.create_user(email=email, password=password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    uuid = models.UUIDField(
        default=uuid.uuid4,
        editable=False,
        unique=True,
        db_index=True
    )
    # Cho phép null để hỗ trợ đăng ký linh hoạt, nhưng vẫn giữ unique
    user_name = models.CharField(max_length=150, unique=True, null=True, blank=True)
    email = models.EmailField(unique=True, null=True, blank=True)
    phone_number = models.CharField(max_length=20, unique=True, null=True, blank=True)

    first_name = models.CharField(max_length=50, blank=True)
    last_name = models.CharField(max_length=150, blank=True)

    avatar_url = models.URLField(blank=True)
    is_active = models.BooleanField(default=True)
    is_verified = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)

    last_login_at = models.DateTimeField(null=True, blank=True)
    locked_until = models.DateTimeField(null=True, blank=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = "email"

    # Các trường bắt buộc khi chạy lệnh createsuperuser
    REQUIRED_FIELDS = ["user_name"]

    class Meta:
        db_table = "users"

    def __str__(self):
        # Trả về định danh nào có sẵn
        return str(self.email) if self.email else str(self.phone_number or self.user_name)

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()




# New model: RefreshToken for stateful refresh token handling
import uuid as _uuid
from django.utils import timezone as _timezone
from datetime import timedelta as _timedelta

class RefreshToken(models.Model):
    """Store refresh tokens (hashed) to support revoke/rotation per device.

    Fields:
      - jti: UUID in the refresh token payload, unique index
      - user: FK to User
      - token_hash: sha256 hash of the refresh token string
      - created_at, expires_at, revoked, last_used_at
    """
    jti = models.UUIDField(default=_uuid.uuid4, editable=False, unique=True, db_index=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='refresh_tokens')
    token_hash = models.CharField(max_length=128)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    revoked = models.BooleanField(default=False)
    last_used_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'user_refresh_tokens'
        indexes = [models.Index(fields=['jti']), models.Index(fields=['token_hash'])]

    def revoke(self):
        self.revoked = True
        self.save(update_fields=['revoked'])

    def mark_used(self):
        self.last_used_at = _timezone.now()
        self.save(update_fields=['last_used_at'])
