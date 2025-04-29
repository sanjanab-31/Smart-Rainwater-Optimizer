import axios from 'axios';

// Define the base API URL - use the full URL to avoid CORS issues
const API_URL = 'http://localhost:8000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Add withCredentials for CORS
  withCredentials: false
});

// Add response interceptor for better error handling
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.response || error);
    return Promise.reject(error);
  }
);

// API service functions
const apiService = {
  // User inputs
  saveInputs: async (inputData) => {
    try {
      console.log('Sending data to API:', inputData);
      const response = await api.post('/inputs/', inputData);
      console.log('API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error saving inputs:', error);
      // Return a structured error object that can be handled by the frontend
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'An error occurred while processing your data. Please try again.';
      const errorDetails = error.response?.data?.details || '';
      // Create a proper Error object
      const customError = new Error(errorMessage);
      customError.details = errorDetails;
      throw customError;
    }
  },

  // Results
  getResults: async () => {
    try {
      console.log('Fetching results from API');
      const response = await api.get('/results/');
      console.log('Results received:', response.data);
      
      // Check if the response contains a message indicating no results
      if (response.data && response.data.message && response.data.message.includes('No results found')) {
        console.log('No previous results available');
        // Return null to indicate no results are available
        return null;
      }
      
      return response.data;
    } catch (error) {
      console.error('Error fetching results:', error);
      // Don't throw an error, just return null to indicate no results
      console.log('Error fetching results, returning null');
      return null;
    }
  },

  saveResults: async (resultsData) => {
    try {
      const response = await api.post('/save-results/', resultsData);
      return response.data;
    } catch (error) {
      console.error('Error saving results:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'An error occurred while saving results.';
      // Create a proper Error object
      throw new Error(errorMessage);
    }
  },

  // Historical data
  getHistoricalData: async () => {
    try {
      const response = await api.get('/historical-data/');
      return response.data;
    } catch (error) {
      console.error('Error fetching historical data:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'An error occurred while fetching historical data.';
      // Create a proper Error object
      throw new Error(errorMessage);
    }
  },

  // User settings
  updateSettings: async (settingsData) => {
    try {
      const response = await api.put('/settings/', settingsData);
      return response.data;
    } catch (error) {
      console.error('Error updating settings:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'An error occurred while updating settings.';
      // Create a proper Error object
      throw new Error(errorMessage);
    }
  },

  // Delete saved results
  deleteSavedResults: async (resultId) => {
    try {
      const response = await api.delete(`/saved-results/?id=${resultId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting saved results:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          'An error occurred while deleting saved results.';
      // Create a proper Error object
      throw new Error(errorMessage);
    }
  },

  // Weather data
  getWeatherData: async (location) => {
    try {
      console.log('Fetching weather data for location:', location);
      const response = await api.get(`/weather/?location=${encodeURIComponent(location)}`);
      console.log('Weather data received:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching weather data:', error);
      // Use fallback data if there's an error with the weather API
      return {
        forecast: Array(7).fill().map((_, i) => ({
          date: new Date(Date.now() + i * 86400000).toISOString().split('T')[0],
          rainfall: 2.0 // Default rainfall value
        })),
        averageRainfall: 2.0,
        error: error.response?.data?.message || 'Error fetching weather data. Using default values.'
      };
    }
  },
};

export default apiService;
