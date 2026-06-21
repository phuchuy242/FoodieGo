from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import CartItem
from .serializers import CartItemSerializer


class CartViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Shopping Cart management
    """
    serializer_class = CartItemSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return CartItem.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def totals(self, request):
        """Get cart totals"""
        cart_items = self.get_queryset()
        total_items = sum(item.quantity for item in cart_items)
        total_price = sum(float(item.subtotal) for item in cart_items)
        return Response({
            'total_items': total_items,
            'total_price': f"{total_price:.2f}",
            'item_count': cart_items.count()
        })
    
    @action(detail=False, methods=['post'])
    def clear(self, request):
        """Clear entire cart"""
        self.get_queryset().delete()
        return Response({'message': 'Cart cleared successfully'})
