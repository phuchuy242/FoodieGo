# Development settings placeholder
from .base import *  # noqa: F401,F403

# override dev-specific settings here
DEBUG = True

# If a local.py override exists, import it (used for .env-driven local overrides)
try:
    from .local import *  # noqa: F401,F403
except Exception:
    # No local overrides available in some environments
    pass
