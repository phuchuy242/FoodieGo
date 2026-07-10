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
        if self.action in ['register', 'login', 'refresh_token']:
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
                'access_token': access_token,
                'refresh_token': refresh_token_str,
                'token_type': 'Bearer',
                'expires_in': 900,  # 15 minutes in seconds
                'user': user_data
            }

            return success_response(
                data=data,
                msg='User registered successfully',
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
                msg="Login failed",
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
                'access_token': access_token,
                'refresh_token': refresh_token_str,
                'token_type': 'Bearer',
                'expires_in': 900,  # 15 minutes in seconds
                'user': user_data
            }

            return success_response(
                data=data,
                msg='Login successful',
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
            # Verify and decode refresh token using SimpleJWT
            refresh = SimpleJWTRefreshToken(refresh_token_str)
            user_id = refresh.get('user_id')
            jti = str(refresh.get('jti'))

            # Check if refresh token exists and is valid in database
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

            # Get user
            user = refresh_token_obj.user
            if not user.is_active:
                return error_response(
                    msg="Account has been disabled",
                    code=status.HTTP_401_UNAUTHORIZED
                )

            # Mark refresh token as used
            refresh_token_obj.mark_used()

            # Generate new access token using SimpleJWT
            access_token = str(refresh.access_token)

            data = {
                'access_token': access_token,
                'token_type': 'Bearer',
                'expires_in': 900,
            }

            return success_response(
                data=data,
                msg='Token refreshed successfully',
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
        refresh_token_str = request.data.get('refresh_token')

        try:
            if refresh_token_str:
                # Revoke specific refresh token
                token_hash = hashlib.sha256(refresh_token_str.encode()).hexdigest()
                RefreshToken.objects.filter(
                    user=user,
                    token_hash=token_hash,
                    revoked=False
                ).update(revoked=True)
            else:
                # Revoke all refresh tokens for this user
                RefreshToken.objects.filter(
                    user=user,
                    revoked=False
                ).update(revoked=True)

            return success_response(
                msg='Logged out successfully',
                code=status.HTTP_200_OK
            )

        except Exception as e:
            return error_response(
                msg=f'Logout failed: {str(e)}',
                code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def profile(self, request):
        user = request.user
        user_data = UserSerializer(user).data
        return success_response(
            data=user_data,
            msg='User profile retrieved successfully',
            code=status.HTTP_200_OK
        )

    @action(detail=False, methods=['put', 'patch'], url_path='profile/update')
    def update_profile(self, request):
        user = request.user
        allowed_fields = ['first_name', 'last_name', 'avatar_url']

        try:
            for field in allowed_fields:
                if field in request.data:
                    setattr(user, field, request.data[field])

            user.save()
            user_data = UserSerializer(user).data

            return success_response(
                data=user_data,
                msg='Profile updated successfully',
                code=status.HTTP_200_OK
            )

        except Exception as e:
            return error_response(
                msg=f'Update failed: {str(e)}',
                code=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['post'], url_path='profile/change-password')
    def change_password(self, request):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        if not serializer.is_valid():
            return error_response(
                msg="Invalid data",
                errors=serializer.errors,
                code=status.HTTP_400_BAD_REQUEST
            )

        try:
            serializer.save()

            # Revoke all refresh tokens after password change
            RefreshToken.objects.filter(
                user=request.user,
                revoked=False
            ).update(revoked=True)

            return success_response(
                msg='Password changed successfully. Please login again.',
                code=status.HTTP_200_OK
            )

        except Exception as e:
            return error_response(
                msg=f'Password change failed: {str(e)}',
                code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
