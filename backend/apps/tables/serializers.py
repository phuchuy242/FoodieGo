from rest_framework import serializers
from .models import Table


class TableSerializer(serializers.ModelSerializer):
    """Serializer for Table model"""
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Table
        fields = ['id', 'table_number', 'capacity', 'status', 'status_display',
                  'location', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class TableStatusUpdateSerializer(serializers.Serializer):
    """Serializer for updating table status"""
    status = serializers.ChoiceField(choices=Table.STATUS_CHOICES)

