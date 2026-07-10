from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PaymentViewSet, BankAccountViewSet, sepay_webhook

router = DefaultRouter()
router.register(r'bank-accounts', BankAccountViewSet, basename='bank-account')
router.register(r'', PaymentViewSet, basename='payment')

urlpatterns = [
    # Sepay webhook endpoint (must be public)
    path('webhook/sepay/', sepay_webhook, name='sepay-webhook'),

    # Payment & BankAccount ViewSet routes
    path('', include(router.urls)),
]
