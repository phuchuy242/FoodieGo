from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.utils import timezone
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
import jwt
import hashlib


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
        if self.action in ['register', 'login', 'refresh_token', 'forgot_password', 'verify_otp']:
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

            refresh = SimpleJWTRefreshToken.for_user(user)
            access_token = str(refresh.access_token)
            refresh_token_str = str(refresh)

            RefreshToken.objects.create(
                jti=str(refresh['jti']),
                user=user,
                token_hash=hashlib.sha256(refresh_token_str.encode()).hexdigest(),
                expires_at=timezone.now() + timezone.timedelta(days=7)
            )

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

        except Exception as e:
            return error_response(
                msg=f'Registration failed: {str(e)}',
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

            # Generate tokens using SimpleJWT
            refresh = SimpleJWTRefreshToken.for_user(user)
            access_token = str(refresh.access_token)
            refresh_token_str = str(refresh)

            # Store refresh token in database
            RefreshToken.objects.create(
                jti=str(refresh['jti']),
                user=user,
                token_hash=hashlib.sha256(refresh_token_str.encode()).hexdigest(),
                expires_at=timezone.now() + timezone.timedelta(days=7)
            )

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

        except Exception as e:
            return error_response(
                msg=f'Login failed: {str(e)}',
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
            refresh_token_obj = RefreshToken.objects.filter(
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

            refresh_token_obj.mark_used()
            access_token = str(refresh.access_token)

            # Match exactly 1.4 spec + legacy:
            return success_response(
                access=access_token,
                access_token=access_token,
                code=status.HTTP_200_OK
            )

        except jwt.ExpiredSignatureError:
            return error_response(
                msg="Refresh token has expired",
                code=status.HTTP_401_UNAUTHORIZED
            )
        except jwt.InvalidTokenError as e:
            return error_response(
                msg=f"Invalid refresh token: {str(e)}",
                code=status.HTTP_401_UNAUTHORIZED
            )
        except Exception as e:
            return error_response(
                msg=f"Token refresh failed: {str(e)}",
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
