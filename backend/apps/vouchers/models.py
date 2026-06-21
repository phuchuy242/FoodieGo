from django.db import models
from django.utils import timezone


class Voucher(models.Model):
    """
    Voucher/Discount Code Model
    """
    DISCOUNT_TYPE_CHOICES = [
        ('percentage', 'Percentage Discount'),
        ('fixed', 'Fixed Amount Discount'),
    ]
    
    code = models.CharField(max_length=50, unique=True)
    discount_type = models.CharField(
        max_length=20,
        choices=DISCOUNT_TYPE_CHOICES,
        default='percentage'
    )
    discount_value = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(blank=True, null=True)
    max_usage = models.IntegerField(null=True, blank=True)
    current_usage = models.IntegerField(default=0)
    min_order_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    is_active = models.BooleanField(default=True)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'vouchers_voucher'
        ordering = ['-created_at']
        verbose_name = 'Voucher'
        verbose_name_plural = 'Vouchers'
    
    def __str__(self):
        return self.code
    
    def is_valid(self):
        """Check if voucher is valid"""
        now = timezone.now()
        return (
            self.is_active and
            self.start_date <= now <= self.end_date and
            (self.max_usage is None or self.current_usage < self.max_usage)
        )
