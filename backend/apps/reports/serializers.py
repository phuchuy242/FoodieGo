from rest_framework import serializers


class ReportSummarySerializer(serializers.Serializer):
    total_revenue = serializers.DecimalField(max_digits=15, decimal_places=2)
    today_revenue = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_orders = serializers.IntegerField()
    today_orders = serializers.IntegerField()
    completed_orders = serializers.IntegerField()
    cancelled_orders = serializers.IntegerField()
    pending_orders = serializers.IntegerField()
    total_users = serializers.IntegerField()
    new_users_today = serializers.IntegerField()
    total_products = serializers.IntegerField()


class RevenueChartItemSerializer(serializers.Serializer):
    date = serializers.CharField()
    revenue = serializers.DecimalField(max_digits=15, decimal_places=2)
    orders = serializers.IntegerField()


class TopDishItemSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    product_name = serializers.CharField()
    category_name = serializers.CharField(allow_null=True, required=False)
    image_url = serializers.CharField(allow_null=True, required=False)
    base_price = serializers.DecimalField(max_digits=15, decimal_places=2, required=False)
    total_quantity = serializers.IntegerField()
    total_revenue = serializers.DecimalField(max_digits=15, decimal_places=2)

class OrderStatusStatsSerializer(serializers.Serializer):
    status = serializers.CharField()
    status_label = serializers.CharField()
    count = serializers.IntegerField()
    percentage = serializers.FloatField()
