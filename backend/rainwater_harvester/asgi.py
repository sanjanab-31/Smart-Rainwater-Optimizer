"""
ASGI config for rainwater_harvester project.
"""

import os

from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'rainwater_harvester.settings')

application = get_asgi_application()
