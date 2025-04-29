"""
URL patterns for the rainwater harvester API.
"""
from django.urls import path
from .views import (
    InputsView,
    ResultsView,
    SaveResultsView,
    HistoricalDataView,
    SettingsView,
    DeleteSavedResultsView,
    WeatherView
)

urlpatterns = [
    path('inputs/', InputsView.as_view(), name='inputs'),
    path('results/', ResultsView.as_view(), name='results'),
    path('save-results/', SaveResultsView.as_view(), name='save-results'),
    path('historical-data/', HistoricalDataView.as_view(), name='historical-data'),
    path('settings/', SettingsView.as_view(), name='settings'),
    path('saved-results/', DeleteSavedResultsView.as_view(), name='delete-saved-results'),
    path('weather/', WeatherView.as_view(), name='weather'),
]
