from django.db import models

class DishIngredient(models.Model):
    """
    DEPRECATED: This model is deprecated in favor of apps.inventory.models.VariantRecipe.
    Please migrate logical dependencies to VariantRecipe.
    """
    dish = models.ForeignKey('menu.Product', on_delete=models.CASCADE)
    ingredient = models.ForeignKey('ingredient.Ingredient', on_delete=models.CASCADE)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)