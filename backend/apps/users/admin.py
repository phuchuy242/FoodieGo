from django.contrib import admin
from django.contrib.auth import get_user_model

User = get_user_model()


@admin.register(User)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "uuid",
        "email",
        "user_name",
        "is_active",
        "is_verified",
        "is_staff",
        "created_at",
    )
    search_fields = ("email", "user_name")
    list_filter = ("is_active", "is_verified", "is_staff")
    ordering = ("-created_at",)
