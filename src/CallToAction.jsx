import React from 'react';
import './CallToAction.css';

const CallToAction = () => {
  return (
    <div className="cta-section">
      <div className="cta-container">
        <div className="cta-content">
          <div className="cta-image">
            <img src="/Images/_DSC1120.jpg" alt="Stealth USB" />
          </div>
          <div className="cta-text">
            <h3>Unmatched Data Security</h3>
            <p>The Stealth USB represents the pinnacle of secure portable storage technology. Engineered for professionals who demand absolute data security, this device combines AES-256 encryption with a stealth form factor.</p>
            <div className="cta-features">
              <ul>
                <li>Military-grade AES-256 encryption</li>
                <li>Self-destruct mechanism</li>
                <li>128GB storage capacity</li>
              </ul>
            </div>
            <a href="/shop" className="btn">
              Shop Now
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallToAction;