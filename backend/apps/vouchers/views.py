from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticatedOrReadOnly, AllowAny
from .models import Voucher
from .serializers import VoucherSerializer
from core.responses import success_response, error_response


class VoucherViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Voucher management conforming to 55+ API spec
    """
    queryset = Voucher.objects.all()
    serializer_class = VoucherSerializer
    permission_classes = [AllowAny]
    search_fields = ['code', 'description']
    
    @action(detail=False, methods=['post'], url_path='validate')
    def validate_code(self, request):
        """Validate a voucher code"""
        code = request.data.get('code', '').strip().upper()
        
        try:
            voucher = Voucher.objects.get(code=code)
            if voucher.is_valid():
                serializer = VoucherSerializer(voucher)
                return success_response(data=serializer.data, msg="Voucher hợp lệ")
            else:
                return error_response(msg='Voucher đã hết hạn hoặc không hợp lệ', code=status.HTTP_400_BAD_REQUEST)
        except Voucher.DoesNotExist:
            return error_response(msg='Mã giảm giá không tồn tại', code=status.HTTP_404_NOT_FOUND)
    
    @action(detail=True, methods=['post'])
    def apply(self, request, pk=None):
        """Apply voucher (increment usage count)"""
        voucher = self.get_object()
        if voucher.is_valid():
            voucher.current_usage += 1
            voucher.save()
            return success_response(msg='Áp dụng voucher thành công')
        return error_response(msg='Voucher không hợp lệ', code=status.HTTP_400_BAD_REQUEST)
