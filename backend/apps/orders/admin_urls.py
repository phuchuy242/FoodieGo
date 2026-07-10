from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AdminOrderViewSet

router = DefaultRouter()
router.register(r'', AdminOrderViewSet, basename='admin-orders')

urlpatterns = [
    path('', include(router.urls)),
]
