from django.db import models
from apps.ingredient.models import Ingredient


class VariantRecipe(models.Model):
    """Recipe for product variants - ingredients needed"""
    variant = models.ForeignKey('menu.ProductVariant', on_delete=models.CASCADE, related_name='recipes')
    ingredient = models.ForeignKey(Ingredient, on_delete=models.CASCADE, related_name='variant_recipes')
    quantity = models.DecimalField(max_digits=10, decimal_places=3)  # Quantity needed per serving
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "variant_recipes"
        unique_together = ['variant', 'ingredient']
        ordering = ['variant', 'ingredient']

    def __str__(self):
        return f"{self.variant} - {self.ingredient.name}: {self.quantity} {self.ingredient.unit}"


class ToppingRecipe(models.Model):
    """Recipe for toppings - ingredients needed"""
    topping = models.ForeignKey('menu.Topping', on_delete=models.CASCADE, related_name='recipes')
    ingredient = models.ForeignKey(Ingredient, on_delete=models.CASCADE, related_name='topping_recipes')
    quantity = models.DecimalField(max_digits=10, decimal_places=3)  # Quantity needed per serving
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "topping_recipes"
        unique_together = ['topping', 'ingredient']
        ordering = ['topping', 'ingredient']

    def __str__(self):
        return f"{self.topping} - {self.ingredient.name}: {self.quantity} {self.ingredient.unit}"

