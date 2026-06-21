from django.db import models
from django.contrib.auth.models import AbstractUser


class CustomUser(AbstractUser):
    """
    Custom User model with role and phone number fields.
    """
    ROLE_CHOICES = [
        ('admin', 'Administrator'),
        ('restaurant_manager', 'Restaurant Manager'),
        ('delivery_staff', 'Delivery Staff'),
        ('customer', 'Customer'),
    ]
    
    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='customer'
    )
    phone_number = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        unique=True
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'auth_user'
        ordering = ['-created_at']
        verbose_name = 'User'
        verbose_name_plural = 'Users'
    
    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
