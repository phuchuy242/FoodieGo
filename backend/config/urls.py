from django.contrib import admin
from django.urls import path, include
from config.health import health


urlpatterns = [
    # Admin panel
    path('admin/', admin.site.urls),

    # Health check endpoint
    path('health/', health, name='health'),

    # API v1 endpoints (will be enabled per feature branch)
    path('api/v1/users/', include('apps.users.urls')),
    path('api/v1/staff/', include('apps.staff.urls')),
    path('api/v1/staff-calls/', include('apps.staff_calls.urls')),
    path('api/v1/menu/', include('apps.menu.urls')),
    path('api/v1/tables/', include('apps.tables.urls')),
    path('api/v1/orders/', include('apps.orders.urls')),
    path('api/v1/inventory/', include('apps.inventory.urls')),
    path('api/v1/payments/', include('apps.payments.urls')),
    # path('api/v1/reports/', include('apps.reports.urls')),
    path('api/v1/sessions/', include('apps.sessions.urls')),
    path('api/v1/restaurants/', include('apps.restaurants.urls')),
    path('api/v1/ingredient/', include('apps.ingredient.urls')),
    path('api/v1/dishingredient/', include('apps.dishingredient.urls')),
]
