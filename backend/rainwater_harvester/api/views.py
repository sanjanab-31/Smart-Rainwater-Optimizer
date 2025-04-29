"""
Views for the rainwater harvester API.
"""
from datetime import datetime
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from bson.json_util import dumps, loads
import json
import logging

from .serializers import InputSerializer, SettingsSerializer, ResultIdSerializer
from .calculation_service import process_inputs
from .weather_service import get_weather_forecast
from . import database

# Set up logging
logger = logging.getLogger(__name__)

class InputsView(APIView):
    """
    API view for handling user inputs and calculations.
    """
    def post(self, request):
        """
        Process user inputs and return calculation results.
        """
        logger.info(f"Received input request with data: {request.data}")
        serializer = InputSerializer(data=request.data)
        
        if serializer.is_valid():
            try:
                # Add timestamp to input data
                input_data = serializer.validated_data
                input_data['timestamp'] = datetime.now().isoformat()
                
                logger.info(f"Validated input data: {input_data}")
                
                # Check MongoDB connection
                if not database.get_mongodb_status():
                    logger.warning("MongoDB is not available. Using in-memory storage.")
                
                # Save inputs to database
                input_result = database.save_inputs(input_data)
                logger.info("Input data saved to database")
                
                # Get the input ID
                if input_result and hasattr(input_result, 'inserted_id'):
                    input_id = str(input_result.inserted_id)
                    logger.info(f"Generated input ID: {input_id}")
                else:
                    input_id = 'temp_' + datetime.now().isoformat()
                    logger.info(f"Using temporary input ID: {input_id}")
                
                # Add input ID to input data
                input_data['_id'] = input_id
                
                # Process inputs and generate results
                logger.info("Starting calculation process")
                results = process_inputs(input_data)
                logger.info("Calculation process completed")
                
                # Save results to database
                database.save_results(results)
                logger.info("Results saved to database")
                
                return Response(results, status=status.HTTP_200_OK)
            except Exception as e:
                logger.error(f"Error processing inputs: {str(e)}", exc_info=True)
                return Response(
                    {
                        'error': 'An error occurred while processing your data.',
                        'details': str(e),
                        'message': 'This could be due to a database connection issue or an error in the calculation service. Please check your MongoDB connection and try again.'
                    }, 
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        else:
            logger.error(f"Invalid input data: {serializer.errors}")
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ResultsView(APIView):
    """
    API view for retrieving calculation results.
    """
    def get(self, request):
        """
        Get the latest calculation results.
        """
        try:
            # Check MongoDB connection
            if not database.get_mongodb_status():
                logger.warning("MongoDB is not available. Using in-memory storage.")
            
            # Check if user_input_id is provided
            user_input_id = request.query_params.get('user_input_id', None)
            
            # Get results from database
            if user_input_id:
                # Get specific results for the given user_input_id
                logger.info(f"Fetching results for user_input_id: {user_input_id}")
                results = database.get_results_by_input_id(user_input_id)
            else:
                # Get latest results
                logger.info("Fetching latest results")
                results = database.get_latest_results()
            
            if results:
                # Convert MongoDB ObjectId to string for JSON serialization
                results = json.loads(dumps(results))
                return Response(results, status=status.HTTP_200_OK)
            
            # Return empty results instead of 404
            logger.info("No results found, returning empty result")
            empty_result = {
                'message': 'No results found. Please submit input data first.',
                'inputs': {},
                'inflow': {
                    'dailyInflow': 0,
                    'monthlyInflow': 0,
                    'yearlyInflow': 0
                },
                'leakDetection': {
                    'isLeaking': False,
                    'difference': 0,
                    'severity': 'low'
                },
                'roi': {
                    'roi': 0,
                    'savings': 0,
                    'costs': 0,
                    'paybackPeriod': 0
                },
                'waterUsage': {
                    'drinking': 33,
                    'cleaning': 33,
                    'gardening': 34
                },
                'tankRecommendation': {
                    'recommendedSize': 0,
                    'monthlyInflow': 0,
                    'monthlyConsumption': 0
                },
                'maintenanceSchedule': [],
                'weatherData': {
                    'forecast': [],
                    'averageRainfall': 0
                }
            }
            return Response(empty_result, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error retrieving results: {str(e)}")
            return Response(
                {
                    'error': 'An error occurred while retrieving results.',
                    'details': str(e),
                    'message': 'This could be due to a database connection issue. Please check your MongoDB connection and try again.'
                }, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class SaveResultsView(APIView):
    """
    API view for saving calculation results to historical data.
    """
    def post(self, request):
        """
        Save calculation results to historical data.
        """
        try:
            # Check MongoDB connection
            if not database.get_mongodb_status():
                logger.warning("MongoDB is not available. Using in-memory storage.")
            
            # Extract key data for historical analysis
            data = request.data
            
            historical_data = {
                'timestamp': datetime.now().isoformat(),
                'location': data.get('inputs', {}).get('location', ''),
                'roofArea': data.get('inputs', {}).get('roofArea', 0),
                'tankCapacity': data.get('inputs', {}).get('tankCapacity', 0),
                'inflow': data.get('inflow', {}).get('dailyInflow', 0),
                'outflow': data.get('inputs', {}).get('outflow', 0),
                'rainfall': data.get('weatherData', {}).get('averageRainfall', 0),
                'currentLevel': data.get('inputs', {}).get('tankCapacity', 0) * 0.5,  # Assume 50% for now
                'waterUsage': data.get('waterUsage', {}),
                'isLeaking': data.get('leakDetection', {}).get('isLeaking', False)
            }
            
            # Save to historical data collection
            result = database.save_historical_data(historical_data)
            
            if result:
                return Response({'message': 'Results saved successfully'}, status=status.HTTP_201_CREATED)
            
            return Response({'message': 'Failed to save results due to a database issue'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            logger.error(f"Error saving results: {str(e)}")
            return Response(
                {
                    'error': 'An error occurred while saving results.',
                    'details': str(e),
                    'message': 'This could be due to a database connection issue. The application is using in-memory storage as a fallback.'
                }, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class HistoricalDataView(APIView):
    """
    API view for retrieving historical data.
    """
    def get(self, request):
        """
        Get historical data for analysis.
        """
        try:
            # Check MongoDB connection
            if not database.get_mongodb_status():
                logger.warning("MongoDB is not available. Using in-memory storage.")
            
            # Get historical data from database
            historical_data = database.get_historical_data()
            
            if historical_data:
                # Convert MongoDB ObjectId to string for JSON serialization
                historical_data = json.loads(dumps(historical_data))
                return Response(historical_data, status=status.HTTP_200_OK)
            
            return Response({'message': 'No historical data found. Save some results first.'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logger.error(f"Error retrieving historical data: {str(e)}")
            return Response(
                {
                    'error': 'An error occurred while retrieving historical data.',
                    'details': str(e),
                    'message': 'This could be due to a database connection issue. The application is using in-memory storage as a fallback.'
                }, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class SettingsView(APIView):
    """
    API view for managing user settings.
    """
    def get(self, request):
        """
        Get user settings.
        """
        try:
            # Check MongoDB connection
            if not database.get_mongodb_status():
                logger.warning("MongoDB is not available. Using in-memory storage.")
            
            # Get settings from database
            settings = database.get_user_settings()
            
            if settings:
                # Convert MongoDB ObjectId to string for JSON serialization
                settings = json.loads(dumps(settings))
                return Response(settings, status=status.HTTP_200_OK)
            
            # Return default settings if none found
            default_settings = {
                'defaultRoofArea': '',
                'defaultOutflow': '',
                'defaultLocation': '',
                'defaultTankCapacity': '',
                'enableEmailAlerts': False,
                'emailAddress': '',
                'alertForLeaks': True,
                'alertForCleaning': True
            }
            return Response(default_settings, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error retrieving settings: {str(e)}")
            return Response(
                {
                    'error': 'An error occurred while retrieving settings.',
                    'details': str(e),
                    'message': 'This could be due to a database connection issue. The application is using default settings as a fallback.'
                }, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def put(self, request):
        """
        Update user settings.
        """
        serializer = SettingsSerializer(data=request.data)
        
        if serializer.is_valid():
            try:
                # Check MongoDB connection
                if not database.get_mongodb_status():
                    logger.warning("MongoDB is not available. Using in-memory storage.")
                
                # Add timestamp to settings data
                settings_data = serializer.validated_data
                settings_data['timestamp'] = datetime.now().isoformat()
                
                # Save settings to database
                result = database.save_user_settings(settings_data)
                
                if result:
                    return Response({'message': 'Settings updated successfully'}, status=status.HTTP_200_OK)
                
                return Response({'message': 'Failed to update settings due to a database issue'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            except Exception as e:
                logger.error(f"Error updating settings: {str(e)}")
                return Response(
                    {
                        'error': 'An error occurred while updating settings.',
                        'details': str(e),
                        'message': 'This could be due to a database connection issue. The application is using in-memory storage as a fallback.'
                    }, 
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class DeleteSavedResultsView(APIView):
    """
    API view for deleting saved results.
    """
    def delete(self, request):
        """
        Delete a saved result by ID.
        """
        serializer = ResultIdSerializer(data=request.query_params)
        
        if serializer.is_valid():
            try:
                # Check MongoDB connection
                if not database.get_mongodb_status():
                    logger.warning("MongoDB is not available. Using in-memory storage.")
                
                result_id = serializer.validated_data['id']
                
                # Delete result from database
                result = database.delete_saved_result(result_id)
                
                if result and result.deleted_count > 0:
                    return Response({'message': 'Result deleted successfully'}, status=status.HTTP_200_OK)
                
                return Response({'message': 'Result not found or could not be deleted'}, status=status.HTTP_404_NOT_FOUND)
            except Exception as e:
                logger.error(f"Error deleting result: {str(e)}")
                return Response(
                    {
                        'error': 'An error occurred while deleting the result.',
                        'details': str(e),
                        'message': 'This could be due to a database connection issue or an invalid result ID.'
                    }, 
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class WeatherView(APIView):
    """
    API view for fetching weather data.
    """
    def get(self, request):
        """
        Get weather forecast for a location.
        """
        location = request.query_params.get('location', '')
        
        if not location:
            return Response({'message': 'Location parameter is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Get weather forecast from OpenWeatherMap API
            weather_data = get_weather_forecast(location)
            return Response(weather_data, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error fetching weather data: {str(e)}")
            return Response(
                {
                    'error': 'An error occurred while fetching weather data.',
                    'details': str(e),
                    'message': 'This could be due to an issue with the OpenWeatherMap API or an invalid location. The application will use default rainfall values as a fallback.'
                }, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
