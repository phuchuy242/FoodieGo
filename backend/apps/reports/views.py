from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.utils import timezone
from datetime import timedelta
from django.db import models
from django.db.models import Sum, Count, F, Q
from django.db.models.functions import Coalesce, TruncDate
from core.responses import success_response, error_response
from core.mixins import StandardResponseMixin
from apps.orders.models import Order, OrderItem
from apps.users.models import User
from apps.menu.models import Product
from .serializers import (
    ReportSummarySerializer,
    RevenueChartItemSerializer,
    TopDishItemSerializer,
    OrderStatusStatsSerializer,
)


ACTIVE_OR_COMPLETED_STATUSES = ['confirmed', 'preparing', 'ready', 'delivering', 'served', 'completed']


class ReportViewSet(StandardResponseMixin, viewsets.ViewSet):
    """
    ViewSet for Admin Dashboard Reports and Statistical Analytics.
    Provides summary statistics, revenue charts, top dishes, and status breakdown.
    """
    permission_classes = [IsAuthenticated, IsAdminUser]

    def list(self, request):
        """
        Default GET /api/v1/reports/ or /api/v1/admin/reports/ returns summary dashboard stats.
        """
        return self.summary(request)

    @action(detail=False, methods=['get'])
    def summary(self, request):
        """
        Get overall dashboard summary statistics.
        """
        today = timezone.now().date()
        
        # Orders querysets
        all_orders = Order.objects.all()
        today_orders_qs = all_orders.filter(created_at__date=today)
        
        # Revenue querysets (non-cancelled / active / completed orders)
        revenue_orders = all_orders.filter(status__in=ACTIVE_OR_COMPLETED_STATUSES)
        today_revenue_orders = revenue_orders.filter(created_at__date=today)

        total_revenue = revenue_orders.aggregate(
            total=Coalesce(Sum('total_amount'), 0, output_field=models.DecimalField())
        )['total']

        today_revenue = today_revenue_orders.aggregate(
            total=Coalesce(Sum('total_amount'), 0, output_field=models.DecimalField())
        )['total']

        total_orders_count = all_orders.count()
        today_orders_count = today_orders_qs.count()
        completed_orders_count = all_orders.filter(status='completed').count()
        cancelled_orders_count = all_orders.filter(status='cancelled').count()
        pending_orders_count = all_orders.filter(status='pending').count()

        # Users and Products
        total_users_count = User.objects.count()
        new_users_today_count = User.objects.filter(created_at__date=today).count()
        total_products_count = Product.objects.filter(is_active=True).count()

        data = {
            "total_revenue": total_revenue,
            "today_revenue": today_revenue,
            "total_orders": total_orders_count,
            "today_orders": today_orders_count,
            "completed_orders": completed_orders_count,
            "cancelled_orders": cancelled_orders_count,
            "pending_orders": pending_orders_count,
            "total_users": total_users_count,
            "new_users_today": new_users_today_count,
            "total_products": total_products_count,
        }

        serializer = ReportSummarySerializer(data)
        return success_response(data=serializer.data, msg="Lấy thống kê tổng quan thành công")

    @action(detail=False, methods=['get'], url_path='revenue-chart')
    def revenue_chart(self, request):
        """
        Get daily revenue and order volume for chart visualization.
        Query parameters: days (default 7, max 90).
        """
        try:
            days = int(request.query_params.get('days', 7))
            if days <= 0 or days > 365:
                days = 7
        except ValueError:
            days = 7

        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=days - 1)

        # Initialize dictionary for all dates in range
        daily_stats = {}
        current_date = start_date
        while current_date <= end_date:
            date_str = current_date.strftime('%Y-%m-%d')
            daily_stats[date_str] = {"date": date_str, "revenue": 0.0, "orders": 0}
            current_date += timedelta(days=1)

        # Query database for revenue orders grouped by date
        orders_in_range = Order.objects.filter(
            created_at__date__gte=start_date,
            created_at__date__lte=end_date,
        )

        for order in orders_in_range:
            # Group by local date string
            order_local_date = order.created_at.astimezone(timezone.get_current_timezone()).date()
            date_str = order_local_date.strftime('%Y-%m-%d')
            if date_str in daily_stats:
                daily_stats[date_str]["orders"] += 1
                if order.status in ACTIVE_OR_COMPLETED_STATUSES:
                    daily_stats[date_str]["revenue"] += float(order.total_amount or 0)

        # Convert dictionary back to ordered list
        result_list = [
            {
                "date": item["date"],
                "revenue": f"{item['revenue']:.2f}",
                "orders": item["orders"]
            }
            for item in sorted(daily_stats.values(), key=lambda x: x["date"])
        ]

        serializer = RevenueChartItemSerializer(result_list, many=True)
        return success_response(data=serializer.data, msg="Lấy biểu đồ doanh thu thành công")

    @action(detail=False, methods=['get'], url_path='top-dishes')
    def top_dishes(self, request):
        """
        Get top selling dishes by quantity ordered.
        Query parameters: limit (default 5, max 50).
        """
        try:
            limit = int(request.query_params.get('limit', 5))
            if limit <= 0 or limit > 50:
                limit = 5
        except ValueError:
            limit = 5

        # Aggregate order items from non-cancelled orders
        items_qs = OrderItem.objects.filter(
            order__status__in=ACTIVE_OR_COMPLETED_STATUSES
        ).values(
            'variant__product__id',
            'variant__product__name',
            'variant__product__category__name'
        ).annotate(
            total_quantity=Coalesce(Sum('quantity'), 0),
            total_revenue=Coalesce(Sum(F('quantity') * F('price')), 0, output_field=models.DecimalField())
        ).order_by('-total_quantity')[:limit]

        result_list = []
        for item in items_qs:
            result_list.append({
                "product_id": item['variant__product__id'],
                "product_name": item['variant__product__name'],
                "category_name": item['variant__product__category__name'] or "Khác",
                "total_quantity": item['total_quantity'],
                "total_revenue": item['total_revenue']
            })

        serializer = TopDishItemSerializer(result_list, many=True)
        return success_response(data=serializer.data, msg="Lấy danh sách món bán chạy thành công")

    @action(detail=False, methods=['get'], url_path='order-status')
    def order_status_stats(self, request):
        """
        Get breakdown of orders grouped by status for pie/donut charts.
        """
        total_orders = Order.objects.count()
        status_counts = Order.objects.values('status').annotate(count=Count('id'))
        
        counts_dict = {item['status']: item['count'] for item in status_counts}
        status_labels = dict(Order.STATUS_CHOICES)

        result_list = []
        for status_code, status_label in status_labels.items():
            count = counts_dict.get(status_code, 0)
            percentage = round((count / total_orders * 100) if total_orders > 0 else 0.0, 1)
            result_list.append({
                "status": status_code,
                "status_label": status_label,
                "count": count,
                "percentage": percentage
            })

        serializer = OrderStatusStatsSerializer(result_list, many=True)
        return success_response(data=serializer.data, msg="Lấy thống kê trạng thái đơn hàng thành công")

    @action(detail=False, methods=['get'], url_path='recent-orders')
    def recent_orders(self, request):
        """
        Get most recent orders across the system for dashboard preview.
        """
        try:
            limit = int(request.query_params.get('limit', 5))
            if limit <= 0 or limit > 20:
                limit = 5
        except ValueError:
            limit = 5

        recent_qs = Order.objects.select_related('user', 'table').order_by('-created_at')[:limit]
        
        result_list = []
        for order in recent_qs:
            result_list.append({
                "id": order.id,
                "pay_code": order.pay_code,
                "table_number": order.table.table_number if order.table else None,
                "customer_name": f"{order.user.first_name} {order.user.last_name}".strip() if order.user and (order.user.first_name or order.user.last_name) else (order.user.user_name if order.user else "Khách vãng lai"),
                "total_amount": str(order.total_amount),
                "status": order.status,
                "status_display": order.get_status_display(),
                "created_at": order.created_at.strftime('%Y-%m-%d %H:%M:%S')
            })

        return success_response(data=result_list, msg="Lấy danh sách đơn hàng gần đây thành công")
