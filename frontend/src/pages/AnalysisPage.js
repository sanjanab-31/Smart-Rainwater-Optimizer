import React, { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
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
import { Chart, Filler } from 'chart.js'; 
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
Chart.register(Filler);

const AnalysisPage = () => {
  const [historicalData, setHistoricalData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('month'); // 'week', 'month', 'year'

  useEffect(() => {
    const fetchHistoricalData = async () => {
      try {
        const response = await apiService.getHistoricalData();
        if (response && response.length > 0) {
          setHistoricalData(response);
        } else {
          setError('No historical data found. Start using the system to generate data for analysis.');
        }
      } catch (error) {
        console.error('Error fetching historical data:', error);
        setError('An error occurred while fetching historical data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchHistoricalData();
  }, []);

  // Filter data based on selected time range
  const getFilteredData = () => {
    if (!historicalData.length) return [];

    const now = new Date();
    let cutoffDate;

    switch (timeRange) {
      case 'week':
        cutoffDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        cutoffDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'year':
        cutoffDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        cutoffDate = new Date(now.setMonth(now.getMonth() - 1)); // Default to month
    }

    return historicalData.filter(item => new Date(item.timestamp) >= cutoffDate);
  };

  const filteredData = getFilteredData();

  // Prepare data for rainfall trends chart
  const rainfallData = {
    labels: filteredData.map(item => new Date(item.timestamp).toLocaleDateString()),
    datasets: [
      {
        label: 'Rainfall (mm)',
        data: filteredData.map(item => item.rainfall),
        borderColor: 'rgba(53, 162, 235, 0.8)',
        backgroundColor: 'rgba(53, 162, 235, 0.2)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  // Prepare data for inflow vs outflow chart
  const inflowOutflowData = {
    labels: filteredData.map(item => new Date(item.timestamp).toLocaleDateString()),
    datasets: [
      {
        label: 'Inflow (liters/day)',
        data: filteredData.map(item => item.inflow),
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
      {
        label: 'Outflow (liters/day)',
        data: filteredData.map(item => item.outflow),
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
    ],
  };

  // Prepare data for tank capacity utilization chart
  const tankUtilizationData = {
    labels: filteredData.map(item => new Date(item.timestamp).toLocaleDateString()),
    datasets: [
      {
        label: 'Tank Utilization (%)',
        data: filteredData.map(item => (item.currentLevel / item.tankCapacity) * 100),
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
    ],
  };

  // Calculate average values
  const calculateAverages = () => {
    if (!filteredData.length) return { avgRainfall: 0, avgInflow: 0, avgOutflow: 0, avgUtilization: 0 };

    const sum = filteredData.reduce((acc, item) => {
      return {
        rainfall: acc.rainfall + item.rainfall,
        inflow: acc.inflow + item.inflow,
        outflow: acc.outflow + item.outflow,
        utilization: acc.utilization + ((item.currentLevel / item.tankCapacity) * 100),
      };
    }, { rainfall: 0, inflow: 0, outflow: 0, utilization: 0 });

    return {
      avgRainfall: (sum.rainfall / filteredData.length).toFixed(2),
      avgInflow: (sum.inflow / filteredData.length).toFixed(2),
      avgOutflow: (sum.outflow / filteredData.length).toFixed(2),
      avgUtilization: (sum.utilization / filteredData.length).toFixed(2),
    };
  };

  const averages = calculateAverages();

  if (loading) {
    return (
      <div className="container">
        <div className="card">
          <h1>Loading Analysis...</h1>
          <p>Please wait while we fetch your historical data.</p>
        </div>
      </div>
    );
  }

  if (error && !historicalData.length) {
    return (
      <div className="container">
        <div className="card">
          <h1>Historical Analysis</h1>
          <div className="alert alert-info">
            {error}
          </div>
          <p>Use the system regularly to generate data for analysis. Each time you save results, they will be stored for historical tracking.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card">
        <h1>Historical Analysis</h1>
        <p>View trends and patterns in your rainwater harvesting system performance over time.</p>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <label htmlFor="timeRange" style={{ marginRight: '1rem' }}>Time Range:</label>
          <select 
            id="timeRange" 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
            style={{ width: 'auto', display: 'inline-block', marginBottom: 0 }}
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="year">Last Year</option>
          </select>
        </div>
      </div>

      {!filteredData.length ? (
        <div className="card">
          <div className="alert alert-info">
            No data available for the selected time range. Try selecting a different range or use the system more to generate data.
          </div>
        </div>
      ) : (
        <>
          <div className="card">
            <h2>System Averages</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <h3>Avg. Rainfall</h3>
                <p>{averages.avgRainfall} mm/day</p>
              </div>
              <div>
                <h3>Avg. Inflow</h3>
                <p>{averages.avgInflow} liters/day</p>
              </div>
              <div>
                <h3>Avg. Outflow</h3>
                <p>{averages.avgOutflow} liters/day</p>
              </div>
              <div>
                <h3>Avg. Tank Utilization</h3>
                <p>{averages.avgUtilization}%</p>
              </div>
            </div>
          </div>

          <div className="card">
            <h2>Rainfall Trends</h2>
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
                      text: 'Historical Rainfall',
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
                      text: 'Water Flow Comparison',
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      title: {
                        display: true,
                        text: 'Volume (liters/day)',
                      },
                    },
                  },
                }} 
              />
            </div>
          </div>

          <div className="card">
            <h2>Tank Capacity Utilization</h2>
            <div style={{ height: '300px' }}>
              <Bar 
                data={tankUtilizationData} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                    title: {
                      display: true,
                      text: 'Tank Utilization Over Time',
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 100,
                      title: {
                        display: true,
                        text: 'Utilization (%)',
                      },
                    },
                  },
                }} 
              />
            </div>
          </div>

          <div className="card">
            <h2>Insights</h2>
            <div>
              {parseFloat(averages.avgInflow) > parseFloat(averages.avgOutflow) ? (
                <div className="alert alert-success">
                  Your system is collecting more water than you're using. Consider increasing usage or expanding storage capacity.
                </div>
              ) : (
                <div className="alert alert-warning">
                  Your usage exceeds collection. Consider water conservation measures or expanding your collection area.
                </div>
              )}
              
              {parseFloat(averages.avgUtilization) > 80 ? (
                <div className="alert alert-warning">
                  Your tank is frequently near capacity ({averages.avgUtilization}% average utilization). Consider a larger tank or increased usage.
                </div>
              ) : parseFloat(averages.avgUtilization) < 20 ? (
                <div className="alert alert-info">
                  Your tank is frequently underutilized ({averages.avgUtilization}% average utilization). Your current capacity is more than sufficient.
                </div>
              ) : (
                <div className="alert alert-success">
                  Your tank utilization is optimal ({averages.avgUtilization}% average utilization).
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AnalysisPage;
