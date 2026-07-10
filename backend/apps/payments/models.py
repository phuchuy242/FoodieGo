from django.db import models
from django.conf import settings
from apps.orders.models import Order


class BankAccount(models.Model):
    """Model to store bank account information for payment QR generation"""

    BANK_CHOICES = [
        ('MB', 'MBBank'),
        ('VCB', 'Vietcombank'),
        ('TCB', 'Techcombank'),
        ('ACB', 'ACB'),
        ('VTB', 'VietinBank'),
        ('BIDV', 'BIDV'),
        ('VPB', 'VPBank'),
        ('TPB', 'TPBank'),
        ('STB', 'Sacombank'),
        ('SHB', 'SHB'),
        ('MSB', 'MSB'),
        ('OCB', 'OCB'),
    ]

    # Restaurant association - removed for now (can add later if needed)
    # restaurant = models.ForeignKey(...)

    # Bank account details
    account_number = models.CharField(max_length=50, verbose_name="Số tài khoản")
    account_name = models.CharField(max_length=255, verbose_name="Tên tài khoản")
    bank_code = models.CharField(
        max_length=10,
        choices=BANK_CHOICES,
        verbose_name="Ngân hàng"
    )

    # Status
    is_active = models.BooleanField(default=True, verbose_name="Đang hoạt động")
    is_default = models.BooleanField(default=False, verbose_name="Tài khoản mặc định")

    # QR template preference
    qr_template = models.CharField(
        max_length=20,
        default='qr_only',
        choices=[
            ('compact', 'Compact'),
            ('compact2', 'Compact 2'),
            ('print', 'Print'),
            ('qr_only', 'QR Only'),
        ],
        verbose_name="Template QR"
    )

    # Metadata
    notes = models.TextField(blank=True, null=True, verbose_name="Ghi chú")
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_bank_accounts'
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "bank_accounts"
        ordering = ['-is_default', '-created_at']
        verbose_name = "Tài khoản ngân hàng"
        verbose_name_plural = "Tài khoản ngân hàng"

    def __str__(self):
        return f"{self.bank_code} - {self.account_number} - {self.account_name}"

    def save(self, *args, **kwargs):
        # If this is set as default, unset other defaults
        if self.is_default:
            BankAccount.objects.filter(
                is_default=True
            ).exclude(pk=self.pk).update(is_default=False)
        super().save(*args, **kwargs)

    @classmethod
    def get_default_account(cls, restaurant=None):
        """Get default bank account"""
        return cls.objects.filter(
            is_active=True,
            is_default=True
        ).first() or cls.objects.filter(
            is_active=True
        ).first()


class Payment(models.Model):

    """Payment model for order payments"""
    PAYMENT_METHOD_CHOICES = [
        ('cash', 'Cash'),
        ('bank_transfer', 'Bank Transfer'),
    ]

    PAYMENT_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
    ]

    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='payment')
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES, default='bank_transfer')
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='pending')
    amount = models.DecimalField(max_digits=10, decimal_places=2)

    # QR Code information
    qr_code_url = models.URLField(max_length=500, null=True, blank=True)
    qr_data = models.TextField(null=True, blank=True)  # Store QR data for regeneration

    # Bank transfer information
    bank_account_number = models.CharField(max_length=50, null=True, blank=True)
    bank_account_name = models.CharField(max_length=255, null=True, blank=True)
    bank_name = models.CharField(max_length=100, null=True, blank=True)
    transfer_content = models.CharField(max_length=255, null=True, blank=True)  # Nội dung chuyển khoản

    # Sepay webhook data
    transaction_id = models.CharField(max_length=100, unique=True, null=True, blank=True)  # Sepay transaction ID
    gateway_transaction_id = models.CharField(max_length=100, null=True, blank=True)  # Bank transaction ID
    webhook_data = models.JSONField(null=True, blank=True)  # Store full webhook payload

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    paid_at = models.DateTimeField(null=True, blank=True)

    # Additional info
    notes = models.TextField(blank=True, null=True)
    processed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='processed_payments'
    )

    class Meta:
        db_table = "payments"
        ordering = ['-created_at']

    def __str__(self):
        return f"Payment #{self.id} - Order #{self.order.id} - {self.payment_status}"

    def mark_as_completed(self, transaction_id=None, gateway_transaction_id=None, webhook_data=None):
        """Mark payment as completed"""
        from django.utils import timezone

        self.payment_status = 'completed'
        self.paid_at = timezone.now()

        if transaction_id:
            self.transaction_id = transaction_id
        if gateway_transaction_id:
            self.gateway_transaction_id = gateway_transaction_id
        if webhook_data:
            self.webhook_data = webhook_data

        self.save()

        # Update order status to completed
        if self.order.status != 'completed':
            self.order.status = 'completed'
            self.order.completed_at = timezone.now()
            self.order.save()

    def mark_as_failed(self, reason=None):
        """Mark payment as failed"""
        self.payment_status = 'failed'
        if reason:
            self.notes = f"{self.notes or ''}\nFailed: {reason}".strip()
        self.save()

