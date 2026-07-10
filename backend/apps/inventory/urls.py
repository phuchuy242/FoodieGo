from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import IngredientViewSet, VariantRecipeViewSet, ToppingRecipeViewSet

router = DefaultRouter()
router.register(r'ingredients', IngredientViewSet, basename='ingredient')
router.register(r'variant-recipes', VariantRecipeViewSet, basename='variantrecipe')
router.register(r'topping-recipes', ToppingRecipeViewSet, basename='toppingrecipe')

urlpatterns = [
    path('', include(router.urls)),
]

