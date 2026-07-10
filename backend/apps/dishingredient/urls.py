from django.urls import path, include
from rest_framework.routers import DefaultRouter

# Import views if they exist
try:
    from .views import DishIngredientViewSet
    router = DefaultRouter()
    router.register(r'', DishIngredientViewSet, basename='dishingredient')
    urlpatterns = [
        path('', include(router.urls)),
    ]
except ImportError:
    # No viewset defined yet
    urlpatterns = []

