from rest_framework import serializers
from .models import StaffCall
from apps.tables.serializers import TableSerializer
from apps.tables.models import Table


class StaffCallSerializer(serializers.ModelSerializer):
    """Serializer for StaffCall model"""
    table_details = TableSerializer(source='table', read_only=True)
    table_number = serializers.CharField(source='table.table_number', read_only=True)
    call_type_display = serializers.CharField(source='get_call_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    assigned_staff_name = serializers.CharField(source='assigned_staff.full_name', read_only=True)

    class Meta:
        model = StaffCall
        fields = [
            'id', 'table', 'table_details', 'table_number',
            'call_type', 'call_type_display',
            'status', 'status_display',
            'priority', 'priority_display',
            'notes',
            'assigned_staff', 'assigned_staff_name',
            'created_at', 'updated_at',
            'acknowledged_at', 'completed_at',
            'response_time_seconds', 'completion_time_seconds'
        ]
        read_only_fields = [
            'id', 'created_at', 'updated_at',
            'acknowledged_at', 'completed_at',
            'response_time_seconds', 'completion_time_seconds'
        ]


class StaffCallListSerializer(serializers.ModelSerializer):
    """Simplified serializer for staff call listing"""
    table_number = serializers.CharField(source='table.table_number', read_only=True)
    call_type_display = serializers.CharField(source='get_call_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    assigned_staff_name = serializers.CharField(source='assigned_staff.full_name', read_only=True)

    class Meta:
        model = StaffCall
        fields = [
            'id', 'table', 'table_number',
            'call_type', 'call_type_display',
            'status', 'status_display',
            'priority', 'priority_display',
            'notes',
            'assigned_staff', 'assigned_staff_name',
            'created_at', 'response_time_seconds'
        ]


class StaffCallCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating staff calls"""
    table = serializers.PrimaryKeyRelatedField(queryset=Table.objects.all())

    class Meta:
        model = StaffCall
        fields = ['table', 'call_type', 'priority', 'notes']

    def validate(self, data):
        # Auto-set priority based on call_type if not provided
        if 'priority' not in data or not data['priority']:
            call_type = data.get('call_type')
            priority_map = {
                'water': 'normal',
                'utensils': 'normal',
                'clean_table': 'normal',
                'consultation': 'high',
                'other': 'normal',
            }
            data['priority'] = priority_map.get(call_type, 'normal')

        return data


class StaffCallStatusUpdateSerializer(serializers.Serializer):
    """Serializer for updating staff call status"""
    status = serializers.ChoiceField(choices=StaffCall.STATUS_CHOICES)
    assigned_staff = serializers.IntegerField(required=False, allow_null=True)


class StaffCallAssignSerializer(serializers.Serializer):
    """Serializer for assigning staff to a call"""
    assigned_staff = serializers.IntegerField(required=False, allow_null=True)

