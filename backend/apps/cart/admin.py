from django.contrib import admin
from .models import CartItem


@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    """
    Cart Item Admin
    """
    list_display = ['user', 'food', 'quantity', 'created_at']
    list_filter = ['created_at', 'user']
    search_fields = ['user__username', 'food__name']
    readonly_fields = ['created_at', 'updated_at']
