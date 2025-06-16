import { useEffect } from 'react';
import './PrivacyPolicy.css';

function PrivacyPolicy() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <div className="privacy-page">
      <div className="container">
        <div className="privacy-header">
          <h1>Privacy Policy</h1>
          <p>Your privacy is important to us. This policy explains how we handle your information.</p>
        </div>
        
        <div className="privacy-content">
          <div className="privacy-section">
            <h2>Information We Collect</h2>
            <p>
              We collect only the essential information needed to process your orders and provide customer support. 
              This includes:
            </p>
            <ul>
              <li>Billing information (name, address, payment details) for order processing</li>
              <li>Contact information (email, phone) for order updates and customer service</li>
              <li>Shipping address for product delivery</li>
            </ul>
          </div>
          
          <div className="privacy-section">
            <h2>How We Use Your Information</h2>
            <p>
              Your information is used exclusively for:
            </p>
            <ul>
              <li>Processing and fulfilling your orders</li>
              <li>Providing customer support and order updates</li>
              <li>Sending important account and order-related communications</li>
            </ul>
            <p>
              We do not use your information for marketing purposes unless you explicitly opt-in to our newsletter.
            </p>
          </div>
          
          <div className="privacy-section">
            <h2>Information Sharing</h2>
            <p>
              <strong>We never share, sell, or distribute your personal information to third parties.</strong> 
              Your data remains strictly confidential and is only accessed by authorized Paradox Labs personnel 
              for order processing and customer service purposes.
            </p>
            <p>
              The only exception is when required by law or to protect our rights, property, or safety.
            </p>
          </div>
          
          <div className="privacy-section">
            <h2>Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your personal information:
            </p>
            <ul>
              <li>Encrypted data transmission using SSL/TLS protocols</li>
              <li>Secure payment processing through trusted payment providers</li>
              <li>Limited access to personal data on a need-to-know basis</li>
              <li>Regular security audits and updates</li>
            </ul>
          </div>
          
          <div className="privacy-section">
            <h2>Data Retention</h2>
            <p>
              We retain your information only as long as necessary to:
            </p>
            <ul>
              <li>Fulfill your orders and provide customer support</li>
              <li>Comply with legal and regulatory requirements</li>
              <li>Resolve disputes and enforce our agreements</li>
            </ul>
            <p>
              You may request deletion of your personal data at any time by contacting us.
            </p>
          </div>
          
          <div className="privacy-section">
            <h2>Cookies and Tracking</h2>
            <p>
              Our website uses minimal cookies necessary for basic functionality, such as:
            </p>
            <ul>
              <li>Shopping cart functionality</li>
              <li>Session management</li>
              <li>Security features</li>
            </ul>
            <p>
              We do not use tracking cookies for advertising purposes.
            </p>
          </div>
          
          <div className="privacy-section">
            <h2>Your Rights</h2>
            <p>
              You have the right to:
            </p>
            <ul>
              <li>Access the personal information we have about you</li>
              <li>Request correction of inaccurate information</li>
              <li>Request deletion of your personal data</li>
              <li>Opt-out of any communications</li>
            </ul>
            <p>
              To exercise these rights, please contact us using the information below.
            </p>
          </div>
          
          <div className="privacy-section">
            <h2>Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy or how we handle your information, 
              please contact us:
            </p>
            <ul>
              <li>Email: paradoxlabs.tech@gmail.com</li>
              <li>Through our <a href="/contact">contact form</a></li>
            </ul>
          </div>
          
          <div className="privacy-section">
            <h2>Policy Updates</h2>
            <p>
              We may update this Privacy Policy from time to time. Any changes will be posted on this page 
              with an updated effective date. We encourage you to review this policy periodically.
            </p>
            <p>
              <strong>Last updated:</strong> {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPolicy;