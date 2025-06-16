import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Elements, useStripe, useElements } from '@stripe/react-stripe-js';
import { CartContext } from './CartContext';
import { createPaymentIntent, calculateOrderTotal, formatCurrency, getStripe } from './api/stripeService';
import './Checkout.css';

import './OrderConfirmation.css';

// Debug utility for checkout operations
const debugCheckout = {
  log: (action, data) => {
    console.group(`🛍️ CHECKOUT DEBUG: ${action}`);
    console.log('Timestamp:', new Date().toISOString());
    console.log('Data:', data);
    console.groupEnd();
  },
  error: (action, error) => {
    console.group(`❌ CHECKOUT ERROR: ${action}`);
    console.error('Timestamp:', new Date().toISOString());
    console.error('Error:', error);
    console.groupEnd();
  },
  formState: (formData) => {
    console.group('📝 FORM STATE');
    console.log('Form data:', {
      ...formData,
      // Don't log sensitive data in production
      email: formData.email ? '***@***.***' : '',
      phone: formData.phone ? '***-***-****' : ''
    });
    console.groupEnd();
  },
  payment: (action, data) => {
    console.group(`💳 PAYMENT: ${action}`);
    console.log('Timestamp:', new Date().toISOString());
    console.log('Data:', data);
    console.groupEnd();
  }
};

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
  
  // Debug component initialization
  useEffect(() => {
    debugCheckout.log('CHECKOUT_COMPONENT_INITIALIZED', {
      hasStripe: !!stripe,
      hasElements: !!elements,
      cartItemCount: cartItems.length,
      cartItems: cartItems
    });
  }, [stripe, elements, cartItems]);
  
  // Debug state changes
  useEffect(() => {
    debugCheckout.log('CHECKOUT_STATE_CHANGE', {
      isProcessing,
      hasError: !!error,
      errorMessage: error,
      hasClientSecret: !!clientSecret,
      hasOrderTotal: !!orderTotal
    });
  }, [isProcessing, error, clientSecret, orderTotal]);
  
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

  // Create payment intent when component mounts
  useEffect(() => {
    if (cartItems.length > 0) {
      createPaymentIntentOnServer();
    }
  }, [cartItems, orderTotal]);

  const createPaymentIntentOnServer = async () => {
    debugCheckout.payment('CREATE_PAYMENT_INTENT_STARTED', {
      cartItemCount: cartItems.length,
      hasFormData: !!formData,
      hasEmail: !!formData.email,
      hasName: !!(formData.firstName && formData.lastName)
    });
    
    try {
      setIsProcessing(true);
      debugCheckout.log('SETTING_PROCESSING_STATE', { isProcessing: true });
      
      const shippingInfo = {
        address: formData.sameAsShipping ? formData.billingAddress : formData.shippingAddress,
        city: formData.sameAsShipping ? formData.billingCity : formData.shippingCity,
        state: formData.sameAsShipping ? formData.billingState : formData.shippingState,
        zip: formData.sameAsShipping ? formData.billingZip : formData.shippingZip,
        country: formData.sameAsShipping ? formData.billingCountry : formData.shippingCountry,
      };

      const customerInfo = {
        email: formData.email,
        name: `${formData.firstName} ${formData.lastName}`,
        phone: formData.phone,
      };
      
      debugCheckout.payment('PAYMENT_INTENT_DATA_PREPARED', {
        shippingInfo: shippingInfo,
        customerInfo: {
          ...customerInfo,
          email: '***@***.***',
          phone: '***-***-****'
        },
        cartItems: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price
        }))
      });

      const response = await createPaymentIntent(cartItems, shippingInfo, customerInfo);
      
      debugCheckout.payment('PAYMENT_INTENT_RESPONSE_RECEIVED', {
        hasClientSecret: !!response.clientSecret,
        hasOrderTotal: !!response.order_total
      });
      
      setClientSecret(response.client_secret);
      debugCheckout.payment('CLIENT_SECRET_SET', { clientSecretLength: response.client_secret?.length });
      
    } catch (error) {
      debugCheckout.error('CREATE_PAYMENT_INTENT_ERROR', error);
      console.error('Error creating payment intent:', error);
      setError('Failed to initialize payment. Please try again.');
      // Only show error if user has interacted with the form
      if (hasUserInteracted) {
        setShowError(true);
      }
    } finally {
      setIsProcessing(false);
      debugCheckout.log('SETTING_PROCESSING_STATE', { isProcessing: false });
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
    
    debugCheckout.log('FORM_INPUT_CHANGE', {
      fieldName: name,
      fieldType: type,
      newValue: name.includes('email') || name.includes('phone') || name.includes('card') ? '***' : newValue,
      isCheckbox: type === 'checkbox'
    });
    
    setFormData(prev => {
      const updatedFormData = {
        ...prev,
        [name]: newValue
      };
      
      debugCheckout.formState(updatedFormData);
      return updatedFormData;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    // Mark that user has interacted with the form
    setHasUserInteracted(true);
    
    debugCheckout.payment('FORM_SUBMIT_INITIATED', {
      hasStripe: !!stripe,
      hasElements: !!elements,
      hasClientSecret: !!clientSecret,
      isProcessing: isProcessing
    });

    if (!stripe || !elements) {
      const errorMsg = 'Stripe has not loaded yet. Please try again.';
      debugCheckout.error('STRIPE_NOT_LOADED', errorMsg);
      setError(errorMsg);
      setShowError(true);
      return;
    }

    if (!clientSecret) {
      const errorMsg = 'Payment setup incomplete. Please refresh and try again.';
      debugCheckout.error('NO_CLIENT_SECRET', errorMsg);
      setError(errorMsg);
      setShowError(true);
      return;
    }

    setIsProcessing(true);
    setError(null);
    setShowError(false);
    debugCheckout.payment('PAYMENT_PROCESSING_STARTED', { clientSecretLength: clientSecret.length });

    // Validate credit card fields
    if (!formData.cardNumber || !formData.expiryDate || !formData.cvv) {
      debugCheckout.error('CARD_FIELDS_INCOMPLETE', 'Credit card information is incomplete');
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
    
    debugCheckout.payment('PAYMENT_DETAILS_PREPARED', {
      hasBillingDetails: !!billingDetails,
      hasShippingDetails: !!shippingDetails,
      sameAsShipping: formData.sameAsShipping,
      billingName: billingDetails.name,
      shippingName: shippingDetails.name
    });

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
        debugCheckout.error('PAYMENT_METHOD_ERROR', paymentMethodError);
        setError(paymentMethodError.message);
        setShowError(true);
        setIsProcessing(false);
        return;
      }
      
      // Confirm payment with Stripe
      debugCheckout.payment('CONFIRMING_CARD_PAYMENT', 'Starting Stripe payment confirmation');
      
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: paymentMethod.id,
        shipping: shippingDetails,
      });
      
      debugCheckout.payment('STRIPE_PAYMENT_RESPONSE', {
        hasError: !!stripeError,
        errorType: stripeError?.type,
        errorCode: stripeError?.code,
        errorMessage: stripeError?.message,
        paymentIntentStatus: paymentIntent?.status,
        paymentIntentId: paymentIntent?.id
      });

      if (stripeError) {
        debugCheckout.error('STRIPE_PAYMENT_ERROR', stripeError);
        setError(stripeError.message);
        setShowError(true);
        setIsProcessing(false);
      } else if (paymentIntent.status === 'succeeded') {
        // Payment succeeded
        debugCheckout.payment('PAYMENT_SUCCESS', {
          paymentIntentId: paymentIntent.id,
          status: paymentIntent.status,
          amount: paymentIntent.amount
        });
        
        debugCheckout.log('CLEARING_CART', 'Payment successful, clearing cart');
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
        
        debugCheckout.log('NAVIGATING_TO_CONFIRMATION', {
          orderNumber: orderDetails.orderNumber,
          itemCount: orderDetails.items.length,
          total: orderDetails.total
        });
        
        // Navigate to success page with order details
        navigate('/order-confirmation', {
          state: {
            orderDetails: orderDetails,
          },
        });
      }
    } catch (error) {
      debugCheckout.error('PAYMENT_PROCESSING_EXCEPTION', error);
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
            
            <div className="order-items">
              {cartItems.map((item) => (
                <div key={item.id} className="order-item">
                  <div className="item-image">
                    <img src={item.image} alt={item.name} />
                  </div>
                  <div className="item-details">
                    <h4>{item.name}</h4>
                    <p>Qty: {item.quantity}</p>
                  </div>
                  <div className="item-price">
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