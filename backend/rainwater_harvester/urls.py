"""
URL configuration for rainwater_harvester project.
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('rainwater_harvester.api.urls')),
]
