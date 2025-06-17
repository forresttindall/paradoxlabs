import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './OrderConfirmation.css';



const OrderConfirmation = () => {
  const location = useLocation();
  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Get order details from navigation state
    if (location.state && location.state.orderDetails) {
      setOrderDetails(location.state.orderDetails);
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
                <div className="step-icon">📧</div>
                <h3>Confirmation Email</h3>
                <p>A confirmation email has been sent to <strong>{orderDetails.email}</strong> with your order details and receipt.</p>
              </div>
              <div className="step">
                <div className="step-icon">📦</div>
                <h3>Order Processing</h3>
                <p>Your order is being prepared and will be processed within 1-2 business days. You'll receive updates via email.</p>
              </div>
              <div className="step">
                <div className="step-icon">🚚</div>
                <h3>Shipping & Tracking</h3>
                <p>Once your order ships, you'll receive tracking information to monitor your package's progress.</p>
              </div>
              <div className="step">
                <div className="step-icon">💬</div>
                <h3>Customer Support</h3>
                <p>Questions about your order? Contact us anytime - we're here to help!</p>
              </div>
            </div>
            
            <div className="important-notice">
              <div className="notice-icon">ℹ️</div>
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