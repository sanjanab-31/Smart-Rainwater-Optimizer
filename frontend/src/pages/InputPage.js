import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/api';

const InputPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    roofArea: '',
    outflow: '',
    location: '',
    tankCapacity: '',
    waterCostPerLiter: '0.002', // Default value
    setupCost: '5000', // Default value
    maintenanceCost: '500' // Default value
  });

  // Load saved settings if available
  useEffect(() => {
    const loadSavedSettings = async () => {
      try {
        // Try to get the latest results without requiring a user_input_id
        const results = await apiService.getResults();
        if (results && results.inputs) {
          console.log('Found saved settings, applying to form');
          setFormData(prevState => ({
            ...prevState,
            ...results.inputs
          }));
        } else {
          console.log('No saved settings found, using defaults');
        }
      } catch (error) {
        // Don't show error to user on initial load - just use defaults
        console.log('No saved settings found, using defaults');
      }
    };

    loadSavedSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const validateForm = () => {
    // Check for empty required fields
    const requiredFields = ['roofArea', 'outflow', 'location', 'tankCapacity'];
    for (const field of requiredFields) {
      if (!formData[field]) {
        setError(`Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()} field.`);
        return false;
      }
    }

    // Validate numeric fields
    const numericFields = ['roofArea', 'outflow', 'tankCapacity', 'waterCostPerLiter', 'setupCost', 'maintenanceCost'];
    for (const field of numericFields) {
      if (isNaN(parseFloat(formData[field])) || parseFloat(formData[field]) < 0) {
        setError(`Please enter a valid positive number for ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}.`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Convert string values to numbers
      const processedData = {
        ...formData,
        roofArea: parseFloat(formData.roofArea),
        outflow: parseFloat(formData.outflow),
        tankCapacity: parseFloat(formData.tankCapacity),
        waterCostPerLiter: parseFloat(formData.waterCostPerLiter),
        setupCost: parseFloat(formData.setupCost),
        maintenanceCost: parseFloat(formData.maintenanceCost)
      };

      console.log('Submitting data to API:', processedData);

      // Save inputs and get results
      const response = await apiService.saveInputs(processedData);
      
      console.log('API response received:', response);
      
      // Navigate to results page
      navigate('/results', { state: { results: response } });
    } catch (error) {
      console.error('Error submitting form:', error);
      
      // Display the error message from the API or a default message
      let errorMessage = 'An error occurred while processing your data. Please try again.';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        errorMessage = error.error || 'An unknown error occurred.';
      }
      
      // If there are details, include them in the error message for debugging
      if (error.details) {
        console.error('Error details:', error.details);
        errorMessage += '\n\nDetails: ' + error.details;
      }
      
      setError(errorMessage);
      
      // Try to fetch results directly as a fallback
      try {
        console.log('Attempting to fetch results directly as fallback');
        const results = await apiService.getResults();
        if (results) {
          console.log('Fallback successful, navigating to results page');
          navigate('/results', { state: { results } });
        }
      } catch (fallbackError) {
        console.error('Fallback attempt also failed:', fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h1>Input Parameters</h1>
        <p>Enter your rainwater harvesting system details below to receive optimized calculations and recommendations.</p>
        
        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <h2>System Parameters</h2>
            <div className="form-row">
              <div className="form-col">
                <label htmlFor="roofArea">Roof Area (m²)</label>
                <input
                  type="number"
                  id="roofArea"
                  name="roofArea"
                  value={formData.roofArea}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="e.g., 100"
                />
              </div>
              <div className="form-col">
                <label htmlFor="outflow">Daily Outflow (liters/day)</label>
                <input
                  type="number"
                  id="outflow"
                  name="outflow"
                  value={formData.outflow}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="e.g., 200"
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-col">
                <label htmlFor="location">Location (City or GPS coordinates)</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g., London or 51.5074,0.1278"
                />
              </div>
              <div className="form-col">
                <label htmlFor="tankCapacity">Storage Capacity (liters)</label>
                <input
                  type="number"
                  id="tankCapacity"
                  name="tankCapacity"
                  value={formData.tankCapacity}
                  onChange={handleChange}
                  min="0"
                  step="1"
                  placeholder="e.g., 5000"
                />
              </div>
            </div>
          </div>
          
          <div className="form-group">
            <h2>Cost Parameters (Optional)</h2>
            <div className="form-row">
              <div className="form-col">
                <label htmlFor="waterCostPerLiter">Local Water Cost (per liter)</label>
                <input
                  type="number"
                  id="waterCostPerLiter"
                  name="waterCostPerLiter"
                  value={formData.waterCostPerLiter}
                  onChange={handleChange}
                  min="0"
                  step="0.0001"
                  placeholder="e.g., 0.002"
                />
              </div>
              <div className="form-col">
                <label htmlFor="setupCost">System Setup Cost</label>
                <input
                  type="number"
                  id="setupCost"
                  name="setupCost"
                  value={formData.setupCost}
                  onChange={handleChange}
                  min="0"
                  step="1"
                  placeholder="e.g., 5000"
                />
              </div>
              <div className="form-col">
                <label htmlFor="maintenanceCost">Annual Maintenance Cost</label>
                <input
                  type="number"
                  id="maintenanceCost"
                  name="maintenanceCost"
                  value={formData.maintenanceCost}
                  onChange={handleChange}
                  min="0"
                  step="1"
                  placeholder="e.g., 500"
                />
              </div>
            </div>
          </div>
          
          <div style={{ marginTop: '2rem' }}>
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={loading}
              style={{ marginRight: '1rem' }}
            >
              {loading ? 'Processing...' : 'Calculate Results'}
            </button>
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => navigate('/')}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InputPage;
