import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './OrderConfirmation.css';



const OrderConfirmation = () => {
  const location = useLocation();
  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    console.log('OrderConfirmation mounted');
    console.log('Location state:', location.state);
    console.log('Full location object:', location);
    
    // Get order details from navigation state
    if (location.state && location.state.orderDetails) {
      console.log('Order details found:', location.state.orderDetails);
      setOrderDetails(location.state.orderDetails);
    } else {
      console.log('No order details found in location state');
      console.log('Location.state exists:', !!location.state);
      if (location.state) {
        console.log('Available keys in location.state:', Object.keys(location.state));
      }
    }
  }, [location]);
  


  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  if (!orderDetails) {
    return (
      <div className="order-confirmation-page">
        <div className="container">
          <div className="confirmation-content">
            <div className="error-state">
              <h1>Order Not Found</h1>
              <p>We couldn't find your order details. Please check your email for confirmation or contact support.</p>
              <Link to="/shop" className="continue-shopping-btn">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="order-confirmation-page">
      <div className="container">
        <div className="confirmation-content">
          {/* Success Header */}
          <div className="success-header">
            <div className="success-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
                <path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h1>Order Confirmed!</h1>
            <p>Thank you for your purchase. Your order has been successfully processed.</p>
          </div>

          {/* Order Details */}
          <div className="order-details-section">
            <div className="order-info">
              <h2>Order Information</h2>
              <div className="info-grid">
                <div className="info-item">
                  <span className="label">Order Number:</span>
                  <span className="value">#{orderDetails.orderNumber || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <span className="label">Order Date:</span>
                  <span className="value">{formatDate(orderDetails.orderDate || new Date())}</span>
                </div>
                <div className="info-item">
                  <span className="label">Payment Method:</span>
                  <span className="value">**** **** **** {orderDetails.paymentMethod?.last4 || 'N/A'}</span>
                </div>
                <div className="info-item">
                  <span className="label">Email:</span>
                  <span className="value">{orderDetails.email || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Shipping Information */}
            {orderDetails.shippingAddress && (
              <div className="shipping-info">
                <h2>Shipping Address</h2>
                <div className="address">
                  <p>{orderDetails.shippingAddress.firstName} {orderDetails.shippingAddress.lastName}</p>
                  <p>{orderDetails.shippingAddress.address}</p>
                  {orderDetails.shippingAddress.apartment && (
                    <p>{orderDetails.shippingAddress.apartment}</p>
                  )}
                  <p>{orderDetails.shippingAddress.city}, {orderDetails.shippingAddress.state} {orderDetails.shippingAddress.zipCode}</p>
                  <p>{orderDetails.shippingAddress.country}</p>
                </div>
              </div>
            )}
          </div>

          {/* Order Items */}
          <div className="order-items-section">
            <h2>Order Items</h2>
            <div className="items-list">
              {orderDetails.items && orderDetails.items.map((item, index) => (
                <div key={index} className="order-item">
                  <div className="item-image">
                    <img src={item.image} alt={item.name} />
                  </div>
                  <div className="item-details">
                    <h3>{item.name}</h3>
                    <p className="item-description">{item.description}</p>
                    <div className="item-meta">
                      <span className="quantity">Qty: {item.quantity}</span>
                      <span className="price">{formatCurrency(item.price)}</span>
                    </div>
                  </div>
                  <div className="item-total">
                    {formatCurrency(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="order-summary-section">
            <h2>Order Summary</h2>
            <div className="summary-details">
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>{formatCurrency(orderDetails.subtotal || 0)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping:</span>
                <span>{formatCurrency(orderDetails.shipping || 0)}</span>
              </div>
              <div className="summary-row">
                <span>Tax:</span>
                <span>{formatCurrency(orderDetails.tax || 0)}</span>
              </div>
              <div className="summary-row total">
                <span>Total:</span>
                <span>{formatCurrency(orderDetails.total || 0)}</span>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="next-steps">
            <h2>What's Next?</h2>
            <div className="steps-grid">
              <div className="step">
                <div className="step-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="var(--accent)" strokeWidth="2" fill="none"/>
                    <polyline points="22,6 12,13 2,6" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3>Confirmation Email</h3>
                <p>A confirmation email has been sent to <strong>{orderDetails.email}</strong> with your order details and receipt.</p>
              </div>
              <div className="step">
                <div className="step-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" stroke="var(--accent)" strokeWidth="2" fill="none"/>
                    <polyline points="3.27,6.96 12,12.01 20.73,6.96" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="12" y1="22.08" x2="12" y2="12" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <h3>Order Processing</h3>
                <p>Your order is being prepared and will be processed within 1-2 business days. You'll receive updates via email.</p>
              </div>
              <div className="step">
                <div className="step-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="1" y="3" width="15" height="13" rx="2" ry="2" stroke="var(--accent)" strokeWidth="2" fill="none"/>
                    <path d="m16 8 1.5-1.5c.8-.8 2.1-.8 2.8 0s.8 2.1 0 2.8L18.8 11" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="5.5" cy="10.5" r="2.5" stroke="var(--accent)" strokeWidth="2" fill="none"/>
                    <path d="M16 16h6" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M19 13v6" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <h3>Shipping & Tracking</h3>
                <p>Once your order ships, you'll receive tracking information to monitor your package's progress.</p>
              </div>
              <div className="step">
                <div className="step-icon">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="var(--accent)" strokeWidth="2" fill="none"/>
                    <path d="M8 9h8" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M8 13h6" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
                <h3>Customer Support</h3>
                <p>Questions about your order? Contact us anytime - we're here to help!</p>
              </div>
            </div>
            
            <div className="important-notice">
              <div className="notice-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="var(--accent)" strokeWidth="2" fill="none"/>
                  <path d="M12 16v-4" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M12 8h.01" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="notice-content">
                <h4>Important Information</h4>
                <ul>
                  <li>Please save this order number for your records: <strong>#{orderDetails.orderNumber}</strong></li>
                  <li>Check your email (including spam folder) for the confirmation receipt</li>
                  <li>Processing times may vary during peak seasons</li>
                  <li>You can contact customer support with any questions about your order</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <Link to="/shop" className="continue-shopping-btn">
              Continue Shopping
            </Link>
            <button 
              className="print-order-btn"
              onClick={() => window.print()}
            >
              Print Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;