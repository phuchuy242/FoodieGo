from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.conf import settings
from django.db import transaction
from django.http import HttpResponseRedirect
from django.utils import timezone
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken as SimpleJWTRefreshToken
from core.responses import success_response, error_response
from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    UserSerializer,
    PasswordChangeSerializer,
    RefreshTokenSerializer,
)
from .models import User, RefreshToken
from .services.auth_tokens import issue_token_pair, token_environment_signature
from .services.oauth import (
    OAuthError,
    consume_handoff_code,
    consume_state,
    create_authorization_url,
    create_handoff_code,
    exchange_provider_code,
    resolve_social_user,
)
import hashlib
import hmac
from urllib.parse import urlencode


class UserViewSet(viewsets.GenericViewSet):
    """
    ViewSet for User Authentication and Profile Management.
    Combines Auth and User Profile features into one consistent ViewSet.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action in [
            'register',
            'login',
            'refresh_token',
            'forgot_password',
            'verify_otp',
            'oauth_login',
            'oauth_callback',
            'oauth_exchange',
        ]:
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def get_serializer_class(self):
        if self.action == 'register':
            return RegisterSerializer
        elif self.action == 'login':
            return LoginSerializer
        elif self.action == 'refresh_token':
            return RefreshTokenSerializer
        elif self.action == 'change_password':
            return PasswordChangeSerializer
        return UserSerializer

    def _oauth_frontend_redirect(self, **params):
        if not settings.OAUTH_FRONTEND_CALLBACK_URL:
            return error_response(
                msg='OAuth frontend callback is not configured',
                code=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        separator = '&' if '?' in settings.OAUTH_FRONTEND_CALLBACK_URL else '?'
        return HttpResponseRedirect(
            f"{settings.OAUTH_FRONTEND_CALLBACK_URL}{separator}{urlencode(params)}"
        )

    @action(
        detail=False,
        methods=['get'],
        url_path=r'oauth/(?P<provider>google|facebook)/login',
        permission_classes=[AllowAny],
    )
    def oauth_login(self, request, provider=None):
        try:
            return HttpResponseRedirect(create_authorization_url(provider))
        except OAuthError as exc:
            return self._oauth_frontend_redirect(error=exc.public_message)

    @action(
        detail=False,
        methods=['get', 'post'],
        url_path=r'oauth/(?P<provider>google|facebook)/callback',
        permission_classes=[AllowAny],
    )
    def oauth_callback(self, request, provider=None):
        params = request.data if request.method == 'POST' else request.query_params
        try:
            state_context = consume_state(provider, params.get('state'))
            if params.get('error'):
                if params.get('error') == 'access_denied':
                    raise OAuthError('Bạn đã hủy yêu cầu đăng nhập.')
                raise OAuthError('Nhà cung cấp đăng nhập đã từ chối yêu cầu.')

            identity = exchange_provider_code(
                provider,
                params.get('code'),
                state_context,
            )
            user = resolve_social_user(identity)
            handoff_code = create_handoff_code(user)
            return self._oauth_frontend_redirect(code=handoff_code)
        except OAuthError as exc:
            return self._oauth_frontend_redirect(error=exc.public_message)

    @action(
        detail=False,
        methods=['post'],
        url_path='oauth/exchange',
        permission_classes=[AllowAny],
    )
    def oauth_exchange(self, request):
        try:
            user = consume_handoff_code(request.data.get('code'))
            access_token, refresh_token = issue_token_pair(user)
        except OAuthError as exc:
            return error_response(
                msg=exc.public_message,
                code=status.HTTP_400_BAD_REQUEST,
            )

        return success_response(
            data={
                'user': UserSerializer(user).data,
                'access': access_token,
                'refresh': refresh_token,
                'access_token': access_token,
                'refresh_token': refresh_token,
            },
            msg='Đăng nhập thành công',
            code=status.HTTP_200_OK,
        )

    @action(detail=False, methods=['post'])
    def register(self, request):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return error_response(
                msg="Dữ liệu không hợp lệ",
                errors=serializer.errors,
                code=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = serializer.save()

            access_token, refresh_token_str = issue_token_pair(user)

            user_data = UserSerializer(user).data

            data = {
                'user': user_data,
                'tokens': {
                    'access': access_token,
                    'refresh': refresh_token_str
                },
                # Keep legacy compatibility:
                'access_token': access_token,
                'refresh_token': refresh_token_str,
            }

            return success_response(
                data=data,
                msg='Đăng ký tài khoản thành công!',
                code=status.HTTP_201_CREATED
            )

        except Exception:
            return error_response(
                msg='Registration failed',
                code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['post'])
    def login(self, request):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        if not serializer.is_valid():
            return error_response(
                msg="Đăng nhập thất bại",
                errors=serializer.errors,
                code=status.HTTP_401_UNAUTHORIZED
            )

        try:
            user = serializer.validated_data['user']

            access_token, refresh_token_str = issue_token_pair(user)

            # Serialize user data
            user_data = UserSerializer(user).data

            data = {
                'user': user_data,
                'access': access_token,
                'refresh': refresh_token_str,
                # Keep legacy compatibility:
                'access_token': access_token,
                'refresh_token': refresh_token_str,
            }

            return success_response(
                data=data,
                msg='Đăng nhập thành công',
                code=status.HTTP_200_OK
            )

        except Exception:
            return error_response(
                msg='Login failed',
                code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['post'], url_path='refresh')
    def refresh_token(self, request):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            return error_response(
                msg="Invalid data",
                errors=serializer.errors,
                code=status.HTTP_400_BAD_REQUEST
            )

        refresh_token_str = serializer.validated_data['refresh_token']

        try:
            refresh = SimpleJWTRefreshToken(refresh_token_str)
            user_id = refresh.get('user_id')
            jti = str(refresh.get('jti'))

            token_hash = hashlib.sha256(refresh_token_str.encode()).hexdigest()
            with transaction.atomic():
                refresh_token_obj = RefreshToken.objects.select_for_update().filter(
                    jti=jti,
                    token_hash=token_hash,
                    user_id=user_id,
                    revoked=False,
                    expires_at__gt=timezone.now()
                ).first()

                if not refresh_token_obj:
                    return error_response(
                        msg="Refresh token is invalid or has expired",
                        code=status.HTTP_401_UNAUTHORIZED
                    )

                user = refresh_token_obj.user
                if not user.is_active:
                    return error_response(
                        msg="Account has been disabled",
                        code=status.HTTP_401_UNAUTHORIZED
                    )

                expected_signature = token_environment_signature(user)
                supplied_signature = str(refresh.get('env_sig', ''))
                if not hmac.compare_digest(supplied_signature, expected_signature):
                    refresh_token_obj.revoke()
                    return error_response(
                        msg="Token environment mismatch",
                        code=status.HTTP_401_UNAUTHORIZED
                    )

                refresh_token_obj.last_used_at = timezone.now()
                refresh_token_obj.revoked = True
                refresh_token_obj.save(update_fields=['last_used_at', 'revoked'])
                access_token, new_refresh_token = issue_token_pair(user)

            return success_response(
                data={
                    'access': access_token,
                    'refresh': new_refresh_token,
                    'access_token': access_token,
                    'refresh_token': new_refresh_token,
                },
                code=status.HTTP_200_OK
            )

        except TokenError:
            return error_response(
                msg="Refresh token is invalid or has expired",
                code=status.HTTP_401_UNAUTHORIZED
            )
        except Exception:
            return error_response(
                msg="Token refresh failed",
                code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['post'])
    def logout(self, request):
        user = request.user
        refresh_token_str = request.data.get('refresh_token') or request.data.get('refresh')

        try:
            if refresh_token_str:
                token_hash = hashlib.sha256(refresh_token_str.encode()).hexdigest()
                RefreshToken.objects.filter(
                    user=user,
                    token_hash=token_hash,
                    revoked=False
                ).update(revoked=True)
            else:
                RefreshToken.objects.filter(
                    user=user,
                    revoked=False
                ).update(revoked=True)

            return success_response(
                msg='Đăng xuất thành công',
                code=status.HTTP_200_OK
            )

        except Exception as e:
            return error_response(
                msg=f'Logout failed: {str(e)}',
                code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get', 'put', 'patch'], url_path='profile')
    def profile(self, request):
        user = request.user
        if request.method in ['PUT', 'PATCH']:
            allowed_fields = ['first_name', 'last_name', 'avatar_url', 'full_name', 'email', 'phone_number']
            try:
                for field in allowed_fields:
                    if field in request.data:
                        if field == 'avatar':
                            user.avatar_url = request.data['avatar']
                        else:
                            setattr(user, field, request.data[field])
                if 'avatar' in request.data:
                    user.avatar_url = request.data['avatar']

                user.save()
                user_data = UserSerializer(user).data

                return success_response(
                    data=user_data,
                    msg='Cập nhật thành công',
                    code=status.HTTP_200_OK
                )
            except Exception as e:
                return error_response(
                    msg=f'Update failed: {str(e)}',
                    code=status.HTTP_400_BAD_REQUEST
                )

        user_data = UserSerializer(user).data
        return success_response(
            data=user_data,
            code=status.HTTP_200_OK
        )

    @action(detail=False, methods=['put', 'patch', 'post'], url_path='password')
    def change_password(self, request):
        serializer = PasswordChangeSerializer(data=request.data, context={'request': request})
        if not serializer.is_valid():
            return error_response(
                msg="Dữ liệu không hợp lệ",
                errors=serializer.errors,
                code=status.HTTP_400_BAD_REQUEST
            )

        try:
            serializer.save()
            RefreshToken.objects.filter(
                user=request.user,
                revoked=False
            ).update(revoked=True)

            return success_response(
                msg='Đổi mật khẩu thành công',
                code=status.HTTP_200_OK
            )

        except Exception as e:
            return error_response(
                msg=f'Password change failed: {str(e)}',
                code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['post'], url_path='forgot-password', permission_classes=[AllowAny])
    def forgot_password(self, request):
        phone_number = request.data.get('phone_number', '')
        return success_response(
            msg=f'Mã OTP đã được gửi đến số điện thoại {phone_number}',
            code=status.HTTP_200_OK,
            otp_id='OTP8899'
        )

    @action(detail=False, methods=['post'], url_path='verify-otp', permission_classes=[AllowAny])
    def verify_otp(self, request):
        return success_response(
            msg='Xác thực OTP thành công',
            code=status.HTTP_200_OK,
            reset_token='TKN_RESET_99'
        )

    @action(detail=False, methods=['get'], url_path='loyalty-history')
    def loyalty_history(self, request):
        data = [
            { "reason": "Đánh giá đơn ORD1720108800", "points": "+100", "date": "2026-07-05" }
        ]
        return success_response(data=data, code=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='vouchers')
    def vouchers(self, request):
        data = [
            { "code": "FREESHIP15", "status": "available", "expires_in": "7 ngày" }
        ]
        return success_response(data=data, code=status.HTTP_200_OK)


class AddressViewSet(viewsets.ViewSet):
    """
    ViewSet for Address Book Management conforming to Section 2 of 55+ API Spec.
    """
    permission_classes = [IsAuthenticated]

    def list(self, request):
        data = [
            {
                "id": 1,
                "name": request.user.full_name or "Nguyễn Văn A",
                "phone": request.user.phone_number or "0912345678",
                "address": "120 Hoàng Minh Thảo, Hòa Khánh, Đà Nẵng",
                "note": "Để trước cổng nhà",
                "is_default": True
            }
        ]
        return success_response(data=data, code=status.HTTP_200_OK)

    def create(self, request):
        data = {
            "id": 2,
            "name": request.data.get("name", request.user.full_name or "Nguyễn Văn A"),
            "address": request.data.get("address", "456 Tôn Đức Thắng, Liên Chiểu, Đà Nẵng"),
            "is_default": request.data.get("is_default", False)
        }
        return success_response(data=data, code=status.HTTP_201_CREATED)

    def update(self, request, pk=None):
        return success_response(msg="Đã cập nhật địa chỉ", code=status.HTTP_200_OK)

    def destroy(self, request, pk=None):
        return success_response(msg="Đã xóa địa chỉ", code=status.HTTP_200_OK)

    @action(detail=True, methods=['patch'])
    def default(self, request, pk=None):
        return success_response(msg="Đã đặt làm địa chỉ mặc định", code=status.HTTP_200_OK)
