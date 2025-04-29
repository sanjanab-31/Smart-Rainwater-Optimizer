import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="container">
      <section className="card">
        <h1>Smart Rainwater Harvesting Optimizer</h1>
        <p>
          Welcome to the Smart Rainwater Harvesting Optimizer, a comprehensive platform designed to help you maximize the efficiency of your rainwater harvesting system. Our advanced tools provide real-time calculations, weather integration, and AI-driven recommendations to optimize your water usage and maintenance.
        </p>
        <div style={{ marginTop: '2rem' }}>
          <Link to="/input" className="btn btn-primary" style={{ marginRight: '1rem' }}>
            Get Started
          </Link>
          <Link to="/analysis" className="btn btn-secondary">
            View Analysis
          </Link>
        </div>
      </section>

      <section className="card">
        <h2>Key Features</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
          <div>
            <h3>Real-Time Calculations</h3>
            <p>Input your roof area, outflow, location, and tank capacity to receive precise inflow calculations and usage recommendations.</p>
          </div>
          <div>
            <h3>Weather Integration</h3>
            <p>Automatically fetch real-time rainfall predictions based on your location using the OpenWeatherMap API.</p>
          </div>
          <div>
            <h3>Leak Detection</h3>
            <p>Compare inflow vs. outflow to detect abnormal losses and receive smart alerts with inspection recommendations.</p>
          </div>
          <div>
            <h3>ROI Calculation</h3>
            <p>Calculate your return on investment based on water saved, local water costs, and system setup/maintenance expenses.</p>
          </div>
          <div>
            <h3>AI-Based Optimization</h3>
            <p>Receive intelligent recommendations for water usage allocation between drinking, cleaning, and gardening.</p>
          </div>
          <div>
            <h3>Visual Reports</h3>
            <p>View comprehensive graphs and charts to gain insights into your water usage patterns and system performance.</p>
          </div>
        </div>
      </section>

      <section className="card">
        <h2>How It Works</h2>
        <ol style={{ marginLeft: '1.5rem', lineHeight: '1.8' }}>
          <li>Enter your system parameters in the <Link to="/input">Input page</Link>.</li>
          <li>The system fetches real-time weather data for your location.</li>
          <li>Our algorithms calculate optimal water usage, detect potential leaks, and generate maintenance schedules.</li>
          <li>View your results and recommendations in the <Link to="/results">Results page</Link>.</li>
          <li>Track historical performance and trends in the <Link to="/analysis">Analysis page</Link>.</li>
          <li>Customize your preferences in the <Link to="/settings">Settings page</Link>.</li>
        </ol>
      </section>
    </div>
  );
};

export default HomePage;
