import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer-container">
      <div className="footer-content">
        <div className="footer-logo-section">
          <div className="footer-logo-container">
            <img 
              src="/Images/logo.png" 
              alt="Paradox Labs Logo" 
              className="footer-logo-image"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <h3 className="footer-logo">Paradox Labs</h3>
          </div>
          <p className="footer-tagline">Leading-Edge Tech, Covert Tools, & Cyber Gadgets</p>
        </div>
        
        <div className="footer-links">
          <div className="footer-links-column">
            <h4>Legal</h4>
            <Link to="/privacy-policy">Privacy Policy</Link>
            <Link to="/terms-of-service">Terms of Service</Link>
          </div>
          
          <div className="footer-links-column">
            <h4>Company</h4>
            <Link to="/about">About Us</Link>
            <Link to="/contact">Contact</Link>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>© {currentYear} Paradox Labs. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;