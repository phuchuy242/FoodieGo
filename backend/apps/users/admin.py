from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser


@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    """
    Custom User Admin
    """
    fieldsets = UserAdmin.fieldsets + (
        ('Custom Fields', {'fields': ('role', 'phone_number')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Custom Fields', {'fields': ('role', 'phone_number')}),
    )
    list_display = ['username', 'email', 'role', 'phone_number', 'is_active']
    list_filter = UserAdmin.list_filter + ('role', 'is_active')
    search_fields = UserAdmin.search_fields + ('phone_number',)
