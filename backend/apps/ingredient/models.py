from django.db import models


class Ingredient(models.Model):
    """Ingredient model for inventory management"""
    name = models.CharField(max_length=255, unique=True)
    unit = models.CharField(max_length=50)  # kg, liter, pieces, etc.
    number_of = models.DecimalField(max_digits=10, decimal_places=2, default=0)  # Current quantity/stock
    min_quantity = models.DecimalField(max_digits=10, decimal_places=2, default=0)  # Minimum stock level
    cost_per_unit = models.DecimalField(max_digits=10, decimal_places=2, default=0)  # Cost per unit
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True, null=True, blank=True)

    class Meta:
        db_table = "ingredient"
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.unit})"

    def is_low_stock(self):
        """Check if ingredient is running low on stock"""
        return self.number_of <= self.min_quantity

    def is_out_of_stock(self):
        """Check if ingredient is out of stock"""
        return self.number_of <= 0

