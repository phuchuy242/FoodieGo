from django.contrib import admin
from .models import Food


@admin.register(Food)
class FoodAdmin(admin.ModelAdmin):
    """
    Food Admin
    """
    list_display = ['name', 'category', 'price', 'is_available', 'is_popular', 'preparation_time']
    list_filter = ['category', 'is_available', 'is_popular', 'created_at']
    search_fields = ['name', 'description']
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'description', 'category')
        }),
        ('Pricing & Availability', {
            'fields': ('price', 'is_available', 'is_popular')
        }),
        ('Additional Info', {
            'fields': ('image', 'preparation_time')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
