import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Elements, useStripe, useElements } from '@stripe/react-stripe-js';
import { CartContext } from './CartContext';
import { createPaymentIntent, calculateOrderTotal, formatCurrency, getStripe } from './api/stripeService';
import './Checkout.css';

import './OrderConfirmation.css';



// Card element styling
const cardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#e5e5e5',
      backgroundColor: '#141618',
      '::placeholder': {
        color: '#a1a1aa',
      },
    },
    invalid: {
      color: '#ff6b6b',
      iconColor: '#ff6b6b',
    },
  },
  hidePostalCode: false,
};

// Main checkout form component
const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const { cartItems, clearCart } = useContext(CartContext);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [showError, setShowError] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [orderTotal, setOrderTotal] = useState(null);
  

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  

  
  // Form state
  const [formData, setFormData] = useState({
    // Billing Information
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    
    // Billing Address
    billingAddress: '',
    billingCity: '',
    billingState: '',
    billingZip: '',
    billingCountry: 'US',
    
    // Shipping Information
    sameAsShipping: true,
    shippingFirstName: '',
    shippingLastName: '',
    shippingAddress: '',
    shippingCity: '',
    shippingState: '',
    shippingZip: '',
    shippingCountry: 'US',
    
    // Credit Card Information
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    
    // Additional Options
    savePaymentMethod: false,
    marketingEmails: false,
  });

  // Calculate order total on component mount
  useEffect(() => {
    if (cartItems.length > 0) {
      const total = calculateOrderTotal(cartItems);
      setOrderTotal(total);
    }
  }, [cartItems]);

  // Redirect if cart is empty
  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/cart');
    }
  }, [cartItems, navigate]);

  // Create payment intent when email is provided
  useEffect(() => {
    if (cartItems.length > 0 && formData.email && formData.email.includes('@')) {
      createPaymentIntentOnServer();
    }
  }, [cartItems, orderTotal, formData.email]);

  const createPaymentIntentOnServer = async () => {
    try {
      setIsProcessing(true);
      
      // Only create payment intent if we have sufficient billing information
      // when "same as billing" is checked
      if (formData.sameAsShipping) {
        if (!formData.billingAddress || !formData.billingCity || !formData.billingState || !formData.billingZip || !formData.firstName || !formData.lastName) {
          // Don't create payment intent yet if required billing fields are missing
          setIsProcessing(false);
          return;
        }
      }
      
      const shippingInfo = {
        name: formData.sameAsShipping 
          ? `${formData.firstName} ${formData.lastName}`.trim()
          : `${formData.shippingFirstName} ${formData.shippingLastName}`.trim(),
        address: {
          line1: formData.sameAsShipping ? formData.billingAddress : formData.shippingAddress,
          city: formData.sameAsShipping ? formData.billingCity : formData.shippingCity,
          state: formData.sameAsShipping ? formData.billingState : formData.shippingState,
          postal_code: formData.sameAsShipping ? formData.billingZip : formData.shippingZip,
          country: formData.sameAsShipping ? formData.billingCountry : formData.shippingCountry,
        }
      };

      const customerInfo = {
        email: formData.email,
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        phone: formData.phone,
      };
      
      const response = await createPaymentIntent(cartItems, shippingInfo, customerInfo);
      
      setClientSecret(response.client_secret);
      
    } catch (error) {
      console.error('Error creating payment intent:', error);
      setError('Failed to initialize payment. Please try again.');
      // Only show error if user has interacted with the form
      if (hasUserInteracted) {
        setShowError(true);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Format credit card number with spaces
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  // Format expiry date as MM/YY
  const formatExpiryDate = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + (v.length > 2 ? '/' + v.substring(2, 4) : '');
    }
    return v;
  };

  // Format CVV (numbers only)
  const formatCVV = (value) => {
    return value.replace(/[^0-9]/gi, '');
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newValue = type === 'checkbox' ? checked : value;
    
    // Apply formatting for credit card fields
    if (name === 'cardNumber') {
      newValue = formatCardNumber(value);
    } else if (name === 'expiryDate') {
      newValue = formatExpiryDate(value);
    } else if (name === 'cvv') {
      newValue = formatCVV(value);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    // Mark that user has interacted with the form
    setHasUserInteracted(true);

    if (!stripe || !elements) {
      const errorMsg = 'Stripe has not loaded yet. Please try again.';
      setError(errorMsg);
      setShowError(true);
      return;
    }

    if (!clientSecret) {
      const errorMsg = 'Payment setup incomplete. Please refresh and try again.';
      setError(errorMsg);
      setShowError(true);
      return;
    }

    setIsProcessing(true);
    setError(null);
    setShowError(false);

    // Validate required fields
    if (!formData.email || !formData.email.includes('@')) {
      setError('Please enter a valid email address.');
      setShowError(true);
      setIsProcessing(false);
      return;
    }
    
    if (!formData.firstName || !formData.lastName) {
      setError('Please enter your first and last name.');
      setShowError(true);
      setIsProcessing(false);
      return;
    }
    
    if (!formData.billingAddress || !formData.billingCity || !formData.billingState || !formData.billingZip) {
      setError('Please complete all billing address fields.');
      setShowError(true);
      setIsProcessing(false);
      return;
    }
    
    // Validate credit card fields
    if (!formData.cardNumber || !formData.expiryDate || !formData.cvv) {
      setError('Please complete all credit card fields.');
      setShowError(true);
      setIsProcessing(false);
      return;
    }
    
    const billingDetails = {
      name: `${formData.firstName} ${formData.lastName}`,
      email: formData.email,
      phone: formData.phone,
      address: {
        line1: formData.billingAddress,
        city: formData.billingCity,
        state: formData.billingState,
        postal_code: formData.billingZip,
        country: formData.billingCountry,
      },
    };
    
    const shippingDetails = {
      name: formData.sameAsShipping 
        ? `${formData.firstName} ${formData.lastName}`
        : `${formData.shippingFirstName} ${formData.shippingLastName}`,
      address: {
        line1: formData.sameAsShipping ? formData.billingAddress : formData.shippingAddress,
        city: formData.sameAsShipping ? formData.billingCity : formData.shippingCity,
        state: formData.sameAsShipping ? formData.billingState : formData.shippingState,
        postal_code: formData.sameAsShipping ? formData.billingZip : formData.shippingZip,
        country: formData.sameAsShipping ? formData.billingCountry : formData.shippingCountry,
      },
    };
    


    try {
      // Create payment method with card details
      const { error: paymentMethodError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: {
          number: formData.cardNumber.replace(/\s/g, ''),
          exp_month: parseInt(formData.expiryDate.split('/')[0]),
          exp_year: parseInt('20' + formData.expiryDate.split('/')[1]),
          cvc: formData.cvv,
        },
        billing_details: billingDetails,
      });
      
      if (paymentMethodError) {
        setError(paymentMethodError.message);
        setShowError(true);
        setIsProcessing(false);
        return;
      }
      
      // Confirm payment with Stripe
      
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: paymentMethod.id,
        shipping: shippingDetails,
      });
      


      if (stripeError) {
        setError(stripeError.message);
        setShowError(true);
        setIsProcessing(false);
      } else if (paymentIntent.status === 'succeeded') {
        // Payment succeeded
        clearCart();
        
        const orderDetails = {
          orderNumber: paymentIntent.id,
          orderDate: new Date(),
          email: formData.email,
          items: cartItems,
          subtotal: orderTotal.subtotal,
          shipping: orderTotal.shipping,
          tax: orderTotal.tax,
          total: orderTotal.total,
          paymentMethod: {
            last4: '****', // You can get this from the payment method if needed
          },
          shippingAddress: {
            firstName: formData.sameAsShipping ? formData.firstName : formData.shippingFirstName,
            lastName: formData.sameAsShipping ? formData.lastName : formData.shippingLastName,
            address: formData.sameAsShipping ? formData.billingAddress : formData.shippingAddress,
            city: formData.sameAsShipping ? formData.billingCity : formData.shippingCity,
            state: formData.sameAsShipping ? formData.billingState : formData.shippingState,
            zipCode: formData.sameAsShipping ? formData.billingZip : formData.shippingZip,
            country: formData.sameAsShipping ? formData.billingCountry : formData.shippingCountry,
          },
        };
        
        // Navigate to success page with order details
        navigate('/order-confirmation', {
          state: {
            orderDetails: orderDetails,
          },
        });
      }
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
      setShowError(true);
      setIsProcessing(false);
    }
  };

  if (!orderTotal) {
    return (
      <div className="checkout-page">
        <div className="container">
          <div className="loading">Loading checkout...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="container">
        <div className="breadcrumb">
          <Link to="/">Home</Link>
          <span> / </span>
          <Link to="/cart">Cart</Link>
          <span> / </span>
          <span>Checkout</span>
        </div>

        <h1 className="checkout-title">Checkout</h1>

        <div className="checkout-content">
          <form onSubmit={handleSubmit} className="checkout-form">
            {/* Contact Information */}
            <div className="form-section">
              <h2>Contact Information</h2>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    autoComplete="email"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    autoComplete="tel"
                  />
                </div>
              </div>
            </div>

            {/* Billing Information */}
            <div className="form-section">
              <h2>Billing Information</h2>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">First Name *</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    autoComplete="given-name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="lastName">Last Name *</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    autoComplete="family-name"
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="billingAddress">Address *</label>
                <input
                  type="text"
                  id="billingAddress"
                  name="billingAddress"
                  value={formData.billingAddress}
                  onChange={handleInputChange}
                  autoComplete="billing street-address"
                  required
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="billingCity">City *</label>
                  <input
                    type="text"
                    id="billingCity"
                    name="billingCity"
                    value={formData.billingCity}
                    onChange={handleInputChange}
                    autoComplete="billing address-level2"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="billingState">State *</label>
                  <input
                    type="text"
                    id="billingState"
                    name="billingState"
                    value={formData.billingState}
                    onChange={handleInputChange}
                    autoComplete="billing address-level1"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="billingZip">ZIP Code *</label>
                  <input
                    type="text"
                    id="billingZip"
                    name="billingZip"
                    value={formData.billingZip}
                    onChange={handleInputChange}
                    autoComplete="billing postal-code"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Shipping Information */}
            <div className="form-section">
              <h2>Shipping Information</h2>
              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="sameAsShipping"
                    checked={formData.sameAsShipping}
                    onChange={handleInputChange}
                  />
                  <span className="checkmark"></span>
                  Same as billing address
                </label>
              </div>
              
              {!formData.sameAsShipping && (
                <>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="shippingFirstName">First Name *</label>
                      <input
                        type="text"
                        id="shippingFirstName"
                        name="shippingFirstName"
                        value={formData.shippingFirstName}
                        onChange={handleInputChange}
                        autoComplete="shipping given-name"
                        required={!formData.sameAsShipping}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="shippingLastName">Last Name *</label>
                      <input
                        type="text"
                        id="shippingLastName"
                        name="shippingLastName"
                        value={formData.shippingLastName}
                        onChange={handleInputChange}
                        autoComplete="shipping family-name"
                        required={!formData.sameAsShipping}
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="shippingAddress">Address *</label>
                    <input
                      type="text"
                      id="shippingAddress"
                      name="shippingAddress"
                      value={formData.shippingAddress}
                      onChange={handleInputChange}
                      autoComplete="shipping street-address"
                      required={!formData.sameAsShipping}
                    />
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="shippingCity">City *</label>
                      <input
                        type="text"
                        id="shippingCity"
                        name="shippingCity"
                        value={formData.shippingCity}
                        onChange={handleInputChange}
                        autoComplete="shipping address-level2"
                        required={!formData.sameAsShipping}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="shippingState">State *</label>
                      <input
                        type="text"
                        id="shippingState"
                        name="shippingState"
                        value={formData.shippingState}
                        onChange={handleInputChange}
                        autoComplete="shipping address-level1"
                        required={!formData.sameAsShipping}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="shippingZip">ZIP Code *</label>
                      <input
                        type="text"
                        id="shippingZip"
                        name="shippingZip"
                        value={formData.shippingZip}
                        onChange={handleInputChange}
                        autoComplete="shipping postal-code"
                        required={!formData.sameAsShipping}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Payment Information */}
            <div className="form-section">
              <h2>Payment Information</h2>
              <div className="form-group">
                <label htmlFor="cardholderName">Cardholder Name *</label>
                <input
                  type="text"
                  id="cardholderName"
                  name="cardholderName"
                  value={formData.cardholderName}
                  onChange={handleInputChange}
                  autoComplete="cc-name"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="cardNumber">Card Number *</label>
                <input
                  type="text"
                  id="cardNumber"
                  name="cardNumber"
                  value={formData.cardNumber}
                  onChange={handleInputChange}
                  autoComplete="cc-number"
                  placeholder="1234 5678 9012 3456"
                  maxLength="19"
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="expiryDate">Expiry Date *</label>
                  <input
                    type="text"
                    id="expiryDate"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                    autoComplete="cc-exp"
                    placeholder="MM/YY"
                    maxLength="5"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="cvv">CVV *</label>
                  <input
                    type="text"
                    id="cvv"
                    name="cvv"
                    value={formData.cvv}
                    onChange={handleInputChange}
                    autoComplete="cc-csc"
                    placeholder="123"
                    maxLength="4"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className={`error-message ${showError ? 'show' : ''}`}>
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="btn checkout-submit-btn"
              disabled={!stripe || isProcessing}
            >
              {isProcessing ? 'Processing...' : `Pay ${formatCurrency(orderTotal.total)}`}
            </button>
          </form>

          {/* Order Summary */}
          <div className="order-summary">
            <h3>Order Summary</h3>
            
            <div className="checkout-order-items">
              {cartItems.map((item) => (
                <div key={item.id} className="checkout-order-item">
                  <div className="checkout-item-image">
                    <img src={item.image} alt={item.name} />
                  </div>
                  <div className="checkout-item-details">
                    <h4>{item.name}</h4>
                    <p>Qty: {item.quantity}</p>
                  </div>
                  <div className="checkout-item-price">
                    {formatCurrency(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="order-totals">
              <div className="total-row">
                <span>Subtotal:</span>
                <span>{formatCurrency(orderTotal.subtotal)}</span>
              </div>
              <div className="total-row">
                <span>Shipping:</span>
                <span>{formatCurrency(orderTotal.shipping)}</span>
              </div>
              {orderTotal.tax > 0 && (
                <div className="total-row">
                  <span>Tax:</span>
                  <span>{formatCurrency(orderTotal.tax)}</span>
                </div>
              )}
              <div className="total-row final-total">
                <span>Total:</span>
                <span>{formatCurrency(orderTotal.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Checkout component with Stripe Elements provider
const Checkout = () => {
  const stripePromise = getStripe();

  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
};

export default Checkout;