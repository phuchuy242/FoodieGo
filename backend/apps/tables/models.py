from django.db import models


class Table(models.Model):
    """Table model for restaurant tables"""
    STATUS_CHOICES = [
        ('available', 'Available'),
        ('occupied', 'Occupied'),
        ('reserved', 'Reserved'),
    ]

    table_number = models.CharField(max_length=50, unique=True)
    capacity = models.PositiveIntegerField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='available')
    location = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "tables"
        ordering = ['table_number']

    def __str__(self):
        return f"Table {self.table_number}"

