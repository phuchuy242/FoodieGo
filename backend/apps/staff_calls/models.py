from django.db import models
from django.conf import settings
from apps.tables.models import Table


class StaffCall(models.Model):
    """Model for customer staff call requests"""

    CALL_TYPE_CHOICES = [
        ('water', 'Thêm nước lọc'),
        ('utensils', 'Thêm bát đũa'),
        ('clean_table', 'Dọn bàn'),
        ('consultation', 'Tư vấn món'),
        ('other', 'Khác'),
    ]

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('acknowledged', 'Acknowledged'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('normal', 'Normal'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]

    table = models.ForeignKey(Table, on_delete=models.CASCADE, related_name='staff_calls')
    call_type = models.CharField(max_length=20, choices=CALL_TYPE_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='normal')
    notes = models.TextField(blank=True, null=True, help_text='Ghi chú thêm từ khách hàng')

    # Staff handling
    assigned_staff = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_calls'
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    acknowledged_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    # Response tracking
    response_time_seconds = models.IntegerField(null=True, blank=True, help_text='Thời gian phản hồi (giây)')
    completion_time_seconds = models.IntegerField(null=True, blank=True, help_text='Thời gian hoàn thành (giây)')

    class Meta:
        db_table = "staff_calls"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['table', 'status']),
            models.Index(fields=['status', 'created_at']),
            models.Index(fields=['assigned_staff', 'status']),
        ]

    def __str__(self):
        return f"Call #{self.id} - {self.get_call_type_display()} - Table {self.table.table_number}"

    def calculate_response_time(self):
        """Calculate response time from created to acknowledged"""
        if self.acknowledged_at and self.created_at:
            delta = self.acknowledged_at - self.created_at
            self.response_time_seconds = int(delta.total_seconds())
            self.save(update_fields=['response_time_seconds'])

    def calculate_completion_time(self):
        """Calculate completion time from created to completed"""
        if self.completed_at and self.created_at:
            delta = self.completed_at - self.created_at
            self.completion_time_seconds = int(delta.total_seconds())
            self.save(update_fields=['completion_time_seconds'])

