from django.contrib import admin
from .models import Voucher


@admin.register(Voucher)
class VoucherAdmin(admin.ModelAdmin):
    """
    Voucher Admin
    """
    list_display = ['code', 'discount_type', 'discount_value', 'is_active', 'current_usage', 'max_usage']
    list_filter = ['discount_type', 'is_active', 'created_at']
    search_fields = ['code', 'description']
    readonly_fields = ['current_usage', 'created_at', 'updated_at']
    fieldsets = (
        ('Code & Discount', {
            'fields': ('code', 'discount_type', 'discount_value')
        }),
        ('Conditions', {
            'fields': ('min_order_amount', 'max_usage', 'current_usage')
        }),
        ('Validity', {
            'fields': ('is_active', 'start_date', 'end_date')
        }),
        ('Additional Info', {
            'fields': ('description', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
