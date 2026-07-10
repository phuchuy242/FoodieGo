from django.contrib import admin
from .models import StaffCall


@admin.register(StaffCall)
class StaffCallAdmin(admin.ModelAdmin):
    list_display = ['id', 'table', 'call_type', 'status', 'priority', 'assigned_staff', 'created_at']
    list_filter = ['status', 'call_type', 'priority', 'created_at']
    search_fields = ['table__table_number', 'notes']
    readonly_fields = ['created_at', 'updated_at', 'acknowledged_at', 'completed_at',
                      'response_time_seconds', 'completion_time_seconds']

    fieldsets = (
        ('Call Information', {
            'fields': ('table', 'call_type', 'priority', 'notes')
        }),
        ('Status & Assignment', {
            'fields': ('status', 'assigned_staff')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'acknowledged_at', 'completed_at')
        }),
        ('Performance Metrics', {
            'fields': ('response_time_seconds', 'completion_time_seconds')
        }),
    )

