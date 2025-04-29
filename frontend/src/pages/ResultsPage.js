import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import apiService from '../services/api';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saveStatus, setSaveStatus] = useState('');

  useEffect(() => {
    const fetchResults = async () => {
      try {
        // If results were passed via navigation state, use those
        if (location.state && location.state.results) {
          setResults(location.state.results);
          setLoading(false);
          return;
        }

        // Otherwise fetch the latest results from the API
        const response = await apiService.getResults();
        if (response) {
          setResults(response);
        } else {
          setError('No results found. Please enter your system parameters first.');
          setTimeout(() => {
            navigate('/input');
          }, 3000);
        }
      } catch (error) {
        console.error('Error fetching results:', error);
        setError('An error occurred while fetching results. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [location.state, navigate]);

  const handleSaveResults = async () => {
    if (!results) return;

    try {
      await apiService.saveResults(results);
      setSaveStatus('Results saved successfully!');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      console.error('Error saving results:', error);
      setSaveStatus('Failed to save results. Please try again.');
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="card">
          <h1>Loading Results...</h1>
          <p>Please wait while we process your data.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="card">
          <h1>Error</h1>
          <div className="alert alert-danger">{error}</div>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="container">
        <div className="card">
          <h1>No Results Available</h1>
          <p>Please enter your system parameters to generate results.</p>
          <button 
            className="btn btn-primary" 
            onClick={() => navigate('/input')}
          >
            Go to Input Page
          </button>
        </div>
      </div>
    );
  }

  const { 
    inputs, 
    inflow, 
    leakDetection, 
    roi, 
    waterUsage, 
    tankRecommendation, 
    maintenanceSchedule,
    weatherData 
  } = results;

  // Prepare data for inflow vs outflow chart
  const inflowOutflowData = {
    labels: ['Current System'],
    datasets: [
      {
        label: 'Inflow (liters/day)',
        data: [inflow.dailyInflow],
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
      {
        label: 'Outflow (liters/day)',
        data: [inputs.outflow],
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
    ],
  };

  // Prepare data for water usage allocation chart
  const waterUsageData = {
    labels: ['Drinking', 'Cleaning', 'Gardening'],
    datasets: [
      {
        label: 'Allocation (%)',
        data: [waterUsage.drinking, waterUsage.cleaning, waterUsage.gardening],
        backgroundColor: [
          'rgba(53, 162, 235, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(76, 175, 80, 0.5)',
        ],
      },
    ],
  };

  // Prepare data for rainfall forecast chart
  const rainfallData = {
    labels: weatherData.forecast.map(day => day.date),
    datasets: [
      {
        label: 'Rainfall (mm)',
        data: weatherData.forecast.map(day => day.rainfall),
        borderColor: 'rgba(53, 162, 235, 0.8)',
        backgroundColor: 'rgba(53, 162, 235, 0.2)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  return (
    <div className="container">
      {saveStatus && (
        <div className={`alert ${saveStatus.includes('Failed') ? 'alert-danger' : 'alert-success'}`}>
          {saveStatus}
        </div>
      )}

      <div className="card">
        <h1>Rainwater Harvesting Results</h1>
        <p>Based on your input parameters, here are the calculated results and recommendations for your rainwater harvesting system.</p>
        
        <div style={{ textAlign: 'right', marginBottom: '1rem' }}>
          <button 
            className="btn btn-primary" 
            onClick={handleSaveResults}
            style={{ marginRight: '1rem' }}
          >
            Save Results
          </button>
          <button 
            className="btn btn-secondary" 
            onClick={() => navigate('/input')}
          >
            Modify Inputs
          </button>
        </div>
      </div>

      <div className="card">
        <h2>System Overview</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <h3>Roof Area</h3>
            <p>{inputs.roofArea} m²</p>
          </div>
          <div>
            <h3>Daily Outflow</h3>
            <p>{inputs.outflow} liters/day</p>
          </div>
          <div>
            <h3>Location</h3>
            <p>{inputs.location}</p>
          </div>
          <div>
            <h3>Tank Capacity</h3>
            <p>{inputs.tankCapacity} liters</p>
          </div>
          <div>
            <h3>Daily Inflow (avg)</h3>
            <p>{inflow.dailyInflow.toFixed(2)} liters/day</p>
          </div>
          <div>
            <h3>Monthly Inflow (avg)</h3>
            <p>{inflow.monthlyInflow.toFixed(2)} liters/month</p>
          </div>
        </div>
      </div>

      <div className="card">
        <h2>Inflow vs Outflow</h2>
        <div style={{ height: '300px' }}>
          <Bar 
            data={inflowOutflowData} 
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'top',
                },
                title: {
                  display: true,
                  text: 'Daily Water Flow Comparison',
                },
              },
            }} 
          />
        </div>
      </div>

      <div className="card">
        <h2>Rainfall Forecast</h2>
        <div style={{ height: '300px' }}>
          <Line 
            data={rainfallData} 
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'top',
                },
                title: {
                  display: true,
                  text: 'Predicted Rainfall (Next 7 Days)',
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: 'Rainfall (mm)',
                  },
                },
              },
            }} 
          />
        </div>
        <p style={{ marginTop: '1rem' }}>
          <strong>Average Rainfall:</strong> {weatherData.averageRainfall.toFixed(2)} mm/day
        </p>
      </div>

      {leakDetection.isLeaking && (
        <div className="card">
          <h2>Leak Detection Alert</h2>
          <div className="alert alert-warning">
            <strong>Potential leak detected!</strong> Your system's outflow exceeds the expected inflow by approximately {leakDetection.difference.toFixed(2)} liters per day.
          </div>
          <p>
            <strong>Severity:</strong> {leakDetection.severity.charAt(0).toUpperCase() + leakDetection.severity.slice(1)}
          </p>
          <p>
            <strong>Recommendation:</strong> Schedule an inspection within the next {leakDetection.severity === 'high' ? '2' : '3'} months to check for leaks in your system.
          </p>
        </div>
      )}

      <div className="card">
        <h2>AI-Based Water Usage Optimization</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ height: '300px' }}>
            <Bar 
              data={waterUsageData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                  title: {
                    display: true,
                    text: 'Recommended Water Allocation',
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                      display: true,
                      text: 'Percentage (%)',
                    },
                  },
                },
              }} 
            />
          </div>
          <div>
            <h3>Optimization Rationale</h3>
            <p>
              Based on your current rainfall predictions ({weatherData.averageRainfall.toFixed(2)} mm/day) and tank capacity utilization, 
              we recommend allocating your harvested water as follows:
            </p>
            <ul>
              <li><strong>Drinking:</strong> {waterUsage.drinking}%</li>
              <li><strong>Cleaning:</strong> {waterUsage.cleaning}%</li>
              <li><strong>Gardening:</strong> {waterUsage.gardening}%</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="card">
        <h2>Tank Capacity Planning</h2>
        <p>
          <strong>Current Tank Capacity:</strong> {inputs.tankCapacity} liters
        </p>
        <p>
          <strong>Recommended Tank Size:</strong> {tankRecommendation.recommendedSize} liters
        </p>
        <p>
          <strong>Recommendation:</strong> {
            tankRecommendation.recommendedSize > inputs.tankCapacity
              ? `Consider upgrading your tank to increase storage capacity by ${(tankRecommendation.recommendedSize - inputs.tankCapacity).toLocaleString()} liters.`
              : tankRecommendation.recommendedSize < inputs.tankCapacity
                ? `Your current tank size exceeds the recommended capacity. This provides extra buffer during heavy rainfall periods.`
                : `Your current tank size is optimal for your needs.`
          }
        </p>
      </div>

      <div className="card">
        <h2>Return on Investment (ROI)</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <h3>Water Savings</h3>
            <p>${roi.savings.toFixed(2)} per year</p>
          </div>
          <div>
            <h3>System Costs</h3>
            <p>${roi.costs.toFixed(2)} per year</p>
          </div>
          <div>
            <h3>Net ROI</h3>
            <p>${roi.roi.toFixed(2)} per year</p>
          </div>
          <div>
            <h3>Payback Period</h3>
            <p>{Math.round(roi.paybackPeriod)} days</p>
          </div>
        </div>
      </div>

      <div className="card">
        <h2>Maintenance Schedule</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #ddd' }}>
              <th style={{ textAlign: 'left', padding: '0.5rem' }}>Date</th>
              <th style={{ textAlign: 'left', padding: '0.5rem' }}>Type</th>
              <th style={{ textAlign: 'left', padding: '0.5rem' }}>Description</th>
            </tr>
          </thead>
          <tbody>
            {maintenanceSchedule.map((item, index) => (
              <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '0.5rem' }}>{item.date}</td>
                <td style={{ padding: '0.5rem' }}>{item.type.charAt(0).toUpperCase() + item.type.slice(1)}</td>
                <td style={{ padding: '0.5rem' }}>{item.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p style={{ marginTop: '1rem' }}>
          <strong>Note:</strong> Regular tank cleaning is recommended every 3 months, and system inspections every 2-3 months.
        </p>
      </div>
    </div>
  );
};

export default ResultsPage;
