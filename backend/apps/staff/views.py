from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .models import Role
from .serializers import RoleSerializer
from core.responses import StandardResultsSetPagination
from core.mixins import FilterSortMixin, StandardResponseMixin


class RoleViewSet(FilterSortMixin, StandardResponseMixin, viewsets.ModelViewSet):
    """ViewSet for Role CRUD operations"""
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    search_fields = ['name_vi', 'name_en', 'slug']
