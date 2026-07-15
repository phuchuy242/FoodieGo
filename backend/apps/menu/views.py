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
    """ViewSet for Category CRUD operations - Public Read and Admin/Dev Write"""
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    pagination_class = StandardResultsSetPagination
    search_fields = ['name', 'description']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return CategoryDetailSerializer
        return CategorySerializer

    def get_permissions(self):
        """Allow flexible read/write access for admin and dev testing"""
        permission_classes = [AllowAny]
        return [permission() for permission in permission_classes]

    @action(detail=True, methods=['patch', 'post', 'put'], url_path='status')
    def status(self, request, pk=None):
        """Enable/Disable category status in real-time"""
        category = self.get_object()
        is_available = request.data.get('is_available', not category.is_active)
        if 'is_active' in request.data:
            is_available = request.data.get('is_active')
        category.is_active = is_available
        category.save(update_fields=['is_active'])
        return success_response(
            msg="Danh mục đã chuyển sang trạng thái TẠM ẨN" if not is_available else "Danh mục đã chuyển sang trạng thái HIỂN THỊ",
            data={ "id": category.id, "is_available": is_available, "is_active": is_available }
        )


class ProductViewSet(FilterSortMixin, StandardResponseMixin, viewsets.ModelViewSet):
    """ViewSet for Product CRUD operations - Public Read and Admin/Dev Write"""
    queryset = Product.objects.all()
    pagination_class = StandardResultsSetPagination
    search_fields = ['name', 'description']

    def get_serializer_class(self):
        if self.action == 'list':
            return ProductListSerializer
        return ProductSerializer

    def get_permissions(self):
        """Allow flexible read/write access for admin and dev testing"""
        permission_classes = [AllowAny]
        return [permission() for permission in permission_classes]

    @action(detail=False, methods=['get'], url_path='by-category', permission_classes=[AllowAny])
    def by_category(self, request):
        """Get products filtered by category"""
        category_id = request.query_params.get('category_id')
        if not category_id:
            return error_response(msg='category_id parameter is required', code=400)

        products = Product.objects.filter(category_id=category_id, is_active=True)
        serializer = ProductListSerializer(products, many=True)
        return success_response(data=serializer.data)

    @action(detail=False, methods=['get'], url_path='search', permission_classes=[AllowAny])
    def search(self, request):
        """Search products by query"""
        query = request.query_params.get('q', '')
        if query:
            products = Product.objects.filter(Q(name__icontains=query) | Q(description__icontains=query), is_active=True)
        else:
            products = Product.objects.filter(is_active=True)
        serializer = ProductListSerializer(products, many=True)
        return success_response(data=serializer.data)

    @action(detail=True, methods=['get'], url_path='variants', permission_classes=[AllowAny])
    def variants(self, request, pk=None):
        """Get product variants"""
        variants = ProductVariant.objects.filter(product_id=pk, is_active=True)
        serializer = ProductVariantSerializer(variants, many=True)
        return success_response(data=serializer.data)

    @action(detail=True, methods=['get'], url_path='toppings', permission_classes=[AllowAny])
    def toppings(self, request, pk=None):
        """Get toppings available for product"""
        toppings = Topping.objects.filter(is_active=True)
        serializer = ToppingSerializer(toppings, many=True)
        return success_response(data=serializer.data)

    @action(detail=True, methods=['get'], url_path='reviews', permission_classes=[AllowAny])
    def reviews(self, request, pk=None):
        """Get product reviews"""
        data = [
            { "id": 1, "user_name": "Trần B", "rating": 5, "comment": "Mì cực kỳ ngon, xốt đậm đà!", "created_at": "2026-07-01T10:00:00Z" }
        ]
        return success_response(data=data)

    @action(detail=True, methods=['patch', 'post', 'put'], url_path='status')
    def status(self, request, pk=None):
        """Enable/Disable product status in real-time"""
        product = self.get_object()
        is_available = request.data.get('is_available', not product.is_active)
        if 'is_active' in request.data:
            is_available = request.data.get('is_active')
        product.is_active = is_available
        product.save(update_fields=['is_active'])
        return success_response(
            msg="Món đã chuyển sang trạng thái TẠM HẾT" if not is_available else "Món đã chuyển sang trạng thái CÓ SẴN",
            data={ "id": product.id, "is_available": is_available, "is_active": is_available }
        )


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
