"""
Serializers for the rainwater harvester API.
"""
from rest_framework import serializers

class InputSerializer(serializers.Serializer):
    """
    Serializer for user inputs.
    """
    roofArea = serializers.FloatField(required=True)
    outflow = serializers.FloatField(required=True)
    location = serializers.CharField(required=True)
    tankCapacity = serializers.FloatField(required=True)
    waterCostPerLiter = serializers.FloatField(required=False, default=0.002)
    setupCost = serializers.FloatField(required=False, default=5000)
    maintenanceCost = serializers.FloatField(required=False, default=500)

class SettingsSerializer(serializers.Serializer):
    """
    Serializer for user settings.
    """
    defaultRoofArea = serializers.FloatField(required=False, allow_null=True)
    defaultOutflow = serializers.FloatField(required=False, allow_null=True)
    defaultLocation = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    defaultTankCapacity = serializers.FloatField(required=False, allow_null=True)
    enableEmailAlerts = serializers.BooleanField(required=False, default=False)
    emailAddress = serializers.EmailField(required=False, allow_null=True, allow_blank=True)
    alertForLeaks = serializers.BooleanField(required=False, default=True)
    alertForCleaning = serializers.BooleanField(required=False, default=True)

class ResultIdSerializer(serializers.Serializer):
    """
    Serializer for result ID.
    """
    id = serializers.CharField(required=True)
