from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ShipperOrderViewSet

router = DefaultRouter()
router.register(r'orders', ShipperOrderViewSet, basename='shipper-orders')

urlpatterns = [
    path('', include(router.urls)),
]
