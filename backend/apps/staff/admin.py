from django.contrib import admin
from .models import Role


@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ['id', 'name_en', 'name_vi', 'slug', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name_en', 'name_vi', 'slug']
    readonly_fields = ['slug', 'created_at', 'updated_at']
