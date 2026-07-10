from django.db import models
from django.conf import settings
from apps.tables.models import Table
from apps.menu.models import ProductVariant, Topping
import random
import string


class Order(models.Model):
    """Order model for customer orders"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('awaiting_payment', 'Awaiting Payment'),
        ('confirmed', 'Confirmed'),
        ('preparing', 'Preparing'),
        ('served', 'Served'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]

    table = models.ForeignKey(Table, on_delete=models.CASCADE, related_name='orders')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='orders')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    pay_code = models.CharField(max_length=50, unique=True, null=True, blank=True)
    notes = models.TextField(blank=True, null=True)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    confirmed_at = models.DateTimeField(null=True, blank=True)
    served_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "orders"
        ordering = ['-created_at']

    def __str__(self):
        return f"Order #{self.id} - Table {self.table.table_number}"

    @staticmethod
    def generate_pay_code():
        characters = string.ascii_uppercase + string.digits
        while True:
            code = ''.join(random.choice(characters) for _ in range(8))
            if not Order.objects.filter(pay_code=code).exists():
                return code

    def save(self, *args, **kwargs):
        if not self.pay_code:
            self.pay_code = self.generate_pay_code()
        super().save(*args, **kwargs)

    def calculate_total(self):
        """Calculate total amount from order items"""
        total = sum(item.get_total_price() for item in self.items.all())
        self.total_amount = total
        self.save(update_fields=['total_amount'])
        return total


class OrderItem(models.Model):
    """Order item model for items in an order"""
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    variant = models.ForeignKey(ProductVariant, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "order_items"
        ordering = ['created_at']

    def __str__(self):
        return f"{self.variant.product.name} ({self.variant.get_size_display()}) x {self.quantity}"

    def save(self, *args, **kwargs):
        if not self.price:
            self.price = self.variant.price
        super().save(*args, **kwargs)

    def get_total_price(self):
        """Calculate total price including toppings"""
        item_total = self.price * self.quantity
        toppings_total = sum(
            topping.topping.price * topping.quantity
            for topping in self.toppings.all()
        )
        return item_total + toppings_total


class OrderItemTopping(models.Model):
    """Model for toppings added to order items"""
    order_item = models.ForeignKey(OrderItem, on_delete=models.CASCADE, related_name='toppings')
    topping = models.ForeignKey(Topping, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "order_item_toppings"
        ordering = ['created_at']

    def __str__(self):
        return f"{self.topping.name} x {self.quantity}"

    def save(self, *args, **kwargs):
        if not self.price:
            self.price = self.topping.price
        super().save(*args, **kwargs)

