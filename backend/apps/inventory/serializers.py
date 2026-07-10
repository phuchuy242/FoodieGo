from rest_framework import serializers
from apps.ingredient.models import Ingredient
from .models import VariantRecipe, ToppingRecipe


class IngredientSerializer(serializers.ModelSerializer):
    """Serializer for Ingredient model"""
    is_low_stock = serializers.SerializerMethodField()
    is_out_of_stock = serializers.SerializerMethodField()

    class Meta:
        model = Ingredient
        fields = ['id', 'name', 'unit', 'number_of', 'min_quantity', 'cost_per_unit',
                  'is_low_stock', 'is_out_of_stock', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_is_low_stock(self, obj):
        return obj.is_low_stock()

    def get_is_out_of_stock(self, obj):
        return obj.is_out_of_stock()


class StockAdjustmentSerializer(serializers.Serializer):
    """Serializer for adjusting ingredient stock"""
    adjustment = serializers.DecimalField(max_digits=10, decimal_places=2)
    reason = serializers.CharField(max_length=255, required=False, allow_blank=True)


class VariantRecipeSerializer(serializers.ModelSerializer):
    """Serializer for VariantRecipe model"""
    variant_name = serializers.CharField(source='variant.__str__', read_only=True)
    ingredient_name = serializers.CharField(source='ingredient.name', read_only=True)
    ingredient_unit = serializers.CharField(source='ingredient.unit', read_only=True)

    class Meta:
        model = VariantRecipe
        fields = ['id', 'variant', 'variant_name', 'ingredient', 'ingredient_name',
                  'ingredient_unit', 'quantity', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class ToppingRecipeSerializer(serializers.ModelSerializer):
    """Serializer for ToppingRecipe model"""
    topping_name = serializers.CharField(source='topping.name', read_only=True)
    ingredient_name = serializers.CharField(source='ingredient.name', read_only=True)
    ingredient_unit = serializers.CharField(source='ingredient.unit', read_only=True)

    class Meta:
        model = ToppingRecipe
        fields = ['id', 'topping', 'topping_name', 'ingredient', 'ingredient_name',
                  'ingredient_unit', 'quantity', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

