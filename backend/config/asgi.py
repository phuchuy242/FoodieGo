import os
from django.core.asgi import get_asgi_application

# Use production settings by default; override via DJANGO_SETTINGS_MODULE
os.environ.setdefault('DJANGO_SETTINGS_MODULE', os.getenv('DJANGO_SETTINGS_MODULE', 'config.settings.prod'))

application = get_asgi_application()
