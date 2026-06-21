"""
URL configuration for FoodieGo project.
"""

from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView

# Import ViewSets from apps
from apps.users.views import UserViewSet, LoginView, RegisterView, RefreshTokenView
from apps.foods.views import FoodViewSet
from apps.cart.views import CartViewSet
from apps.orders.views import OrderViewSet
from apps.vouchers.views import VoucherViewSet

# Create router instance
router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'foods', FoodViewSet, basename='food')
router.register(r'cart', CartViewSet, basename='cart')
router.register(r'orders', OrderViewSet, basename='order')
router.register(r'vouchers', VoucherViewSet, basename='voucher')

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),
    
    # API v1
    path('api/', include([
        # Authentication endpoints
        path('auth/login/', LoginView.as_view(), name='login'),
        path('auth/register/', RegisterView.as_view(), name='register'),
        path('auth/refresh/', RefreshTokenView.as_view(), name='refresh_token'),
        
        # Router endpoints
        path('', include(router.urls)),
        
        # Swagger/OpenAPI documentation
        path('schema/', SpectacularAPIView.as_view(), name='schema'),
        path('schema/swagger-ui/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
        path('schema/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
    ])),
    
    # Django Rest Framework auth
    path('api-auth/', include('rest_framework.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
