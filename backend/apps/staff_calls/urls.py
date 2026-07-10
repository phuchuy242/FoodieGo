from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StaffCallViewSet

router = DefaultRouter()
router.register(r'', StaffCallViewSet, basename='staff-call')

urlpatterns = [
    path('', include(router.urls)),
]

