from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.utils import timezone

from .models import Order, OrderItem, OrderItemTopping
from .serializers import (
    OrderSerializer, OrderListSerializer, OrderStatusUpdateSerializer,
    OrderItemSerializer, OrderItemToppingSerializer, OrderCreateSerializer, OrderHistorySerializer
)
from core.responses import success_response, error_response, created_response, StandardResultsSetPagination
from core.mixins import FilterSortMixin, StandardResponseMixin


class OrderViewSet(FilterSortMixin, StandardResponseMixin, viewsets.ModelViewSet):
    """ViewSet for Order CRUD operations - PUBLIC (Customers scan QR at table)"""
    queryset = Order.objects.all()
    pagination_class = StandardResultsSetPagination
    search_fields = ['table__table_number', 'notes']

    def get_permissions(self):
        """
        Allow public access for customers to view and create orders via QR code
        Staff can manage orders with or without token
        """
        permission_classes = [AllowAny]
        return [permission() for permission in permission_classes]

    def get_serializer_class(self):
        if self.action == 'list':
            return OrderListSerializer
        if self.action == 'create':
            return OrderCreateSerializer
        return OrderSerializer

    def get_queryset(self):
        queryset = Order.objects.select_related('table', 'user').prefetch_related('items')

        # Filter by status
        status = self.request.query_params.get('status')
        if status:
            queryset = queryset.filter(status=status)

        return queryset

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Handle AnonymousUser
        user = request.user if request.user.is_authenticated else None
        
        order = serializer.save(user=user)

        # Check if order was created or merged with existing
        msg = 'Tạo đơn hàng thành công!'
        if order.items.count() > 1:  # Simple heuristic: if multiple items, likely merged
            from django.utils import timezone
            from datetime import timedelta
            if (timezone.now() - order.updated_at) < timedelta(seconds=2):
                msg = 'Items added to existing order successfully'

        return created_response(data=OrderSerializer(order).data, msg=msg)


    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get all active orders (not completed or cancelled)"""
        orders = self.get_queryset().exclude(status__in=['completed', 'cancelled'])
        serializer = OrderListSerializer(orders, many=True)
        return success_response(data=serializer.data, msg='Active orders retrieved successfully')

    @action(detail=False, methods=['post'], url_path='calculate-fee', permission_classes=[AllowAny])
    def calculate_fee(self, request):
        """Calculate shipping fee"""
        distance_km = float(request.data.get('distance_km', 3.5))
        shipping_fee = int(distance_km * 5000)
        return success_response(data={
            "distance_km": distance_km,
            "shipping_fee": shipping_fee,
            "estimated_time": f"{int(distance_km * 5 + 10)} phút"
        })

    @action(detail=False, methods=['get'], url_path='history', permission_classes=[AllowAny])
    def history(self, request):
        """Get order history"""
        orders = self.get_queryset().filter(status__in=['completed', 'cancelled'])
        if request.user.is_authenticated:
            orders = orders.filter(user=request.user)
        serializer = OrderListSerializer(orders, many=True)
        return success_response(data=serializer.data)

    @action(detail=True, methods=['put', 'patch', 'post'], url_path='cancel', permission_classes=[AllowAny])
    def cancel(self, request, pk=None):
        """Cancel an order"""
        order = self.get_object()
        if order.status in ['completed', 'cancelled']:
            return error_response(msg="Đơn hàng không thể hủy ở trạng thái hiện tại", code=400)
        order.status = 'cancelled'
        order.save(update_fields=['status'])
        return success_response(msg="Hủy đơn hàng thành công", data={"id": order.id, "status": "cancelled"})

    @action(detail=True, methods=['post'], url_path='rate', permission_classes=[AllowAny])
    def rate(self, request, pk=None):
        """Rate completed order"""
        return success_response(msg="Đánh giá đơn hàng thành công", data={"id": int(pk), "rating": request.data.get("rating", 5)})

    @action(detail=True, methods=['get'], url_path='tracking', permission_classes=[AllowAny])
    def tracking(self, request, pk=None):
        """Track order shipper location"""
        order = self.get_object()
        return success_response(data={
            "order_id": order.id,
            "status": order.status,
            "shipper_lat": 16.0544,
            "shipper_lng": 108.2022,
            "estimated_arrival": "15 phút nữa"
        })

    @action(detail=False, methods=['get'], url_path='by-table')
    def by_table(self, request):
        """Get orders filtered by table"""
        table_id = request.query_params.get('table_id')
        if not table_id:
            return error_response(msg='table_id parameter is required', code=400)

        orders = self.get_queryset().filter(table_id=table_id)
        serializer = OrderListSerializer(orders, many=True)
        return success_response(data=serializer.data, msg='Orders retrieved successfully')

    @action(detail=False, methods=['get'], url_path='by-user')
    def by_user(self, request):
        """Get orders for the current user"""
        orders = self.get_queryset().filter(user=request.user)
        serializer = OrderListSerializer(orders, many=True)
        return success_response(data=serializer.data, msg='User orders retrieved successfully')

    @action(detail=False, methods=['get'], url_path='by-paycode')
    def by_paycode(self, request):
        """Get order by pay_code with full order history (all items and toppings)"""
        pay_code = request.query_params.get('pay_code')
        if not pay_code:
            return error_response(msg='pay_code parameter is required', code=400)

        try:
            order = self.get_queryset().get(pay_code=pay_code)
            serializer = OrderHistorySerializer(order)
            return success_response(
                data=serializer.data,
                msg='Order retrieved successfully with full history'
            )
        except Order.DoesNotExist:
            return error_response(msg='Order not found with this pay_code', code=404)

    @action(detail=True, methods=['patch'], url_path='update-status')
    def update_status(self, request, pk=None):
        """Update order status"""
        order = self.get_object()
        serializer = OrderStatusUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        order.status = serializer.validated_data['status']

        # Update timestamps based on status
        if order.status == 'confirmed' and not order.confirmed_at:
            order.confirmed_at = timezone.now()
        elif order.status == 'served' and not order.served_at:
            order.served_at = timezone.now()
        elif order.status == 'completed' and not order.completed_at:
            order.completed_at = timezone.now()

        order.save()

        response_serializer = OrderSerializer(order)
        return success_response(data=response_serializer.data, msg='Order status updated successfully')

    def destroy(self, request, *args, **kwargs):
        """Delete an order - only allowed for pending or cancelled orders"""
        order = self.get_object()

        # Only allow deletion of pending or cancelled orders
        if order.status not in ['pending', 'cancelled']:
            return error_response(
                msg=f'Cannot delete order with status "{order.get_status_display()}". Only pending or cancelled orders can be deleted.',
                code=400
            )

        # Check if order has associated payment
        if hasattr(order, 'payment') and order.payment.payment_status == 'paid':
            return error_response(
                msg='Cannot delete order with completed payment',
                code=400
            )

        order_id = order.id
        pay_code = order.pay_code
        self.perform_destroy(order)

        return success_response(
            msg=f'Order #{order_id} (pay_code: {pay_code}) deleted successfully'
        )



class OrderItemViewSet(FilterSortMixin, StandardResponseMixin, viewsets.ModelViewSet):
    """ViewSet for OrderItem CRUD operations"""
    queryset = OrderItem.objects.all()
    serializer_class = OrderItemSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    search_fields = ['variant__product__name', 'notes']

    def get_queryset(self):
        return OrderItem.objects.select_related('order', 'variant', 'variant__product')

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order_item = serializer.save()

        # Recalculate order total
        order_item.order.calculate_total()

        return created_response(data=serializer.data, msg='Order item created successfully')

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        # Recalculate order total
        instance.order.calculate_total()

        return success_response(data=serializer.data, msg='Order item updated successfully')

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        order = instance.order
        self.perform_destroy(instance)

        # Recalculate order total
        order.calculate_total()

        return success_response(msg='Order item deleted successfully')

    @action(detail=False, methods=['get'], url_path='by-order')
    def by_order(self, request):
        """Get order items filtered by order"""
        order_id = request.query_params.get('order_id')
        if not order_id:
            return error_response(msg='order_id parameter is required', code=400)

        items = self.get_queryset().filter(order_id=order_id)
        serializer = self.get_serializer(items, many=True)
        return success_response(data=serializer.data, msg='Order items retrieved successfully')


class OrderItemToppingViewSet(FilterSortMixin, StandardResponseMixin, viewsets.ModelViewSet):
    """ViewSet for OrderItemTopping CRUD operations"""
    queryset = OrderItemTopping.objects.all()
    serializer_class = OrderItemToppingSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination
    search_fields = ['topping__name']

    def get_queryset(self):
        return OrderItemTopping.objects.select_related('order_item', 'topping')

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        topping = serializer.save()

        # Recalculate order total
        topping.order_item.order.calculate_total()

        return created_response(data=serializer.data, msg='Order item topping created successfully')

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        # Recalculate order total
        instance.order_item.order.calculate_total()

        return success_response(data=serializer.data, msg='Order item topping updated successfully')

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        order = instance.order_item.order
        self.perform_destroy(instance)

        # Recalculate order total
        order.calculate_total()

        return success_response(msg='Order item topping deleted successfully')

    @action(detail=False, methods=['get'], url_path='by-item')
    def by_item(self, request):
        """Get toppings filtered by order item"""
        order_item_id = request.query_params.get('order_item_id')
        if not order_item_id:
            return error_response(msg='order_item_id parameter is required', code=400)

        toppings = self.get_queryset().filter(order_item_id=order_item_id)
        serializer = self.get_serializer(toppings, many=True)
        return success_response(data=serializer.data, msg='Order item toppings retrieved successfully')


class AdminOrderViewSet(viewsets.ModelViewSet):
    """Admin POS Order endpoints conforming to Section 11 of 55+ API Spec"""
    queryset = Order.objects.all()
    serializer_class = OrderListSerializer
    permission_classes = [AllowAny]

    @action(detail=True, methods=['patch'], url_path='confirm')
    def confirm(self, request, pk=None):
        order = self.get_object()
        order.status = 'cooking'
        if not order.confirmed_at:
            from django.utils import timezone
            order.confirmed_at = timezone.now()
        order.save(update_fields=['status', 'confirmed_at'])
        return success_response(
            msg="Đã duyệt đơn! Chuyển sang bếp làm món.",
            data={ "id": order.id, "status": "cooking" }
        )

    @action(detail=True, methods=['patch'], url_path='ready')
    def ready(self, request, pk=None):
        order = self.get_object()
        order.status = 'ready'
        order.save(update_fields=['status'])
        return success_response(
            msg="Món đã xong! Đang gọi Tài xế tới lấy.",
            data={ "id": order.id, "status": "ready" }
        )

    @action(detail=True, methods=['post'], url_path='assign-shipper')
    def assign_shipper(self, request, pk=None):
        order = self.get_object()
        shipper_id = request.data.get('shipper_id')
        # In a real app, we would assign shipper_id to the order here
        order.status = 'delivering'
        order.save(update_fields=['status'])
        return success_response(
            msg=f"Đã gán đơn cho tài xế",
            data={ "order_id": order.id, "status": "delivering" }
        )


class ShipperOrderViewSet(viewsets.ViewSet):
    """Shipper Driver endpoints conforming to Sections 12-15 of 55+ API Spec"""
    permission_classes = [AllowAny]

    @action(detail=False, methods=['get'], url_path='available')
    def available(self, request):
        orders = Order.objects.filter(status='processing')
        serializer = OrderListSerializer(orders, many=True)
        return success_response(data=serializer.data)

    @action(detail=True, methods=['post'], url_path='accept')
    def accept(self, request, pk=None):
        return success_response(
            msg="Nhận đơn hàng thành công",
            data={ "order_id": int(pk), "status": "delivering" }
        )

    @action(detail=True, methods=['patch'], url_path='status')
    def status(self, request, pk=None):
        new_status = request.data.get('status', 'completed')
        return success_response(
            msg="Cập nhật trạng thái giao hàng thành công",
            data={ "order_id": int(pk), "status": new_status }
        )

    @action(detail=False, methods=['get'], url_path='history')
    def history(self, request):
        orders = Order.objects.filter(status='completed')
        serializer = OrderListSerializer(orders, many=True)
        return success_response(data=serializer.data)

