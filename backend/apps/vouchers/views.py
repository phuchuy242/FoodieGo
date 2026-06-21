from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from .models import Voucher
from .serializers import VoucherSerializer


class VoucherViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for Voucher management (Read-only for users)
    """
    queryset = Voucher.objects.filter(is_active=True)
    serializer_class = VoucherSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    search_fields = ['code', 'description']
    
    @action(detail=False, methods=['post'])
    def validate_code(self, request):
        """Validate a voucher code"""
        code = request.data.get('code', '').strip().upper()
        
        try:
            voucher = Voucher.objects.get(code=code)
            if voucher.is_valid():
                serializer = VoucherSerializer(voucher)
                return Response(serializer.data)
            else:
                return Response(
                    {'error': 'Voucher is not valid'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except Voucher.DoesNotExist:
            return Response(
                {'error': 'Voucher not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['post'])
    def apply(self, request, pk=None):
        """Apply voucher (increment usage count)"""
        voucher = self.get_object()
        if voucher.is_valid():
            voucher.current_usage += 1
            voucher.save()
            return Response({'message': 'Voucher applied successfully'})
        return Response(
            {'error': 'Voucher is not valid'},
            status=status.HTTP_400_BAD_REQUEST
        )
