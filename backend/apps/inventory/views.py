from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q, F

from apps.ingredient.models import Ingredient
from .models import VariantRecipe, ToppingRecipe
from .serializers import (
    IngredientSerializer, StockAdjustmentSerializer,
    VariantRecipeSerializer, ToppingRecipeSerializer
)
from core.responses import success_response, error_response, StandardResultsSetPagination
from core.mixins import FilterSortMixin, StandardResponseMixin


class IngredientViewSet(FilterSortMixin, StandardResponseMixin, viewsets.ModelViewSet):
    """ViewSet for Ingredient CRUD operations and inventory management"""
    queryset = Ingredient.objects.all()
    serializer_class = IngredientSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    search_fields = ['name']

    @action(detail=False, methods=['get'], url_path='low-stock')
    def low_stock(self, request):
        """Get ingredients that are running low on stock"""
        ingredients = Ingredient.objects.filter(number_of__lte=F('min_quantity'))
        serializer = self.get_serializer(ingredients, many=True)
        return success_response(data=serializer.data, msg='Low stock ingredients retrieved successfully')

    @action(detail=False, methods=['get'], url_path='out-of-stock')
    def out_of_stock(self, request):
        """Get ingredients that are out of stock"""
        ingredients = Ingredient.objects.filter(number_of__lte=0)
        serializer = self.get_serializer(ingredients, many=True)
        return success_response(data=serializer.data, msg='Out of stock ingredients retrieved successfully')

    @action(detail=False, methods=['get'])
    def search(self, request):
        """Search ingredients by name"""
        query = request.query_params.get('q', '')
        if not query:
            return error_response(msg='q parameter is required for search', code=400)

        ingredients = Ingredient.objects.filter(Q(name__icontains=query))
        serializer = self.get_serializer(ingredients, many=True)
        return success_response(data=serializer.data, msg='Ingredients found successfully')

    @action(detail=True, methods=['post'], url_path='adjust-stock')
    def adjust_stock(self, request, pk=None):
        """Adjust ingredient stock quantity"""
        ingredient = self.get_object()
        serializer = StockAdjustmentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        adjustment = serializer.validated_data['adjustment']
        reason = serializer.validated_data.get('reason', '')

        ingredient.number_of += adjustment
        ingredient.save()

        response_serializer = IngredientSerializer(ingredient)
        return success_response(
            data=response_serializer.data,
            msg=f'Stock adjusted by {adjustment}. Reason: {reason}'
        )


class VariantRecipeViewSet(FilterSortMixin, StandardResponseMixin, viewsets.ModelViewSet):
    """ViewSet for VariantRecipe CRUD operations"""
    queryset = VariantRecipe.objects.all()
    serializer_class = VariantRecipeSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    search_fields = ['variant__product__name', 'ingredient__name']

    def get_queryset(self):
        return VariantRecipe.objects.select_related('variant', 'variant__product', 'ingredient')

    @action(detail=False, methods=['get'], url_path='by-variant')
    def by_variant(self, request):
        """Get recipes filtered by variant"""
        variant_id = request.query_params.get('variant_id')
        if not variant_id:
            return error_response(msg='variant_id parameter is required', code=400)

        recipes = self.get_queryset().filter(variant_id=variant_id)
        serializer = self.get_serializer(recipes, many=True)
        return success_response(data=serializer.data, msg='Variant recipes retrieved successfully')

    @action(detail=False, methods=['get'], url_path='by-ingredient')
    def by_ingredient(self, request):
        """Get recipes filtered by ingredient"""
        ingredient_id = request.query_params.get('ingredient_id')
        if not ingredient_id:
            return error_response(msg='ingredient_id parameter is required', code=400)

        recipes = self.get_queryset().filter(ingredient_id=ingredient_id)
        serializer = self.get_serializer(recipes, many=True)
        return success_response(data=serializer.data, msg='Variant recipes retrieved successfully')

    @action(detail=True, methods=['get'])
    def ingredients(self, request, pk=None):
        """Get all ingredients for a recipe"""
        recipe = self.get_object()
        ingredients = recipe.variant.recipes.all()
        serializer = self.get_serializer(ingredients, many=True)
        return success_response(data=serializer.data, msg='Recipe ingredients retrieved successfully')


class ToppingRecipeViewSet(FilterSortMixin, StandardResponseMixin, viewsets.ModelViewSet):
    """ViewSet for ToppingRecipe CRUD operations"""
    queryset = ToppingRecipe.objects.all()
    serializer_class = ToppingRecipeSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    search_fields = ['topping__name', 'ingredient__name']

    def get_queryset(self):
        return ToppingRecipe.objects.select_related('topping', 'ingredient')

    @action(detail=False, methods=['get'], url_path='by-topping')
    def by_topping(self, request):
        """Get recipes filtered by topping"""
        topping_id = request.query_params.get('topping_id')
        if not topping_id:
            return error_response(msg='topping_id parameter is required', code=400)

        recipes = self.get_queryset().filter(topping_id=topping_id)
        serializer = self.get_serializer(recipes, many=True)
        return success_response(data=serializer.data, msg='Topping recipes retrieved successfully')

    @action(detail=False, methods=['get'], url_path='by-ingredient')
    def by_ingredient(self, request):
        """Get recipes filtered by ingredient"""
        ingredient_id = request.query_params.get('ingredient_id')
        if not ingredient_id:
            return error_response(msg='ingredient_id parameter is required', code=400)

        recipes = self.get_queryset().filter(ingredient_id=ingredient_id)
        serializer = self.get_serializer(recipes, many=True)
        return success_response(data=serializer.data, msg='Topping recipes retrieved successfully')

    @action(detail=True, methods=['get'])
    def ingredients(self, request, pk=None):
        """Get all ingredients for a topping recipe"""
        recipe = self.get_object()
        ingredients = recipe.topping.recipes.all()
        serializer = self.get_serializer(ingredients, many=True)
        return success_response(data=serializer.data, msg='Topping recipe ingredients retrieved successfully')

