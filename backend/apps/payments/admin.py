from django.contrib import admin
from .models import Payment, BankAccount


@admin.register(BankAccount)
class BankAccountAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'account_number', 'account_name', 'bank_code',
        'is_active', 'is_default', 'created_at'
    ]
    list_filter = ['bank_code', 'is_active', 'is_default', 'created_at']
    search_fields = ['account_number', 'account_name', 'notes']
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = (
        ('Bank Account Details', {
            'fields': (
                'account_number', 'account_name', 'bank_code'
            )
        }),
        ('Settings', {
            'fields': ('is_active', 'is_default', 'qr_template')
        }),
        ('Additional Info', {
            'fields': ('notes', 'created_by')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )

    def save_model(self, request, obj, form, change):
        if not change:  # Creating new object
            obj.created_by = request.user
        super().save_model(request, obj, form, change)



@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):

    list_display = [
        'id', 'order', 'payment_method', 'payment_status',
        'amount', 'transaction_id', 'created_at', 'paid_at'
    ]
    list_filter = ['payment_status', 'payment_method', 'created_at']
    search_fields = [
        'order__pay_code', 'transaction_id',
        'gateway_transaction_id', 'transfer_content'
    ]
    readonly_fields = [
        'created_at', 'updated_at', 'paid_at',
        'qr_code_url', 'qr_data', 'webhook_data'
    ]
    fieldsets = (
        ('Order Information', {
            'fields': ('order', 'amount')
        }),
        ('Payment Details', {
            'fields': (
                'payment_method', 'payment_status',
                'transaction_id', 'gateway_transaction_id'
            )
        }),
        ('Bank Transfer Info', {
            'fields': (
                'bank_account_number', 'bank_account_name',
                'bank_name', 'transfer_content'
            )
        }),
        ('QR Code', {
            'fields': ('qr_code_url', 'qr_data'),
            'classes': ('collapse',)
        }),
        ('Webhook Data', {
            'fields': ('webhook_data',),
            'classes': ('collapse',)
        }),
        ('Additional Info', {
            'fields': ('notes', 'processed_by')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'paid_at')
        }),
    )
