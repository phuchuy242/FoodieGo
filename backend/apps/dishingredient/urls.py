from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.inventory.views import VariantRecipeViewSet

router = DefaultRouter()
router.register(r'', VariantRecipeViewSet, basename='dishingredient')

urlpatterns = [
    path('', include(router.urls)),
]
