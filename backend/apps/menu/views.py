from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db.models import Q

from .models import Category, Product, ProductVariant, Topping
from .serializers import (
    CategorySerializer, CategoryDetailSerializer,
    ProductSerializer, ProductListSerializer,
    ProductVariantSerializer, ToppingSerializer
)
from core.responses import (
    success_response, error_response, created_response,
    deleted_response, StandardResultsSetPagination
)
from core.mixins import FilterSortMixin, StandardResponseMixin


class CategoryViewSet(FilterSortMixin, StandardResponseMixin, viewsets.ModelViewSet):
    """ViewSet for Category CRUD operations - Public Read, Authenticated Write"""
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    pagination_class = StandardResultsSetPagination
    search_fields = ['name', 'description']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return CategoryDetailSerializer
        return CategorySerializer

    def get_permissions(self):
        """
        Allow public read access (GET requests)
        Require authentication for write operations (POST, PUT, DELETE)
        """
        if self.action in ['list', 'retrieve']:
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]


class ProductViewSet(FilterSortMixin, StandardResponseMixin, viewsets.ModelViewSet):
    """ViewSet for Product CRUD operations - Public Read, Authenticated Write"""
    queryset = Product.objects.all()
    pagination_class = StandardResultsSetPagination
    search_fields = ['name', 'description']

    def get_serializer_class(self):
        if self.action == 'list':
            return ProductListSerializer
        return ProductSerializer

    def get_permissions(self):
        """
        Allow public read access (GET requests)
        Require authentication for write operations (POST, PUT, DELETE)
        """
        if self.action in ['list', 'retrieve']:
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]


    @action(detail=False, methods=['get'], url_path='by-category', permission_classes=[AllowAny])
    def by_category(self, request):
        """Get products filtered by category"""
        category_id = request.query_params.get('category_id')
        if not category_id:
            return error_response(msg='category_id parameter is required', code=400)

        products = Product.objects.filter(category_id=category_id, is_active=True)
        serializer = ProductListSerializer(products, many=True)
        return success_response(data=serializer.data, msg='Products retrieved successfully')


class ProductVariantViewSet(FilterSortMixin, StandardResponseMixin, viewsets.ModelViewSet):
    """ViewSet for ProductVariant CRUD operations - Public Read, Authenticated Write"""
    queryset = ProductVariant.objects.all()
    serializer_class = ProductVariantSerializer
    pagination_class = StandardResultsSetPagination
    search_fields = ['product__name', 'size']

    def get_permissions(self):
        """
        Allow public read access (GET requests)
        Require authentication for write operations (POST, PUT, DELETE)
        """
        if self.action in ['list', 'retrieve']:
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    @action(detail=False, methods=['get'], url_path='by-product', permission_classes=[AllowAny])
    def by_product(self, request):
        """Get variants filtered by product"""
        product_id = request.query_params.get('product_id')
        if not product_id:
            return error_response(msg='product_id parameter is required', code=400)

        variants = ProductVariant.objects.filter(product_id=product_id, is_active=True)
        serializer = ProductVariantSerializer(variants, many=True)
        return success_response(data=serializer.data, msg='Variants retrieved successfully')


class ToppingViewSet(FilterSortMixin, StandardResponseMixin, viewsets.ModelViewSet):
    """ViewSet for Topping CRUD operations - Public Read, Authenticated Write"""
    queryset = Topping.objects.all()
    serializer_class = ToppingSerializer
    pagination_class = StandardResultsSetPagination
    search_fields = ['name']

    def get_permissions(self):
        """
        Allow public read access (GET requests)
        Require authentication for write operations (POST, PUT, DELETE)
        """
        if self.action in ['list', 'retrieve']:
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    @action(detail=False, methods=['get'], url_path='search', permission_classes=[AllowAny])
    def search(self, request):
        """Search toppings by name"""
        query = request.query_params.get('q', '')
        if not query:
            return error_response(msg='q parameter is required for search', code=400)

        toppings = Topping.objects.filter(Q(name__icontains=query), is_active=True)
        serializer = ToppingSerializer(toppings, many=True)
        return success_response(data=serializer.data, msg='Toppings found successfully')
