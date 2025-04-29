import React from 'react';
import { NavLink } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <NavLink to="/" className="navbar-logo">
          Smart Rainwater Harvester
        </NavLink>
        <div className="navbar-links">
          <NavLink to="/" className={({ isActive }) => isActive ? "navbar-link active" : "navbar-link"}>
            Home
          </NavLink>
          <NavLink to="/input" className={({ isActive }) => isActive ? "navbar-link active" : "navbar-link"}>
            Input
          </NavLink>
          <NavLink to="/results" className={({ isActive }) => isActive ? "navbar-link active" : "navbar-link"}>
            Results
          </NavLink>
          <NavLink to="/analysis" className={({ isActive }) => isActive ? "navbar-link active" : "navbar-link"}>
            Analysis
          </NavLink>
          <NavLink to="/settings" className={({ isActive }) => isActive ? "navbar-link active" : "navbar-link"}>
            Settings
          </NavLink>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
