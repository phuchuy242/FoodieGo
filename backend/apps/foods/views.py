from rest_framework import viewsets, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from django_filters.rest_framework import DjangoFilterBackend
from .models import Food
from .serializers import FoodSerializer, FoodCreateUpdateSerializer


class FoodViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Food CRUD operations
    """
    queryset = Food.objects.filter(is_available=True)
    serializer_class = FoodSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'is_available', 'is_popular']
    search_fields = ['name', 'description']
    ordering_fields = ['price', 'name', 'created_at']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return FoodCreateUpdateSerializer
        return FoodSerializer
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticatedOrReadOnly])
    def popular(self, request):
        """Get popular foods"""
        popular_foods = self.queryset.filter(is_popular=True)
        serializer = FoodSerializer(popular_foods, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticatedOrReadOnly])
    def by_category(self, request):
        """Get foods by category"""
        category = request.query_params.get('category', None)
        if category:
            foods = self.queryset.filter(category=category)
        else:
            foods = self.queryset.all()
        serializer = FoodSerializer(foods, many=True)
        return Response(serializer.data)
