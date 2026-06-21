from django.contrib import admin
from .models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
    """
    Order Item Inline Admin
    """
    model = OrderItem
    extra = 0


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    """
    Order Admin
    """
    list_display = ['order_number', 'user', 'status', 'total_amount', 'created_at']
    list_filter = ['status', 'created_at', 'user']
    search_fields = ['order_number', 'user__username', 'delivery_address']
    readonly_fields = ['order_number', 'created_at', 'updated_at', 'delivered_at']
    inlines = [OrderItemInline]
    fieldsets = (
        ('Order Information', {
            'fields': ('order_number', 'user', 'status')
        }),
        ('Delivery Details', {
            'fields': ('delivery_address', 'delivery_phone')
        }),
        ('Financial', {
            'fields': ('total_amount',)
        }),
        ('Additional Info', {
            'fields': ('notes', 'created_at', 'updated_at', 'delivered_at'),
            'classes': ('collapse',)
        }),
    )
