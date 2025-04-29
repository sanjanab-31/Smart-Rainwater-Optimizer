"""
WSGI config for rainwater_harvester project.
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'rainwater_harvester.settings')

application = get_wsgi_application()
