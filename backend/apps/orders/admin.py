from django.contrib import admin
from .models import Order, OrderItem, OrderItemTopping


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 1
    raw_id_fields = ['variant']


class OrderItemToppingInline(admin.TabularInline):
    model = OrderItemTopping
    extra = 1
    raw_id_fields = ['topping']


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'table', 'user', 'status', 'total_amount', 'created_at']
    list_filter = ['status', 'created_at', 'confirmed_at', 'served_at', 'completed_at']
    search_fields = ['table__table_number', 'user__email', 'notes']
    raw_id_fields = ['table', 'user']
    inlines = [OrderItemInline]
    readonly_fields = ['total_amount', 'created_at', 'updated_at', 'confirmed_at', 'served_at', 'completed_at']


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ['id', 'order', 'variant', 'quantity', 'price', 'created_at']
    list_filter = ['created_at']
    search_fields = ['order__id', 'variant__product__name']
    raw_id_fields = ['order', 'variant']
    inlines = [OrderItemToppingInline]


@admin.register(OrderItemTopping)
class OrderItemToppingAdmin(admin.ModelAdmin):
    list_display = ['id', 'order_item', 'topping', 'quantity', 'price', 'created_at']
    list_filter = ['created_at']
    search_fields = ['order_item__id', 'topping__name']
    raw_id_fields = ['order_item', 'topping']

