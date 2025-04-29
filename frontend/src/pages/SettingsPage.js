import React, { useState, useEffect } from 'react';
import apiService from '../services/api';

const SettingsPage = () => {
  const [settings, setSettings] = useState({
    defaultRoofArea: '',
    defaultOutflow: '',
    defaultLocation: '',
    defaultTankCapacity: '',
    enableEmailAlerts: false,
    emailAddress: '',
    alertForLeaks: true,
    alertForCleaning: true
  });
  
  const [savedResults, setSavedResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saveStatus, setSaveStatus] = useState('');
  const [deleteStatus, setDeleteStatus] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // Fetch user settings
        const settingsResponse = await apiService.getResults();
        if (settingsResponse && settingsResponse.settings) {
          setSettings(settingsResponse.settings);
        }
        
        // Fetch saved results
        const historicalData = await apiService.getHistoricalData();
        if (historicalData) {
          setSavedResults(historicalData);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
        setError('An error occurred while fetching your settings. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await apiService.updateSettings(settings);
      setSaveStatus('Settings saved successfully!');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveStatus('Failed to save settings. Please try again.');
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  const handleDeleteResult = async (resultId) => {
    try {
      await apiService.deleteSavedResults(resultId);
      setSavedResults(savedResults.filter(result => result._id !== resultId));
      setDeleteStatus('Result deleted successfully!');
      setTimeout(() => setDeleteStatus(''), 3000);
    } catch (error) {
      console.error('Error deleting result:', error);
      setDeleteStatus('Failed to delete result. Please try again.');
      setTimeout(() => setDeleteStatus(''), 3000);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="card">
          <h1>Loading Settings...</h1>
          <p>Please wait while we fetch your settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card">
        <h1>Settings</h1>
        <p>Customize your rainwater harvesting system preferences and manage saved results.</p>
        
        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}
        
        {saveStatus && (
          <div className={`alert ${saveStatus.includes('Failed') ? 'alert-danger' : 'alert-success'}`}>
            {saveStatus}
          </div>
        )}
      </div>

      <div className="card">
        <h2>Default Input Values</h2>
        <p>Set default values for your system parameters to speed up data entry.</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <div className="form-row">
              <div className="form-col">
                <label htmlFor="defaultRoofArea">Default Roof Area (m²)</label>
                <input
                  type="number"
                  id="defaultRoofArea"
                  name="defaultRoofArea"
                  value={settings.defaultRoofArea}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="e.g., 100"
                />
              </div>
              <div className="form-col">
                <label htmlFor="defaultOutflow">Default Daily Outflow (liters/day)</label>
                <input
                  type="number"
                  id="defaultOutflow"
                  name="defaultOutflow"
                  value={settings.defaultOutflow}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="e.g., 200"
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-col">
                <label htmlFor="defaultLocation">Default Location</label>
                <input
                  type="text"
                  id="defaultLocation"
                  name="defaultLocation"
                  value={settings.defaultLocation}
                  onChange={handleChange}
                  placeholder="e.g., London or 51.5074,0.1278"
                />
              </div>
              <div className="form-col">
                <label htmlFor="defaultTankCapacity">Default Tank Capacity (liters)</label>
                <input
                  type="number"
                  id="defaultTankCapacity"
                  name="defaultTankCapacity"
                  value={settings.defaultTankCapacity}
                  onChange={handleChange}
                  min="0"
                  step="1"
                  placeholder="e.g., 5000"
                />
              </div>
            </div>
          </div>
          
          <div className="form-group">
            <h2>Notification Settings</h2>
            <div className="form-row">
              <div className="form-col">
                <div style={{ marginBottom: '1rem' }}>
                  <input
                    type="checkbox"
                    id="enableEmailAlerts"
                    name="enableEmailAlerts"
                    checked={settings.enableEmailAlerts}
                    onChange={handleChange}
                    style={{ width: 'auto', marginRight: '0.5rem' }}
                  />
                  <label htmlFor="enableEmailAlerts" style={{ display: 'inline' }}>
                    Enable Email Alerts
                  </label>
                </div>
                
                {settings.enableEmailAlerts && (
                  <div>
                    <label htmlFor="emailAddress">Email Address</label>
                    <input
                      type="email"
                      id="emailAddress"
                      name="emailAddress"
                      value={settings.emailAddress}
                      onChange={handleChange}
                      placeholder="your.email@example.com"
                    />
                  </div>
                )}
              </div>
              
              {settings.enableEmailAlerts && (
                <div className="form-col">
                  <div style={{ marginBottom: '1rem' }}>
                    <input
                      type="checkbox"
                      id="alertForLeaks"
                      name="alertForLeaks"
                      checked={settings.alertForLeaks}
                      onChange={handleChange}
                      style={{ width: 'auto', marginRight: '0.5rem' }}
                    />
                    <label htmlFor="alertForLeaks" style={{ display: 'inline' }}>
                      Alert for Leaks
                    </label>
                  </div>
                  
                  <div>
                    <input
                      type="checkbox"
                      id="alertForCleaning"
                      name="alertForCleaning"
                      checked={settings.alertForCleaning}
                      onChange={handleChange}
                      style={{ width: 'auto', marginRight: '0.5rem' }}
                    />
                    <label htmlFor="alertForCleaning" style={{ display: 'inline' }}>
                      Alert for Cleaning Reminders
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div style={{ marginTop: '1.5rem' }}>
            <button type="submit" className="btn btn-primary">
              Save Settings
            </button>
          </div>
        </form>
      </div>

      <div className="card">
        <h2>Saved Results</h2>
        
        {deleteStatus && (
          <div className={`alert ${deleteStatus.includes('Failed') ? 'alert-danger' : 'alert-success'}`}>
            {deleteStatus}
          </div>
        )}
        
        {savedResults.length === 0 ? (
          <p>No saved results found. Calculate and save results to view them here.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #ddd' }}>
                  <th style={{ textAlign: 'left', padding: '0.5rem' }}>Date</th>
                  <th style={{ textAlign: 'left', padding: '0.5rem' }}>Location</th>
                  <th style={{ textAlign: 'left', padding: '0.5rem' }}>Inflow (L/day)</th>
                  <th style={{ textAlign: 'left', padding: '0.5rem' }}>Outflow (L/day)</th>
                  <th style={{ textAlign: 'left', padding: '0.5rem' }}>Tank Size (L)</th>
                  <th style={{ textAlign: 'left', padding: '0.5rem' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {savedResults.map((result) => (
                  <tr key={result._id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '0.5rem' }}>{new Date(result.timestamp).toLocaleDateString()}</td>
                    <td style={{ padding: '0.5rem' }}>{result.location}</td>
                    <td style={{ padding: '0.5rem' }}>{result.inflow.toFixed(2)}</td>
                    <td style={{ padding: '0.5rem' }}>{result.outflow.toFixed(2)}</td>
                    <td style={{ padding: '0.5rem' }}>{result.tankCapacity}</td>
                    <td style={{ padding: '0.5rem' }}>
                      <button 
                        className="btn btn-danger" 
                        onClick={() => handleDeleteResult(result._id)}
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
