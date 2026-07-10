from rest_framework import serializers
from .models import Payment, BankAccount
from apps.orders.models import Order


class BankAccountSerializer(serializers.ModelSerializer):
    """Serializer for BankAccount model"""
    bank_display = serializers.CharField(source='get_bank_code_display', read_only=True)
    created_by_name = serializers.CharField(source='created_by.username', read_only=True, allow_null=True)

    class Meta:
        model = BankAccount
        fields = [
            'id', 'account_number', 'account_name',
            'bank_code', 'bank_display', 'is_active', 'is_default',
            'qr_template', 'notes', 'created_by', 'created_by_name',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']

    def create(self, validated_data):
        # Set created_by from request user
        request = self.context.get('request')
        if request and request.user:
            validated_data['created_by'] = request.user
        return super().create(validated_data)


class PaymentSerializer(serializers.ModelSerializer):

    """Serializer for Payment model"""
    order_id = serializers.IntegerField(write_only=True)
    order_details = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Payment
        fields = [
            'id', 'order_id', 'order', 'order_details',
            'payment_method', 'payment_status', 'amount',
            'qr_code_url', 'qr_data',
            'bank_account_number', 'bank_account_name', 'bank_name',
            'transfer_content', 'transaction_id', 'gateway_transaction_id',
            'created_at', 'updated_at', 'paid_at', 'notes'
        ]
        read_only_fields = [
            'id', 'order', 'payment_status', 'qr_code_url', 'qr_data',
            'transaction_id', 'gateway_transaction_id',
            'created_at', 'updated_at', 'paid_at'
        ]

    def get_order_details(self, obj):
        """Get order details"""
        return {
            'id': obj.order.id,
            'pay_code': obj.order.pay_code,
            'table_number': obj.order.table.table_number,
            'total_amount': str(obj.order.total_amount),
            'status': obj.order.status
        }

    def validate_order_id(self, value):
        """Validate that order exists and doesn't have payment yet"""
        try:
            order = Order.objects.get(id=value)
        except Order.DoesNotExist:
            raise serializers.ValidationError("Order not found")

        if hasattr(order, 'payment'):
            raise serializers.ValidationError("Payment already exists for this order")

        return value

    def validate_amount(self, value):
        """Validate payment amount"""
        if value <= 0:
            raise serializers.ValidationError("Amount must be greater than 0")
        return value


class CreatePaymentQRSerializer(serializers.Serializer):
    """Serializer for creating payment with QR code"""
    pay_code = serializers.CharField(max_length=50)
    payment_method = serializers.ChoiceField(
        choices=['bank_transfer', 'momo', 'vnpay'],
        default='bank_transfer'
    )

    def validate_pay_code(self, value):
        """Validate order exists by pay_code"""
        try:
            order = Order.objects.get(pay_code=value)
        except Order.DoesNotExist:
            raise serializers.ValidationError("Order not found with this pay_code")

        if hasattr(order, 'payment'):
            raise serializers.ValidationError("Payment already exists for this order")

        if order.total_amount <= 0:
            raise serializers.ValidationError("Order amount must be greater than 0")

        return value


class WebhookPayloadSerializer(serializers.Serializer):
    """Serializer for MBBank/Sepay webhook payload"""
    # MBBank webhook format
    id = serializers.IntegerField(required=True)
    gateway = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    transactionDate = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    accountNumber = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    subAccount = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    code = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    content = serializers.CharField(required=True)
    transferType = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    description = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    transferAmount = serializers.DecimalField(max_digits=15, decimal_places=2, required=True)
    referenceCode = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    accumulated = serializers.DecimalField(max_digits=15, decimal_places=2, required=False, allow_null=True)
