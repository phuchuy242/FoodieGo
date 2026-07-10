from rest_framework import serializers
from .models import Order, OrderItem, OrderItemTopping
from apps.tables.serializers import TableSerializer
from apps.menu.serializers import ProductVariantSerializer, ToppingSerializer
from apps.menu.models import ProductVariant
from apps.tables.models import Table

class OrderItemToppingSerializer(serializers.ModelSerializer):
    """Serializer for OrderItemTopping model"""
    topping_name = serializers.CharField(source='topping.name', read_only=True)
    topping_details = ToppingSerializer(source='topping', read_only=True)

    class Meta:
        model = OrderItemTopping
        fields = ['id', 'order_item', 'topping', 'topping_name', 'topping_details',
                  'quantity', 'price', 'created_at']
        read_only_fields = ['id', 'price', 'created_at']


class OrderItemSerializer(serializers.ModelSerializer):
    """Serializer for OrderItem model"""
    variant_details = ProductVariantSerializer(source='variant', read_only=True)
    product_name = serializers.CharField(source='variant.product.name', read_only=True)
    size = serializers.CharField(source='variant.get_size_display', read_only=True)
    toppings = OrderItemToppingSerializer(many=True, read_only=True)
    total_price = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = ['id', 'order', 'variant', 'variant_details', 'product_name', 'size',
                  'quantity', 'price', 'notes', 'toppings', 'total_price',
                  'created_at', 'updated_at']
        read_only_fields = ['id', 'price', 'created_at', 'updated_at']

    def get_total_price(self, obj):
        return obj.get_total_price()


class OrderSerializer(serializers.ModelSerializer):
    """Serializer for Order model"""
    table_details = TableSerializer(source='table', read_only=True)
    table_number = serializers.CharField(source='table.table_number', read_only=True)
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    items = OrderItemSerializer(many=True, read_only=True)
    items_count = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = ['id', 'table', 'table_details', 'table_number', 'user', 'user_name',
                  'status', 'status_display', 'pay_code', 'notes', 'total_amount', 'items', 'items_count',
                  'created_at', 'updated_at', 'confirmed_at', 'served_at', 'completed_at']
        read_only_fields = ['id', 'user', 'pay_code', 'total_amount', 'created_at', 'updated_at',
                           'confirmed_at', 'served_at', 'completed_at']

    def get_items_count(self, obj):
        return obj.items.count()


class OrderListSerializer(serializers.ModelSerializer):
    """Simplified serializer for order listing"""
    table_number = serializers.CharField(source='table.table_number', read_only=True)
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    items_count = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = ['id', 'table', 'table_number', 'user', 'user_name',
                  'status', 'status_display', 'pay_code', 'total_amount', 'items_count',
                  'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'pay_code', 'total_amount', 'created_at', 'updated_at']

    def get_items_count(self, obj):
        return obj.items.count()


class OrderStatusUpdateSerializer(serializers.Serializer):
    """Serializer for updating order status"""
    status = serializers.ChoiceField(choices=Order.STATUS_CHOICES)


class OrderHistorySerializer(serializers.ModelSerializer):
    """Serializer for viewing order history with all items timeline"""
    table_number = serializers.CharField(source='table.table_number', read_only=True)
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    items = OrderItemSerializer(many=True, read_only=True)
    items_count = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = ['id', 'table', 'table_number', 'user', 'user_name',
                  'status', 'status_display', 'pay_code', 'notes', 'total_amount',
                  'items', 'items_count',
                  'created_at', 'updated_at', 'confirmed_at', 'served_at', 'completed_at']
        read_only_fields = ['id', 'user', 'pay_code', 'total_amount', 'created_at', 'updated_at',
                           'confirmed_at', 'served_at', 'completed_at']

    def get_items_count(self, obj):
        return obj.items.count()


# --- Create Serializers ---

class OrderItemCreateSerializer(serializers.Serializer):
    """Serializer for creating order items within an order"""
    variant = serializers.PrimaryKeyRelatedField(queryset=ProductVariant.objects.all())
    quantity = serializers.IntegerField(min_value=1)
    notes = serializers.CharField(required=False, allow_blank=True)

class OrderCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating an order with items"""
    items = OrderItemCreateSerializer(many=True)
    table = serializers.PrimaryKeyRelatedField(queryset=Table.objects.all())

    class Meta:
        model = Order
        fields = ['table', 'items', 'notes']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        table = validated_data['table']

        # 1. Check if there's an active order for this table
        # Active statuses: pending, confirmed, preparing, served
        # Exclude awaiting_payment (user needs to cancel payment first)
        active_order = Order.objects.filter(
            table=table,
            status__in=['pending', 'confirmed', 'preparing', 'served']
        ).first()

        if active_order:
            # Use existing active order
            order = active_order
            # Update notes if provided
            if validated_data.get('notes'):
                order.notes = (order.notes or '') + '\n' + validated_data['notes']
                order.save()
        else:
            # Create new order
            order = Order.objects.create(**validated_data)

        # 2. Create OrderItems
        for item_data in items_data:
            variant = item_data['variant']
            quantity = item_data['quantity']
            notes = item_data.get('notes', '')
            
            OrderItem.objects.create(
                order=order,
                variant=variant,
                quantity=quantity,
                price=variant.price,
                notes=notes
            )

        # 3. Calculate total
        order.calculate_total()
        return order
