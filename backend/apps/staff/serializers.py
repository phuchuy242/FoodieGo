from rest_framework import serializers
from .models import Role
from core.fields import TimestampField


class RoleSerializer(serializers.ModelSerializer):
    """Serializer for Role model"""
    created_at = TimestampField(read_only=True)
    updated_at = TimestampField(read_only=True)

    class Meta:
        model = Role
        fields = ['id', 'slug', 'name_vi', 'name_en', 'created_at', 'updated_at']
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at']

