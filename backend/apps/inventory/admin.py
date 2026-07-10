from django.contrib import admin
from apps.ingredient.models import Ingredient
from .models import VariantRecipe, ToppingRecipe


@admin.register(Ingredient)
class IngredientAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'unit', 'number_of', 'min_quantity', 'cost_per_unit', 'created_at']
    list_filter = ['unit', 'created_at']
    search_fields = ['name']


@admin.register(VariantRecipe)
class VariantRecipeAdmin(admin.ModelAdmin):
    list_display = ['id', 'variant', 'ingredient', 'quantity', 'created_at']
    list_filter = ['created_at']
    search_fields = ['variant__product__name', 'ingredient__name']
    raw_id_fields = ['variant', 'ingredient']


@admin.register(ToppingRecipe)
class ToppingRecipeAdmin(admin.ModelAdmin):
    list_display = ['id', 'topping', 'ingredient', 'quantity', 'created_at']
    list_filter = ['created_at']
    search_fields = ['topping__name', 'ingredient__name']
    raw_id_fields = ['topping', 'ingredient']

