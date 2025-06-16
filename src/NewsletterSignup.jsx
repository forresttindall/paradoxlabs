import React, { useState } from 'react';
import './NewsletterSignup.css';

const NewsletterSignup = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');

    try {
      // Sender.net API integration
      const response = await fetch('https://api.sender.net/v2/subscribers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.REACT_APP_SENDER_API_KEY}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          firstname: formData.firstName,
          groups: [process.env.REACT_APP_SENDER_GROUP_ID || 'default']
        })
      });

      if (response.ok) {
        setIsSuccess(true);
        setMessage('Thank you for subscribing! Please check your email to confirm your subscription.');
        setFormData({ firstName: '', email: '' });
      } else {
        const errorData = await response.json();
        setMessage(errorData.message || 'Something went wrong. Please try again.');
        setIsSuccess(false);
      }
    } catch (error) {
      setMessage('Network error. Please check your connection and try again.');
      setIsSuccess(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="newsletter-signup">
      <div className="newsletter-container">
        <div className="newsletter-header">
          <h3>Stay Updated</h3>
          <p>Get the latest product updates, and exclusive offers delivered to your inbox.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="newsletter-form">
          <div className="form-group">
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>
          
          <div className="form-group">
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
              className="form-input"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="btn"
          >
            {isSubmitting ? 'Subscribing...' : 'Subscribe'}
          </button>
        </form>
        
        {message && (
          <div className={`message ${isSuccess ? 'success' : 'error'}`}>
            {message}
          </div>
        )}
        
        <div className="privacy-notice">
          <p>
            <strong>Privacy Promise:</strong> We respect your privacy and will never sell, 
            distribute, or share your personal information with third parties. 
            You can unsubscribe at any time.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NewsletterSignup;