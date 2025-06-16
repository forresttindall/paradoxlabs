import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './OrderConfirmation.css';

// Debug utility for order confirmation operations
const debugOrderConfirmation = {
  log: (action, data) => {
    console.group(`✅ ORDER CONFIRMATION DEBUG: ${action}`);
    console.log('Timestamp:', new Date().toISOString());
    console.log('Data:', data);
    console.groupEnd();
  },
  error: (action, error) => {
    console.group(`❌ ORDER CONFIRMATION ERROR: ${action}`);
    console.error('Timestamp:', new Date().toISOString());
    console.error('Error:', error);
    console.groupEnd();
  },
  orderData: (orderDetails) => {
    console.group('📋 ORDER DATA');
    console.log('Order details:', {
      orderNumber: orderDetails?.orderNumber,
      orderDate: orderDetails?.orderDate,
      email: orderDetails?.email ? '***@***.***' : 'missing',
      itemCount: orderDetails?.items?.length,
      total: orderDetails?.total,
      hasShippingAddress: !!orderDetails?.shippingAddress
    });
    console.groupEnd();
  }
};

const OrderConfirmation = () => {
  const location = useLocation();
  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    debugOrderConfirmation.log('ORDER_CONFIRMATION_PAGE_LOADED', {
      hasLocationState: !!location.state,
      hasOrderDetails: !!(location.state && location.state.orderDetails),
      pathname: location.pathname,
      search: location.search
    });
    
    window.scrollTo(0, 0);
    
    // Get order details from navigation state
    if (location.state && location.state.orderDetails) {
      debugOrderConfirmation.log('ORDER_DETAILS_FOUND', 'Order details retrieved from navigation state');
      setOrderDetails(location.state.orderDetails);
      debugOrderConfirmation.orderData(location.state.orderDetails);
    } else {
      debugOrderConfirmation.error('NO_ORDER_DETAILS', 'No order details found in navigation state');
    }
  }, [location]);
  
  // Debug state changes
  useEffect(() => {
    if (orderDetails) {
      debugOrderConfirmation.log('ORDER_DETAILS_SET', {
        orderNumber: orderDetails.orderNumber,
        itemCount: orderDetails.items?.length,
        total: orderDetails.total
      });
    }
  }, [orderDetails]);

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
                <p>You'll receive an order confirmation email shortly with all the details.</p>
              </div>
              <div className="step">
                <div className="step-icon">📦</div>
                <h3>Processing</h3>
                <p>Your order will be processed and shipped within 1-2 business days.</p>
              </div>
              <div className="step">
                <div className="step-icon">🚚</div>
                <h3>Shipping</h3>
                <p>You'll receive tracking information once your order ships.</p>
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