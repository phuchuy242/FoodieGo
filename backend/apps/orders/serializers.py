from rest_framework import serializers
from apps.foods.serializers import FoodSerializer
from .models import Order, OrderItem


class OrderItemSerializer(serializers.ModelSerializer):
    """
    Serializer for Order Item
    """
    food = FoodSerializer(read_only=True)
    subtotal = serializers.SerializerMethodField()
    
    class Meta:
        model = OrderItem
        fields = ['id', 'food', 'quantity', 'price', 'subtotal']
    
    def get_subtotal(self, obj):
        return str(obj.subtotal)


class OrderSerializer(serializers.ModelSerializer):
    """
    Serializer for Order
    """
    items = OrderItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'user', 'status', 'total_amount',
            'delivery_address', 'delivery_phone', 'notes', 'items',
            'created_at', 'updated_at', 'delivered_at'
        ]
        read_only_fields = ['id', 'order_number', 'created_at', 'updated_at', 'delivered_at']
