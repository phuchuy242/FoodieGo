from rest_framework import serializers
from datetime import datetime


class TimestampField(serializers.DateTimeField):

    def to_representation(self, value):
        if not value:
            return None
        if isinstance(value, datetime):
            return value.strftime('%Y-%m-%d %H:%M:%S')
        return value

