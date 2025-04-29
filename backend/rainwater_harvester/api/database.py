"""
MongoDB database connection and utility functions.
"""
import os
from pymongo import MongoClient
from django.conf import settings
import logging

# Set up logging
logger = logging.getLogger(__name__)

# Get MongoDB connection details from settings
try:
    MONGODB_URI = settings.MONGODB_URI
    MONGODB_NAME = settings.MONGODB_NAME
except AttributeError:
    MONGODB_URI = None
    MONGODB_NAME = None
    MONGODB_AVAILABLE = False

# Create MongoDB client with error handling
if MONGODB_URI and MONGODB_NAME:
    try:
        client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
        # Verify connection
        client.server_info()
        db = client[MONGODB_NAME]
        
        # Define collections
        inputs_collection = db['inputs']
        results_collection = db['results']
        historical_data_collection = db['historical_data']
        settings_collection = db['settings']
        
        MONGODB_AVAILABLE = True
        logger.info("MongoDB connection established successfully")
    except Exception as e:
        logger.error(f"MongoDB connection error: {str(e)}")
        MONGODB_AVAILABLE = False
else:
    logger.warning("MongoDB settings not found, using in-memory storage")
    MONGODB_AVAILABLE = False

# Create dummy collections for fallback if MongoDB is not available
if not MONGODB_AVAILABLE:
    class DummyCollection:
        def __init__(self, name):
            self.name = name
            self.data = []
        
        def insert_one(self, data):
            self.data.append(data)
            return type('obj', (object,), {'inserted_id': 'dummy_id'})
        
        def find_one(self, *args, **kwargs):
            return self.data[-1] if self.data else None
        
        def find(self, *args, **kwargs):
            limit = kwargs.get('limit', len(self.data))
            return self.data[:limit]
        
        def update_one(self, *args, **kwargs):
            return type('obj', (object,), {'modified_count': 1})
        
        def delete_one(self, *args, **kwargs):
            return type('obj', (object,), {'deleted_count': 1})
    
    inputs_collection = DummyCollection('inputs')
    results_collection = DummyCollection('results')
    historical_data_collection = DummyCollection('historical_data')
    settings_collection = DummyCollection('settings')

def save_inputs(input_data):
    """
    Save user inputs to MongoDB.
    """
    try:
        return inputs_collection.insert_one(input_data)
    except Exception as e:
        logger.error(f"Error saving inputs: {str(e)}")
        return None

def get_latest_inputs():
    """
    Get the latest user inputs from MongoDB.
    """
    try:
        return inputs_collection.find_one(sort=[('timestamp', -1)])
    except Exception as e:
        logger.error(f"Error getting latest inputs: {str(e)}")
        return None

def save_results(results_data):
    """
    Save calculation results to MongoDB.
    """
    try:
        return results_collection.insert_one(results_data)
    except Exception as e:
        logger.error(f"Error saving results: {str(e)}")
        return None

def get_latest_results():
    """
    Get the latest calculation results from MongoDB.
    """
    try:
        return results_collection.find_one(sort=[('timestamp', -1)])
    except Exception as e:
        logger.error(f"Error getting latest results: {str(e)}")
        return None

def get_results_by_input_id(input_id):
    """
    Get calculation results for a specific input ID.
    """
    try:
        # Try to find results with the matching input ID in the inputs field
        return results_collection.find_one({"inputs._id": input_id})
    except Exception as e:
        logger.error(f"Error getting results by input ID: {str(e)}")
        return None

def save_historical_data(historical_data):
    """
    Save historical data for analysis.
    """
    try:
        return historical_data_collection.insert_one(historical_data)
    except Exception as e:
        logger.error(f"Error saving historical data: {str(e)}")
        return None

def get_historical_data(limit=100):
    """
    Get historical data for analysis, limited to the most recent entries.
    """
    try:
        return list(historical_data_collection.find(sort=[('timestamp', -1)], limit=limit))
    except Exception as e:
        logger.error(f"Error getting historical data: {str(e)}")
        return []

def save_user_settings(settings_data):
    """
    Save user settings to MongoDB.
    """
    try:
        # Check if settings already exist
        existing_settings = settings_collection.find_one()
        
        if existing_settings:
            # Update existing settings
            return settings_collection.update_one(
                {'_id': existing_settings['_id']},
                {'$set': settings_data}
            )
        else:
            # Create new settings
            return settings_collection.insert_one(settings_data)
    except Exception as e:
        logger.error(f"Error saving user settings: {str(e)}")
        return None

def get_user_settings():
    """
    Get user settings from MongoDB.
    """
    try:
        return settings_collection.find_one()
    except Exception as e:
        logger.error(f"Error getting user settings: {str(e)}")
        return None

def delete_saved_result(result_id):
    """
    Delete a saved result by its ID.
    """
    try:
        from bson.objectid import ObjectId
        return results_collection.delete_one({'_id': ObjectId(result_id)})
    except Exception as e:
        logger.error(f"Error deleting saved result: {str(e)}")
        return None

def get_mongodb_status():
    """
    Get MongoDB connection status.
    """
    return MONGODB_AVAILABLE
