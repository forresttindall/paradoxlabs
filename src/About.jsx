import React from 'react';
import { useEffect } from 'react';
import './About.css';

function About() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <div className="about-page">
      <div className="container">
        <div className="about-header">
          <h1>About Paradox Labs</h1>
          <p>Leading-Edge Technology & Covert Tools</p>
        </div>
        
        <div className="about-content">
          <div className="about-section">
            <div className="about-text">
              <h2>Our Mission</h2>
              <p>
                At Paradox Labs, we develop cutting-edge technology solutions and tools for cybersecurity, 
                tactical operations, journalists and those wanting to keep a low profile. Every product is designed with 
                precision, security, and reliability in mind.
              </p>
            </div>
            <div className="about-image">
              <img src="/Images/servers.jpg" alt="Paradox Labs Technology" />
            </div>
          </div>
          
          <div className="about-section reverse">
            <div className="about-image">
              <img src="/Images/_DSC1120.jpg" alt="Our Products" />
            </div>
            <div className="about-text">
              <h2>What We Do</h2>
              <p>
                Our product line includes ultra-secure storage devices, covert multi-tools, 
                and specialized cyber gadgets. From military-grade encryption to non-metallic 
                tactical tools, we provide solutions for professionals who demand excellence.
              </p>
            </div>
          </div>
        </div>
        
        <div className="about-cta">
          <h2>Explore Our Products</h2>
          <p>Discover our full range of cutting-edge solutions.</p>
          <a href="/shop" className="btn">Shop Now</a>
        </div>
      </div>
    </div>
  );
}

export default About;