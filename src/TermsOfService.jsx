import { useEffect } from 'react';
import './TermsOfService.css';

function TermsOfService() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <div className="terms-page">
      <div className="container">
        <div className="terms-header">
          <h1>Terms of Service</h1>
          <p>Please read these terms carefully before using our services or purchasing our products.</p>
        </div>
        
        <div className="terms-content">
          <div className="terms-section">
            <h2>Acceptance of Terms</h2>
            <p>
              By accessing our website, placing an order, or using any of our products, you agree to be bound by these Terms of Service. 
              If you do not agree to these terms, you must not use our website or purchase our products.
            </p>
          </div>
          
          <div className="terms-section">
            <h2>Product Information and Intended Use</h2>
            <p>
              Paradox Labs specializes in cybersecurity tools, tactical equipment, and specialized technology products. 
              All products are sold for:
            </p>
            <ul>
              <li>Educational and research purposes</li>
              <li>Authorized security testing and penetration testing</li>
              <li>Legitimate cybersecurity and tactical applications</li>
              <li>Professional use by qualified individuals</li>
            </ul>
            <p>
              <strong>You are solely responsible for ensuring your use of our products complies with all applicable laws and regulations in your jurisdiction.</strong>
            </p>
          </div>
          
          <div className="terms-section">
            <h2>Communication Response Times</h2>
            <p>
              We strive to provide excellent customer service within reasonable timeframes:
            </p>
            <ul>
              <li>Email inquiries: Up to 3 business days for response</li>
              <li>Support requests: Up to 3 business days for initial response</li>
              <li>Order-related questions: Up to 3 business days for response</li>
            </ul>
            <p>
              Response times may be longer during holidays, weekends, or periods of high volume.
            </p>
          </div>
          
          <div className="terms-section">
            <h2>Shipping and Delivery</h2>
            <p>
              Order processing and shipping terms:
            </p>
            <ul>
              <li>Orders are processed within 1-7 business days</li>
              <li>Shipping times vary by location and method selected</li>
              <li>Delivery delays due to carrier issues, customs, or force majeure events are beyond our control</li>
              <li>Risk of loss transfers to you upon delivery to the carrier</li>
            </ul>
            <p>
              We are not responsible for delays, damage, or loss during shipping once the package leaves our facility.
            </p>
          </div>
          
          <div className="terms-section">
            <h2>Sales Policy - No Returns or Refunds</h2>
            <p>
              <strong>ALL SALES ARE FINAL.</strong> Due to the specialized nature of our products:
            </p>
            <ul>
              <li>No refunds will be provided for any reason</li>
              <li>No returns or exchanges are accepted</li>
              <li>No cancellations after order confirmation</li>
              <li>Products cannot be returned due to buyer's remorse, compatibility issues, or change of mind</li>
            </ul>
            <p>
              Please carefully review product specifications and compatibility before purchasing. 
              We recommend contacting us with questions before placing your order.
            </p>
          </div>
          
          <div className="terms-section">
            <h2>Limitation of Liability and Disclaimers</h2>
            <p>
              <strong>IMPORTANT:</strong> By purchasing our products, you acknowledge and agree that:
            </p>
            <ul>
              <li>Paradox Labs cannot and will not be held liable for any civil or criminal misuse of our products</li>
              <li>You are solely responsible for compliance with all applicable laws and regulations</li>
              <li>Products are provided "AS IS" without warranties of any kind</li>
              <li>We disclaim all warranties, express or implied, including merchantability and fitness for a particular purpose</li>
              <li>Our total liability shall not exceed the purchase price of the product</li>
            </ul>
            <p>
              <strong>You agree to indemnify and hold harmless Paradox Labs from any claims, damages, or legal actions arising from your use or misuse of our products.</strong>
            </p>
          </div>
          
          <div className="terms-section">
            <h2>Prohibited Uses</h2>
            <p>
              You agree NOT to use our products for:
            </p>
            <ul>
              <li>Any illegal activities or purposes</li>
              <li>Unauthorized access to computer systems or networks</li>
              <li>Harassment, stalking, or invasion of privacy</li>
              <li>Any activity that violates local, state, federal, or international laws</li>
              <li>Resale without proper authorization and compliance with applicable laws</li>
            </ul>
            <p>
              Violation of these terms may result in immediate termination of service and legal action.
            </p>
          </div>
          
          <div className="terms-section">
            <h2>Age and Legal Capacity</h2>
            <p>
              You must be at least 18 years old and have the legal capacity to enter into contracts to purchase our products. 
              By placing an order, you represent that you meet these requirements.
            </p>
          </div>
          
          <div className="terms-section">
            <h2>Export Controls and International Sales</h2>
            <p>
              Some products may be subject to export controls or restrictions. You are responsible for:
            </p>
            <ul>
              <li>Compliance with all export control laws and regulations</li>
              <li>Obtaining any required licenses or permits</li>
              <li>Understanding import restrictions in your country</li>
              <li>Payment of any customs duties, taxes, or fees</li>
            </ul>
          </div>
          
          <div className="terms-section">
            <h2>Intellectual Property</h2>
            <p>
              All content on this website, including text, graphics, logos, and software, is the property of Paradox Labs 
              and is protected by copyright and other intellectual property laws. You may not reproduce, distribute, or 
              create derivative works without our express written permission.
            </p>
          </div>
          
          <div className="terms-section">
            <h2>Privacy and Data Collection</h2>
            <p>
              Your privacy is important to us. Please review our <a href="/privacy-policy">Privacy Policy</a> to understand 
              how we collect, use, and protect your information.
            </p>
          </div>
          
          <div className="terms-section">
            <h2>Modification of Terms</h2>
            <p>
              We reserve the right to modify these Terms of Service at any time without prior notice. 
              Changes will be effective immediately upon posting. Your continued use of our website or products 
              constitutes acceptance of any modifications.
            </p>
          </div>
          
          <div className="terms-section">
            <h2>Governing Law and Jurisdiction</h2>
            <p>
              These Terms of Service are governed by the laws of [Your State/Country]. Any disputes arising from 
              these terms or your use of our products shall be resolved in the courts of [Your Jurisdiction]. 
              You consent to the exclusive jurisdiction of these courts.
            </p>
          </div>
          
          <div className="terms-section">
            <h2>Severability</h2>
            <p>
              If any provision of these Terms of Service is found to be unenforceable, the remaining provisions 
              shall remain in full force and effect.
            </p>
          </div>
          
          <div className="terms-section">
            <h2>Contact Information</h2>
            <p>
              If you have questions about these Terms of Service, please contact us:
            </p>
            <ul>
              <li>Email: paradoxlabs.tech@com</li>
              <li>Through our <a href="/contact">contact form</a></li>
            </ul>
          </div>
          
          <div className="terms-section">
            <h2>Effective Date</h2>
            <p>
              These Terms of Service are effective as of {new Date().toLocaleDateString()} and supersede all 
              previous versions.
            </p>
            <p>
              <strong>By purchasing our products or using our website, you acknowledge that you have read, 
              understood, and agree to be bound by these Terms of Service.</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TermsOfService;