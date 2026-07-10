from rest_framework import serializers
from .models import Ingredient


class IngredientSerializer(serializers.ModelSerializer):
    """Serializer for Ingredient model"""

    class Meta:
        model = Ingredient
        fields = '__all__'