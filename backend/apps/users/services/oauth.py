import hashlib
import hmac
import re
import secrets
from dataclasses import dataclass
from urllib.parse import urlencode

import jwt
import requests
from django.conf import settings
from django.core.cache import cache
from django.core.signing import BadSignature, SignatureExpired, TimestampSigner
from django.db import transaction
from django.utils import timezone

from ..models import SocialAccount, User


SUPPORTED_PROVIDERS = ("google", "facebook")


class OAuthError(Exception):
    def __init__(self, public_message):
        super().__init__(public_message)
        self.public_message = public_message


@dataclass(frozen=True)
class OAuthIdentity:
    provider: str
    provider_user_id: str
    email: str
    email_verified: bool
    first_name: str = ""
    last_name: str = ""
    avatar_url: str = ""


def _digest(value):
    return hashlib.sha256(value.encode()).hexdigest()


def _state_cache_key(nonce):
    return f"oauth:state:{_digest(nonce)}"


def _handoff_cache_key(code):
    return f"oauth:handoff:{_digest(code)}"


def _used_cache_key(namespace, value):
    return f"oauth:used:{namespace}:{_digest(value)}"


def get_callback_url(provider):
    urls = {
        "google": settings.GOOGLE_OAUTH_CALLBACK_URL,
        "facebook": settings.FACEBOOK_OAUTH_CALLBACK_URL,
    }
    callback_url = urls[provider]
    if not callback_url:
        raise OAuthError("Callback OAuth chưa được cấu hình.")
    return callback_url


def _provider_credentials(provider):
    credentials = {
        "google": (
            settings.GOOGLE_OAUTH_CLIENT_ID,
            settings.GOOGLE_OAUTH_CLIENT_SECRET,
        ),
        "facebook": (
            settings.FACEBOOK_OAUTH_APP_ID,
            settings.FACEBOOK_OAUTH_APP_SECRET,
        ),
    }[provider]
    if not all(credentials):
        raise OAuthError("Nhà cung cấp đăng nhập này chưa được cấu hình.")
    return credentials


def create_authorization_url(provider):
    if provider not in SUPPORTED_PROVIDERS:
        raise OAuthError("Nhà cung cấp đăng nhập không được hỗ trợ.")

    credentials = _provider_credentials(provider)
    state_nonce = secrets.token_urlsafe(32)
    oidc_nonce = secrets.token_urlsafe(32)
    state_ttl = settings.OAUTH_STATE_TTL_SECONDS
    cache.set(
        _state_cache_key(state_nonce),
        {"provider": provider, "oidc_nonce": oidc_nonce},
        timeout=state_ttl,
    )
    state = TimestampSigner(salt="foodiego.oauth.state").sign_object(
        {"provider": provider, "nonce": state_nonce}
    )
    redirect_uri = get_callback_url(provider)

    if provider == "google":
        params = {
            "client_id": credentials[0],
            "redirect_uri": redirect_uri,
            "response_type": "code",
            "scope": "openid email profile",
            "state": state,
            "nonce": oidc_nonce,
            "prompt": "select_account",
        }
        endpoint = "https://accounts.google.com/o/oauth2/v2/auth"
    else:
        params = {
            "client_id": credentials[0],
            "redirect_uri": redirect_uri,
            "response_type": "code",
            "scope": "email,public_profile",
            "state": state,
        }
        endpoint = "https://www.facebook.com/dialog/oauth"

    return f"{endpoint}?{urlencode(params)}"


def consume_state(provider, state):
    if not state:
        raise OAuthError("Phiên đăng nhập không hợp lệ hoặc đã hết hạn.")
    try:
        payload = TimestampSigner(salt="foodiego.oauth.state").unsign_object(
            state,
            max_age=settings.OAUTH_STATE_TTL_SECONDS,
        )
    except (BadSignature, SignatureExpired, TypeError, ValueError):
        raise OAuthError("Phiên đăng nhập không hợp lệ hoặc đã hết hạn.")

    if payload.get("provider") != provider or not payload.get("nonce"):
        raise OAuthError("Phiên đăng nhập không hợp lệ hoặc đã hết hạn.")

    nonce = payload["nonce"]
    cached = cache.get(_state_cache_key(nonce))
    if not cached or cached.get("provider") != provider:
        raise OAuthError("Phiên đăng nhập không hợp lệ hoặc đã được sử dụng.")
    if not cache.add(
        _used_cache_key("state", nonce),
        True,
        timeout=settings.OAUTH_STATE_TTL_SECONDS,
    ):
        raise OAuthError("Phiên đăng nhập không hợp lệ hoặc đã được sử dụng.")
    cache.delete(_state_cache_key(nonce))
    return cached


def _request_json(method, url, **kwargs):
    kwargs.setdefault("timeout", settings.OAUTH_HTTP_TIMEOUT_SECONDS)
    try:
        response = requests.request(method, url, **kwargs)
        response.raise_for_status()
        data = response.json()
    except (requests.RequestException, ValueError):
        raise OAuthError("Nhà cung cấp đăng nhập không phản hồi hợp lệ.")
    if not isinstance(data, dict) or data.get("error"):
        raise OAuthError("Nhà cung cấp đăng nhập đã từ chối yêu cầu.")
    return data


def _decode_oidc_token(token, jwks_url, audience, allowed_issuers, nonce):
    if not token:
        raise OAuthError("Nhà cung cấp không trả về thông tin định danh.")
    try:
        signing_key = jwt.PyJWKClient(jwks_url).get_signing_key_from_jwt(token)
        claims = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            audience=audience,
            options={"require": ["exp", "iat", "iss", "sub"]},
        )
    except jwt.PyJWTError:
        raise OAuthError("Không thể xác minh thông tin định danh.")

    if claims.get("iss") not in allowed_issuers:
        raise OAuthError("Không thể xác minh nguồn thông tin định danh.")
    if nonce and not secrets.compare_digest(str(claims.get("nonce", "")), nonce):
        raise OAuthError("Thông tin đăng nhập không khớp với phiên đã bắt đầu.")
    return claims


def _exchange_google(code, oidc_nonce):
    client_id, client_secret = _provider_credentials("google")
    token_data = _request_json(
        "POST",
        "https://oauth2.googleapis.com/token",
        data={
            "code": code,
            "client_id": client_id,
            "client_secret": client_secret,
            "redirect_uri": get_callback_url("google"),
            "grant_type": "authorization_code",
        },
    )
    claims = _decode_oidc_token(
        token_data.get("id_token"),
        "https://www.googleapis.com/oauth2/v3/certs",
        client_id,
        ("https://accounts.google.com", "accounts.google.com"),
        oidc_nonce,
    )
    return OAuthIdentity(
        provider="google",
        provider_user_id=str(claims["sub"]),
        email=(claims.get("email") or "").strip().lower(),
        email_verified=claims.get("email_verified") is True,
        first_name=(claims.get("given_name") or "")[:50],
        last_name=(claims.get("family_name") or "")[:150],
        avatar_url=(claims.get("picture") or "")[:200],
    )


def _exchange_facebook(code):
    app_id, app_secret = _provider_credentials("facebook")
    token_data = _request_json(
        "GET",
        "https://graph.facebook.com/oauth/access_token",
        params={
            "client_id": app_id,
            "client_secret": app_secret,
            "redirect_uri": get_callback_url("facebook"),
            "code": code,
        },
    )
    access_token = token_data.get("access_token")
    if not access_token:
        raise OAuthError("Facebook không trả về token hợp lệ.")

    debug_data = _request_json(
        "GET",
        "https://graph.facebook.com/debug_token",
        params={
            "input_token": access_token,
            "access_token": f"{app_id}|{app_secret}",
        },
    ).get("data", {})
    if (
        debug_data.get("is_valid") is not True
        or str(debug_data.get("app_id")) != str(app_id)
        or not debug_data.get("user_id")
    ):
        raise OAuthError("Không thể xác minh token Facebook.")

    appsecret_proof = hmac.new(
        app_secret.encode(), access_token.encode(), hashlib.sha256
    ).hexdigest()
    profile = _request_json(
        "GET",
        "https://graph.facebook.com/me",
        headers={"Authorization": f"Bearer {access_token}"},
        params={
            "fields": "id,email,first_name,last_name,picture.type(large)",
            "appsecret_proof": appsecret_proof,
        },
    )
    if str(profile.get("id")) != str(debug_data["user_id"]):
        raise OAuthError("Thông tin tài khoản Facebook không khớp.")
    picture = profile.get("picture") or {}
    avatar_url = ((picture.get("data") or {}).get("url") or "")[:200]
    return OAuthIdentity(
        provider="facebook",
        provider_user_id=str(profile["id"]),
        email=(profile.get("email") or "").strip().lower(),
        email_verified=bool(profile.get("email")),
        first_name=(profile.get("first_name") or "")[:50],
        last_name=(profile.get("last_name") or "")[:150],
        avatar_url=avatar_url,
    )


def exchange_provider_code(provider, code, state_context):
    if not code:
        raise OAuthError("Nhà cung cấp không trả về mã đăng nhập.")
    if provider == "google":
        return _exchange_google(code, state_context.get("oidc_nonce", ""))
    if provider == "facebook":
        return _exchange_facebook(code)
    raise OAuthError("Nhà cung cấp đăng nhập không được hỗ trợ.")


def _new_username(email):
    base = re.sub(r"[^a-zA-Z0-9_.-]", "", email.split("@", 1)[0])[:120]
    base = base or "foodiego-user"
    for _ in range(10):
        candidate = f"{base}-{secrets.token_hex(4)}"
        if not User.objects.filter(user_name=candidate).exists():
            return candidate
    raise OAuthError("Không thể tạo tên tài khoản an toàn.")


@transaction.atomic
def resolve_social_user(identity):
    if not identity.provider_user_id:
        raise OAuthError("Nhà cung cấp không trả về định danh người dùng.")

    social = (
        SocialAccount.objects.select_for_update()
        .select_related("user")
        .filter(
            provider=identity.provider,
            provider_user_id=identity.provider_user_id,
        )
        .first()
    )
    if social:
        if not social.user.is_active:
            raise OAuthError("Tài khoản FoodieGo đã bị vô hiệu hóa.")
        return social.user

    if not identity.email or not identity.email_verified:
        raise OAuthError("Nhà cung cấp chưa xác minh địa chỉ email.")

    user = User.objects.select_for_update().filter(email__iexact=identity.email).first()
    if user and not user.is_active:
        raise OAuthError("Tài khoản FoodieGo đã bị vô hiệu hóa.")

    if not user:
        user = User.objects.create_user(
            email=identity.email,
            user_name=_new_username(identity.email),
            password=None,
            first_name=identity.first_name,
            last_name=identity.last_name,
            avatar_url=identity.avatar_url,
            is_active=True,
            is_verified=True,
            is_staff=False,
            is_superuser=False,
        )

    SocialAccount.objects.create(
        user=user,
        provider=identity.provider,
        provider_user_id=identity.provider_user_id,
        email=identity.email,
    )
    if not user.is_verified:
        user.is_verified = True
        user.save(update_fields=["is_verified"])
    return user


def create_handoff_code(user):
    code = secrets.token_urlsafe(32)
    cache.set(
        _handoff_cache_key(code),
        {"user_id": user.pk},
        timeout=settings.OAUTH_HANDOFF_TTL_SECONDS,
    )
    return code


def consume_handoff_code(code):
    if not isinstance(code, str) or not 20 <= len(code) <= 200:
        raise OAuthError("Mã đăng nhập không hợp lệ hoặc đã hết hạn.")
    payload = cache.get(_handoff_cache_key(code))
    if not payload:
        raise OAuthError("Mã đăng nhập không hợp lệ hoặc đã hết hạn.")
    if not cache.add(
        _used_cache_key("handoff", code),
        True,
        timeout=settings.OAUTH_HANDOFF_TTL_SECONDS,
    ):
        raise OAuthError("Mã đăng nhập đã được sử dụng.")
    cache.delete(_handoff_cache_key(code))
    try:
        user = User.objects.get(pk=payload["user_id"], is_active=True)
    except (User.DoesNotExist, KeyError, TypeError):
        raise OAuthError("Tài khoản FoodieGo không còn khả dụng.")
    user.last_login_at = timezone.now()
    user.save(update_fields=["last_login_at"])
    return user
