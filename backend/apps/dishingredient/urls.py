from django.urls import path, include
from rest_framework.routers import DefaultRouter
# pyrefly: ignore [missing-import]
from apps.inventory.views import VariantRecipeViewSet

router = DefaultRouter()
router.register(r'', VariantRecipeViewSet, basename='dishingredient')

urlpatterns = [
    path('', include(router.urls)),
]
