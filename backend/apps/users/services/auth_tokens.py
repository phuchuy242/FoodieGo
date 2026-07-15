import hashlib
import hmac
from datetime import UTC, datetime

from django.conf import settings
from rest_framework_simplejwt.tokens import RefreshToken as SimpleJWTRefreshToken

from ..models import RefreshToken


def token_environment_signature(user):
    payload = ":".join(
        [
            str(user.pk),
            user.user_name or "",
            user.email or "",
            str(bool(user.is_active)),
            str(bool(user.is_staff)),
            str(bool(user.is_superuser)),
            user.password or "",
        ]
    )
    return hmac.new(
        settings.JWT_SECRET_KEY.encode(),
        payload.encode(),
        hashlib.sha256,
    ).hexdigest()


def issue_token_pair(user):
    refresh = SimpleJWTRefreshToken.for_user(user)
    refresh["env_sig"] = token_environment_signature(user)
    refresh_token = str(refresh)
    access_token = str(refresh.access_token)

    RefreshToken.objects.create(
        jti=str(refresh["jti"]),
        user=user,
        token_hash=hashlib.sha256(refresh_token.encode()).hexdigest(),
        expires_at=datetime.fromtimestamp(int(refresh["exp"]), tz=UTC),
    )

    return access_token, refresh_token
