from rest_framework import serializers
from .models import Food


class FoodSerializer(serializers.ModelSerializer):
    """
    Serializer for Food model
    """
    class Meta:
        model = Food
        fields = [
            'id', 'name', 'description', 'category', 'price', 'image',
            'is_available', 'is_popular', 'preparation_time',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class FoodCreateUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating and updating Food
    """
    class Meta:
        model = Food
        fields = [
            'name', 'description', 'category', 'price', 'image',
            'is_available', 'is_popular', 'preparation_time'
        ]
