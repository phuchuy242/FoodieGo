from rest_framework import serializers
from .models import Category, Product, ProductVariant, Topping


class CategorySerializer(serializers.ModelSerializer):
    products_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'slug', 'is_active',
                  'created_at', 'updated_at', 'products_count']
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at']

    def get_products_count(self, obj):
        return obj.products.filter(is_active=True).count()


class ProductVariantSerializer(serializers.ModelSerializer):
    """Serializer for ProductVariant model"""
    size_display = serializers.CharField(source='get_size_display', read_only=True)
    product_name = serializers.CharField(source='product.name', read_only=True)

    class Meta:
        model = ProductVariant
        fields = ['id', 'product', 'product_name', 'size', 'size_display',
                  'price', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class ProductSerializer(serializers.ModelSerializer):
    """Serializer for Product model"""
    category_name = serializers.CharField(source='category.name', read_only=True)
    variants = ProductVariantSerializer(many=True, read_only=True)
    variants_count = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ['id', 'category', 'category_name', 'name', 'description', 'image_url',
                  'is_active', 'created_at', 'updated_at', 'variants', 'variants_count']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_variants_count(self, obj):
        return obj.variants.filter(is_active=True).count()


class ProductListSerializer(serializers.ModelSerializer):
    """Simplified serializer for product listing"""
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Product
        fields = ['id', 'category', 'category_name', 'name', 'description', 'image_url',
                  'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class ToppingSerializer(serializers.ModelSerializer):
    """Serializer for Topping model"""

    class Meta:
        model = Topping
        fields = ['id', 'name', 'price', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class CategoryDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for Category with products"""
    products = ProductListSerializer(many=True, read_only=True)

    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'slug', 'is_active',
                  'created_at', 'updated_at', 'products']
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at']

