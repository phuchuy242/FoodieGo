from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.utils import timezone
from django.db.models import Q, Avg, Count

from .models import StaffCall
from .serializers import (
    StaffCallSerializer, StaffCallListSerializer,
    StaffCallCreateSerializer, StaffCallStatusUpdateSerializer,
    StaffCallAssignSerializer
)
from core.responses import success_response, error_response, created_response, StandardResultsSetPagination
from core.mixins import FilterSortMixin, StandardResponseMixin


class StaffCallViewSet(FilterSortMixin, StandardResponseMixin, viewsets.ModelViewSet):
    """ViewSet for Staff Call CRUD operations"""
    queryset = StaffCall.objects.all()
    pagination_class = StandardResultsSetPagination
    search_fields = ['table__table_number', 'notes', 'call_type']

    def get_permissions(self):
        """
        Allow public access for customers to create calls
        Require authentication for staff management actions
        """
        if self.action in ['create']:
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    def get_serializer_class(self):
        if self.action == 'list':
            return StaffCallListSerializer
        if self.action == 'create':
            return StaffCallCreateSerializer
        return StaffCallSerializer

    def get_queryset(self):
        queryset = StaffCall.objects.select_related('table', 'assigned_staff')

        # Filter by status
        status_param = self.request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param)

        # Filter by call_type
        call_type = self.request.query_params.get('call_type')
        if call_type:
            queryset = queryset.filter(call_type=call_type)

        # Filter by priority
        priority = self.request.query_params.get('priority')
        if priority:
            queryset = queryset.filter(priority=priority)

        # Filter by table
        table_id = self.request.query_params.get('table_id')
        if table_id:
            queryset = queryset.filter(table_id=table_id)

        # Filter by assigned staff
        assigned_staff_id = self.request.query_params.get('assigned_staff_id')
        if assigned_staff_id:
            queryset = queryset.filter(assigned_staff_id=assigned_staff_id)

        return queryset

    def create(self, request, *args, **kwargs):
        """Create a new staff call"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        staff_call = serializer.save()

        # TODO: Send real-time notification to staff (WebSocket/Pusher)
        # self._notify_staff(staff_call)

        response_serializer = StaffCallSerializer(staff_call)
        return created_response(
            data=response_serializer.data,
            msg='Staff call created successfully. Staff will assist you shortly.'
        )

    @action(detail=False, methods=['get'])
    def pending(self, request):
        """Get all pending staff calls"""
        calls = self.get_queryset().filter(status='pending').order_by('-priority', 'created_at')
        serializer = StaffCallListSerializer(calls, many=True)
        return success_response(
            data=serializer.data,
            msg='Pending staff calls retrieved successfully'
        )

    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get all active staff calls (pending, acknowledged, in_progress)"""
        calls = self.get_queryset().filter(
            status__in=['pending', 'acknowledged', 'in_progress']
        ).order_by('-priority', 'created_at')
        serializer = StaffCallListSerializer(calls, many=True)
        return success_response(
            data=serializer.data,
            msg='Active staff calls retrieved successfully'
        )

    @action(detail=False, methods=['get'], url_path='by-table')
    def by_table(self, request):
        """Get staff calls filtered by table"""
        table_id = request.query_params.get('table_id')
        if not table_id:
            return error_response(msg='table_id parameter is required', code=400)

        calls = self.get_queryset().filter(table_id=table_id)
        serializer = StaffCallListSerializer(calls, many=True)
        return success_response(
            data=serializer.data,
            msg='Staff calls retrieved successfully'
        )

    @action(detail=False, methods=['get'], url_path='my-assignments')
    def my_assignments(self, request):
        """Get staff calls assigned to current user"""
        calls = self.get_queryset().filter(
            assigned_staff=request.user,
            status__in=['pending', 'acknowledged', 'in_progress']
        ).order_by('-priority', 'created_at')
        serializer = StaffCallListSerializer(calls, many=True)
        return success_response(
            data=serializer.data,
            msg='Your assigned calls retrieved successfully'
        )

    @action(detail=True, methods=['patch'], url_path='update-status')
    def update_status(self, request, pk=None):
        """Update staff call status"""
        staff_call = self.get_object()
        serializer = StaffCallStatusUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        new_status = serializer.validated_data['status']
        assigned_staff_id = serializer.validated_data.get('assigned_staff')

        # Update status
        staff_call.status = new_status

        # Update timestamps based on status
        if new_status == 'acknowledged' and not staff_call.acknowledged_at:
            staff_call.acknowledged_at = timezone.now()
            staff_call.calculate_response_time()
        elif new_status == 'completed' and not staff_call.completed_at:
            staff_call.completed_at = timezone.now()
            staff_call.calculate_completion_time()

        # Assign staff if provided
        if assigned_staff_id is not None:
            from django.contrib.auth import get_user_model
            User = get_user_model()
            try:
                staff_user = User.objects.get(id=assigned_staff_id, role__in=['staff', 'manager', 'admin'])
                staff_call.assigned_staff = staff_user
            except User.DoesNotExist:
                return error_response(msg='Invalid staff user ID', code=400)
        elif new_status in ['acknowledged', 'in_progress'] and not staff_call.assigned_staff:
            # Auto-assign to current user if not assigned and user is authenticated
            if request.user.is_authenticated:
                staff_call.assigned_staff = request.user

        staff_call.save()

        response_serializer = StaffCallSerializer(staff_call)
        return success_response(
            data=response_serializer.data,
            msg='Staff call status updated successfully'
        )

    @action(detail=True, methods=['patch'], url_path='assign')
    def assign_staff(self, request, pk=None):
        """Assign staff to a call"""
        staff_call = self.get_object()
        serializer = StaffCallAssignSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        assigned_staff_id = serializer.validated_data.get('assigned_staff')

        if assigned_staff_id is not None:
            from django.contrib.auth import get_user_model
            User = get_user_model()
            try:
                staff_user = User.objects.get(id=assigned_staff_id, role__in=['staff', 'manager', 'admin'])
                staff_call.assigned_staff = staff_user
            except User.DoesNotExist:
                return error_response(msg='Invalid staff user ID', code=400)
        else:
            staff_call.assigned_staff = None

        staff_call.save()

        response_serializer = StaffCallSerializer(staff_call)
        return success_response(
            data=response_serializer.data,
            msg='Staff assigned successfully'
        )

    @action(detail=True, methods=['post'], url_path='acknowledge')
    def acknowledge(self, request, pk=None):
        """Quick action: Acknowledge a call (set status to acknowledged and assign to current user)"""
        staff_call = self.get_object()

        if staff_call.status != 'pending':
            return error_response(
                msg=f'Cannot acknowledge call with status "{staff_call.get_status_display()}"',
                code=400
            )

        staff_call.status = 'acknowledged'
        staff_call.acknowledged_at = timezone.now()
        staff_call.assigned_staff = request.user
        staff_call.save()
        staff_call.calculate_response_time()

        response_serializer = StaffCallSerializer(staff_call)
        return success_response(
            data=response_serializer.data,
            msg='Staff call acknowledged successfully'
        )

    @action(detail=True, methods=['post'], url_path='complete')
    def complete(self, request, pk=None):
        """Quick action: Complete a call"""
        staff_call = self.get_object()

        if staff_call.status == 'completed':
            return error_response(msg='Call is already completed', code=400)

        if staff_call.status == 'cancelled':
            return error_response(msg='Cannot complete a cancelled call', code=400)

        staff_call.status = 'completed'
        staff_call.completed_at = timezone.now()
        staff_call.save()
        staff_call.calculate_completion_time()

        response_serializer = StaffCallSerializer(staff_call)
        return success_response(
            data=response_serializer.data,
            msg='Staff call completed successfully'
        )

    @action(detail=True, methods=['post'], url_path='cancel')
    def cancel(self, request, pk=None):
        """Quick action: Cancel a call"""
        staff_call = self.get_object()

        if staff_call.status in ['completed', 'cancelled']:
            return error_response(
                msg=f'Cannot cancel call with status "{staff_call.get_status_display()}"',
                code=400
            )

        staff_call.status = 'cancelled'
        staff_call.save()

        response_serializer = StaffCallSerializer(staff_call)
        return success_response(
            data=response_serializer.data,
            msg='Staff call cancelled successfully'
        )

    @action(detail=False, methods=['get'], url_path='statistics')
    def statistics(self, request):
        """Get statistics about staff calls"""
        queryset = self.get_queryset()

        stats = {
            'total_calls': queryset.count(),
            'pending_calls': queryset.filter(status='pending').count(),
            'active_calls': queryset.filter(status__in=['pending', 'acknowledged', 'in_progress']).count(),
            'completed_calls': queryset.filter(status='completed').count(),
            'cancelled_calls': queryset.filter(status='cancelled').count(),
            'by_call_type': {},
            'by_priority': {},
            'avg_response_time': None,
            'avg_completion_time': None,
        }

        # Count by call type
        for call_type, label in StaffCall.CALL_TYPE_CHOICES:
            stats['by_call_type'][call_type] = {
                'label': label,
                'count': queryset.filter(call_type=call_type).count()
            }

        # Count by priority
        for priority, label in StaffCall.PRIORITY_CHOICES:
            stats['by_priority'][priority] = {
                'label': label,
                'count': queryset.filter(priority=priority).count()
            }

        # Average times
        avg_times = queryset.filter(
            response_time_seconds__isnull=False
        ).aggregate(
            avg_response=Avg('response_time_seconds'),
            avg_completion=Avg('completion_time_seconds')
        )

        stats['avg_response_time'] = int(avg_times['avg_response']) if avg_times['avg_response'] else None
        stats['avg_completion_time'] = int(avg_times['avg_completion']) if avg_times['avg_completion'] else None

        return success_response(
            data=stats,
            msg='Statistics retrieved successfully'
        )

