import React from 'react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer">
      <div className="container footer-container">
        <p className="footer-text">
          &copy; {currentYear} Smart Rainwater Harvesting Optimizer. All rights reserved.
        </p>
        <p className="footer-text">
          Promoting water conservation and sustainability
        </p>
      </div>
    </footer>
  );
};

export default Footer;
