from rest_framework import serializers
from .models import Voucher


class VoucherSerializer(serializers.ModelSerializer):
    """
    Serializer for Voucher
    """
    is_valid = serializers.SerializerMethodField()
    
    class Meta:
        model = Voucher
        fields = [
            'id', 'code', 'discount_type', 'discount_value', 'description',
            'max_usage', 'current_usage', 'min_order_amount', 'is_active',
            'start_date', 'end_date', 'is_valid', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'current_usage', 'created_at', 'updated_at']
    
    def get_is_valid(self, obj):
        return obj.is_valid()
