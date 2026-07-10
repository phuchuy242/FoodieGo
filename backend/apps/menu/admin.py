from django.contrib import admin
from .models import Category, Product, ProductVariant, Topping


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'slug', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'description']
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'category', 'is_active', 'created_at']
    list_filter = ['is_active', 'category', 'created_at']
    search_fields = ['name', 'description']
    raw_id_fields = ['category']


@admin.register(ProductVariant)
class ProductVariantAdmin(admin.ModelAdmin):
    list_display = ['id', 'product', 'size', 'price', 'is_active', 'created_at']
    list_filter = ['is_active', 'size', 'created_at']
    search_fields = ['product__name']
    raw_id_fields = ['product']


@admin.register(Topping)
class ToppingAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'price', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name']

