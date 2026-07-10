from django.contrib import admin
from .models import Table


@admin.register(Table)
class TableAdmin(admin.ModelAdmin):
    list_display = ['id', 'table_number', 'capacity', 'status', 'location', 'created_at']
    list_filter = ['status', 'capacity', 'created_at']
    search_fields = ['table_number', 'location']

