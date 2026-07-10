from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.conf import settings
from django.utils import timezone
from django.shortcuts import get_object_or_404

from .models import Payment, BankAccount
from .serializers import (
    PaymentSerializer,
    CreatePaymentQRSerializer,
    WebhookPayloadSerializer,
    BankAccountSerializer
)
from .services import VietQRService, SepayWebhookService
from apps.orders.models import Order

import logging

logger = logging.getLogger(__name__)


class BankAccountViewSet(viewsets.ModelViewSet):
    """ViewSet for Bank Account management"""
    queryset = BankAccount.objects.all()
    serializer_class = BankAccountSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Filter bank accounts based on query params"""
        queryset = super().get_queryset()

        # Filter by active status
        is_active = self.request.query_params.get('is_active')
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')

        # Filter by default
        is_default = self.request.query_params.get('is_default')
        if is_default is not None:
            queryset = queryset.filter(is_default=is_default.lower() == 'true')

        return queryset

    @action(detail=False, methods=['get'])
    def default_account(self, request):
        """
        Get default bank account

        GET /api/v1/payments/bank-accounts/default_account/
        """
        account = BankAccount.get_default_account()

        if not account:
            return Response(
                {'error': 'No default bank account found'},
                status=status.HTTP_404_NOT_FOUND
            )

        return Response(BankAccountSerializer(account).data)

    @action(detail=True, methods=['post'])
    def set_as_default(self, request, pk=None):
        """
        Set this account as default

        POST /api/v1/payments/bank-accounts/{id}/set_as_default/
        """
        account = self.get_object()
        account.is_default = True
        account.save()

        return Response({
            'status': 'success',
            'message': f'Account {account.account_number} set as default',
            'data': BankAccountSerializer(account).data
        })

    @action(detail=True, methods=['post'])
    def toggle_active(self, request, pk=None):
        """
        Toggle active status

        POST /api/v1/payments/bank-accounts/{id}/toggle_active/
        """
        account = self.get_object()
        account.is_active = not account.is_active
        account.save()

        return Response({
            'status': 'success',
            'message': f'Account {"activated" if account.is_active else "deactivated"}',
            'data': BankAccountSerializer(account).data
        })


class PaymentViewSet(viewsets.ModelViewSet):

    """ViewSet for Payment management"""
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Filter payments based on query params"""
        queryset = super().get_queryset()

        # Filter by order
        order_id = self.request.query_params.get('order_id')
        if order_id:
            queryset = queryset.filter(order_id=order_id)

        # Filter by payment status
        payment_status = self.request.query_params.get('status')
        if payment_status:
            queryset = queryset.filter(payment_status=payment_status)

        # Filter by pay_code
        pay_code = self.request.query_params.get('pay_code')
        if pay_code:
            queryset = queryset.filter(order__pay_code=pay_code)

        return queryset

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def create_with_qr(self, request):
        """
        Create payment and generate QR code

        POST /api/v1/payments/create_with_qr/
        Body:
        {
            "pay_code": "ABC12345",
            "payment_method": "bank_transfer",
            "bank_account_id": 1  // Optional: specify bank account, otherwise use default
        }
        """
        serializer = CreatePaymentQRSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        pay_code = serializer.validated_data['pay_code']
        payment_method = serializer.validated_data['payment_method']
        bank_account_id = request.data.get('bank_account_id')

        try:
            order = Order.objects.get(pay_code=pay_code)

            # Get bank account from database
            if bank_account_id:
                bank_account = BankAccount.objects.filter(
                    id=bank_account_id,
                    is_active=True
                ).first()
                if not bank_account:
                    return Response(
                        {'error': 'Bank account not found or inactive'},
                        status=status.HTTP_404_NOT_FOUND
                    )
            else:
                # Get default bank account for restaurant (or system default)
                restaurant = getattr(order.table, 'restaurant', None) if hasattr(order, 'table') else None
                bank_account = BankAccount.get_default_account(restaurant=restaurant)

                # Fallback to .env configuration if no bank account in database
                if not bank_account:
                    bank_config = getattr(settings, 'VIETQR_BANK_CONFIG', {})
                    account_no = bank_config.get('ACCOUNT_NO', '07022632725')
                    account_name = bank_config.get('ACCOUNT_NAME', 'NGUYEN TRONG DUONG')
                    bank_code = bank_config.get('BANK_CODE', 'MB')
                    qr_template = 'qr_only'
                else:
                    account_no = bank_account.account_number
                    account_name = bank_account.account_name
                    bank_code = bank_account.bank_code
                    qr_template = bank_account.qr_template

            # Create transfer content with pay_code
            transfer_content = f"DH{order.pay_code}"

            # Generate QR code using VietQR (direct image URL)
            qr_result = VietQRService.generate_qr_code(
                account_no=account_no,
                account_name=account_name,
                bank_code=bank_code,
                amount=float(order.total_amount),
                description=transfer_content,
                template=qr_template
            )

            if not qr_result.get('success'):
                return Response(
                    {
                        'error': qr_result.get('error', 'Failed to generate QR code'),
                        'detail': 'Could not generate payment QR code'
                    },
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

            # Create payment record
            payment = Payment.objects.create(
                order=order,
                payment_method=payment_method,
                amount=order.total_amount,
                qr_code_url=qr_result['qr_code_url'],
                qr_data=qr_result['qr_data'],
                bank_account_number=account_no,
                bank_account_name=account_name,
                bank_name=bank_code,
                transfer_content=transfer_content,
                payment_status='pending'
            )

            # Update order status to awaiting_payment
            order.status = 'awaiting_payment'
            order.save(update_fields=['status', 'updated_at'])

            response_data = PaymentSerializer(payment).data
            response_data['qr_info'] = qr_result['bank_info']

            return Response(response_data, status=status.HTTP_201_CREATED)

        except Order.DoesNotExist:
            return Response(
                {'error': 'Order not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error creating payment with QR: {str(e)}")
            return Response(
                {'error': 'Failed to create payment', 'detail': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def by_pay_code(self, request):
        """
        Get payment by order pay_code

        GET /api/v1/payments/by_pay_code/?pay_code=ABC123XY
        """
        pay_code = request.query_params.get('pay_code')

        if not pay_code:
            return Response(
                {'error': 'pay_code parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            order = Order.objects.get(pay_code=pay_code)

            if not hasattr(order, 'payment'):
                return Response(
                    {'error': 'Payment not found for this order'},
                    status=status.HTTP_404_NOT_FOUND
                )

            payment = order.payment
            return Response(PaymentSerializer(payment).data)

        except Order.DoesNotExist:
            return Response(
                {'error': 'Order not found'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=False, methods=['post'], permission_classes=[AllowAny], url_path='cancel-by-paycode')
    def cancel_by_paycode(self, request):
        """
        Cancel payment and revert order status to pending

        POST /api/v1/payments/cancel-by-paycode/
        Body: {
            "pay_code": "ABC12345"
        }
        """
        pay_code = request.data.get('pay_code')

        if not pay_code:
            return Response(
                {'error': 'pay_code is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            order = Order.objects.get(pay_code=pay_code)

            # Check if payment exists
            if not hasattr(order, 'payment'):
                return Response(
                    {'error': 'No payment found for this order'},
                    status=status.HTTP_404_NOT_FOUND
                )

            payment = order.payment

            # Only allow cancelling pending payments
            if payment.payment_status == 'paid':
                return Response(
                    {'error': 'Cannot cancel a completed payment'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Delete the payment record
            payment.delete()

            # Revert order status back to pending
            order.status = 'pending'
            order.save(update_fields=['status', 'updated_at'])

            return Response({
                'status': 'success',
                'message': 'Payment cancelled successfully. Order reverted to pending status.',
                'data': {
                    'order_id': order.id,
                    'pay_code': order.pay_code,
                    'status': order.status
                }
            })

        except Order.DoesNotExist:
            return Response(
                {'error': 'Order not found with this pay_code'},
                status=status.HTTP_404_NOT_FOUND
            )


@api_view(['POST'])
@permission_classes([AllowAny])
def sepay_webhook(request):
    """
    MBBank/Sepay webhook endpoint to receive payment notifications

    POST /api/v1/payments/webhook/sepay/

    This endpoint should be configured in MBBank/Sepay dashboard.
    When a bank transfer is detected, the service will call this endpoint.

    Expected payload format:
    {
        "id": 39867600,
        "gateway": "MBBank",
        "transactionDate": "2026-01-24 09:25:00",
        "accountNumber": "0796791500",
        "content": "DH ABC12XYZ",
        "transferAmount": 20000,
        "referenceCode": "FT26024469748414"
    }
    """
    try:
        # Log incoming webhook for debugging
        logger.info(f"Received webhook: {request.data}")

        # Get signature from header (if Sepay provides one)
        signature = request.headers.get('X-Sepay-Signature', '')

        # Validate webhook payload
        webhook_serializer = WebhookPayloadSerializer(data=request.data)

        if not webhook_serializer.is_valid():
            logger.error(f"Invalid webhook payload: {webhook_serializer.errors}")
            return Response(
                {'error': 'Invalid webhook payload', 'details': webhook_serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Verify signature if enabled
        verify_signature = getattr(settings, 'SEPAY_VERIFY_SIGNATURE', False)
        if verify_signature and signature:
            if not SepayWebhookService.verify_signature(request.data, signature):
                logger.warning("Invalid webhook signature")
                return Response(
                    {'error': 'Invalid signature'},
                    status=status.HTTP_401_UNAUTHORIZED
                )

        # Process webhook data
        webhook_result = SepayWebhookService.process_webhook(request.data)

        if not webhook_result.get('success'):
            logger.error(f"Failed to process webhook: {webhook_result.get('error')}")
            return Response(
                {'error': 'Failed to process webhook'},
                status=status.HTTP_400_BAD_REQUEST
            )

        webhook_data = webhook_result['data']
        transaction_content = webhook_data['transaction_content']

        # Extract order code from transaction content
        pay_code = SepayWebhookService.extract_order_code(transaction_content)

        if not pay_code:
            logger.warning(f"Could not extract pay_code from: {transaction_content}")
            return Response(
                {
                    'error': 'Could not identify order from transaction content',
                    'transaction_content': transaction_content,
                    'message': 'Please ensure payment content includes order code (DH XXXXXXXX)'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # Find order and payment
        try:
            order = Order.objects.get(pay_code=pay_code)

            if not hasattr(order, 'payment'):
                logger.warning(f"Payment not found for order {pay_code}")
                return Response(
                    {'error': 'Payment not found for this order', 'pay_code': pay_code},
                    status=status.HTTP_404_NOT_FOUND
                )

            payment = order.payment

            # Check if payment is already completed
            if payment.payment_status == 'completed':
                logger.info(f"Payment {payment.id} already completed")
                return Response({
                    'status': 'success',
                    'message': 'Payment already processed',
                    'payment_id': payment.id,
                    'pay_code': pay_code
                })

            # Verify amount matches
            if float(payment.amount) != webhook_data['amount']:
                logger.warning(
                    f"Amount mismatch for payment {payment.id}: "
                    f"expected {payment.amount}, got {webhook_data['amount']}"
                )
                return Response(
                    {
                        'error': 'Payment amount does not match',
                        'expected': float(payment.amount),
                        'received': webhook_data['amount']
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Mark payment as completed
            payment.mark_as_completed(
                transaction_id=webhook_data['transaction_id'],
                gateway_transaction_id=webhook_data['gateway_transaction_id'],
                webhook_data=webhook_data['raw_data']
            )

            logger.info(f"Payment {payment.id} completed successfully via webhook")

            return Response({
                'status': 'success',
                'message': 'Payment processed successfully',
                'payment_id': payment.id,
                'order_id': order.id,
                'pay_code': pay_code,
                'amount': float(payment.amount)
            })

        except Order.DoesNotExist:
            logger.warning(f"Order not found for pay_code: {pay_code}")
            return Response(
                {'error': 'Order not found', 'pay_code': pay_code},
                status=status.HTTP_404_NOT_FOUND
            )

    except Exception as e:
        logger.error(f"Webhook processing error: {str(e)}", exc_info=True)
        return Response(
            {'error': 'Internal server error', 'detail': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
