from rest_framework import serializers
from apps.foods.serializers import FoodSerializer
from .models import CartItem


class CartItemSerializer(serializers.ModelSerializer):
    """
    Serializer for Cart Item
    """
    food = FoodSerializer(read_only=True)
    food_id = serializers.IntegerField(write_only=True)
    subtotal = serializers.SerializerMethodField()
    
    class Meta:
        model = CartItem
        fields = ['id', 'food', 'food_id', 'quantity', 'subtotal', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_subtotal(self, obj):
        return str(obj.subtotal)
