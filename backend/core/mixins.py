from django.db.models import Q
from rest_framework import status as http_status
from core.responses import success_response, error_response, created_response, deleted_response


class FilterSortMixin:

    search_fields = []  # Override in viewset
    date_filter_field = 'created_at'  # Override if different

    def get_queryset(self):
        queryset = super().get_queryset()

        # Keyword search
        keyword = self.request.query_params.get('keyword', '')
        if keyword and self.search_fields:
            q_objects = Q()
            for field in self.search_fields:
                q_objects |= Q(**{f'{field}__icontains': keyword})
            queryset = queryset.filter(q_objects)

        # Date filtering
        from_date = self.request.query_params.get('from_date', '')
        to_date = self.request.query_params.get('to_date', '')
        date_col = self.request.query_params.get('date_col', self.date_filter_field)

        if from_date:
            queryset = queryset.filter(**{f'{date_col}__gte': from_date})
        if to_date:
            queryset = queryset.filter(**{f'{date_col}__lte': to_date})

        # Sorting
        sort_by = self.request.query_params.get('sort_by', self.date_filter_field)
        sort_dir = self.request.query_params.get('sort_dir', 'DESC')

        if sort_dir.upper() == 'DESC':
            queryset = queryset.order_by(f'-{sort_by}')
        else:
            queryset = queryset.order_by(sort_by)

        return queryset


class StandardResponseMixin:
    """Mixin to standardize API responses"""

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        msg = f'{self.queryset.model.__name__} retrieved successfully'
        return success_response(data=serializer.data, msg=msg)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        msg = f'{self.queryset.model.__name__} created successfully'
        return created_response(data=serializer.data, msg=msg)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        msg = f'{self.queryset.model.__name__} updated successfully'
        return success_response(data=serializer.data, msg=msg)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        msg = f'{self.queryset.model.__name__} deleted successfully'
        self.perform_destroy(instance)
        return deleted_response(msg=msg)

