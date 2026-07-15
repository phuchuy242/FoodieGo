import jwt
from django.conf import settings


def decode_jwt(token):
    """Decode and verify a FoodieGo JWT with the configured signing key."""
    return jwt.decode(
        token,
        settings.JWT_SECRET_KEY,
        algorithms=[settings.JWT_ALGORITHM],
    )
