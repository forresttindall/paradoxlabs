import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Elements, useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
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
      backgroundColor: '#1a1a1a',
      fontFamily: '"Kode Mono", monospace',
      '::placeholder': {
        color: '#888888',
      },
    },
    invalid: {
      color: '#ff6b6b',
    },
    complete: {
      color: '#7bbf00',
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

  // Create payment intent when sufficient information is provided
  useEffect(() => {
    if (cartItems.length > 0 && formData.email && formData.email.includes('@') && 
        formData.firstName && formData.lastName && formData.billingAddress && 
        formData.billingCity && formData.billingState && formData.billingZip) {
      createPaymentIntentOnServer();
    }
  }, [cartItems, orderTotal, formData.email, formData.firstName, formData.lastName, 
      formData.billingAddress, formData.billingCity, formData.billingState, formData.billingZip]);

  const createPaymentIntentOnServer = async () => {
    try {
      setIsProcessing(true);
      setError(null);
      setShowError(false);
      
      // Validate required fields before creating payment intent
      if (!formData.email || !formData.email.includes('@')) {
        throw new Error('Valid email address is required');
      }
      
      if (!formData.firstName || !formData.lastName) {
        throw new Error('First and last name are required');
      }
      
      if (!formData.billingAddress || !formData.billingCity || !formData.billingState || !formData.billingZip) {
        throw new Error('Complete billing address is required');
      }
      
      // Validate shipping information if different from billing
      if (!formData.sameAsShipping) {
        if (!formData.shippingFirstName || !formData.shippingLastName || 
            !formData.shippingAddress || !formData.shippingCity || 
            !formData.shippingState || !formData.shippingZip) {
          throw new Error('Complete shipping address is required');
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
      
      console.log('Creating payment intent with:', {
        itemCount: cartItems.length,
        customerEmail: customerInfo.email,
        shippingName: shippingInfo.name,
        orderTotal: orderTotal
      });
      
      const response = await createPaymentIntent(cartItems, shippingInfo, customerInfo);
      
      if (!response || !response.client_secret) {
        throw new Error('Invalid response from payment service');
      }
      
      setClientSecret(response.client_secret);
      console.log('Payment intent created successfully');
      
    } catch (error) {
      console.error('Error creating payment intent:', error);
      const errorMessage = error.message || 'Failed to initialize payment. Please try again.';
      setError(errorMessage);
      
      // Show error immediately if it's a validation error or if user has interacted
      if (error.message.includes('required') || hasUserInteracted) {
        setShowError(true);
      }
    } finally {
      setIsProcessing(false);
    }
  };



  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    // Clear any existing errors when user starts typing
    if (error && showError) {
      setError(null);
      setShowError(false);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
    
    // Mark that user has interacted with the form
    if (!hasUserInteracted) {
      setHasUserInteracted(true);
    }
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
      const errorMsg = 'Payment setup incomplete. Please ensure all required fields are filled and try again.';
      setError(errorMsg);
      setShowError(true);
      setIsProcessing(false);
      
      // Try to recreate payment intent if missing
      if (formData.email && formData.firstName && formData.lastName && 
          formData.billingAddress && formData.billingCity && formData.billingState && formData.billingZip) {
        console.log('Attempting to recreate payment intent...');
        createPaymentIntentOnServer();
      }
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
    
    // Get card element
    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setError('Card information is required.');
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
      // Create payment method with card element
      const { error: paymentMethodError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
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
        console.error('Stripe payment error:', stripeError);
        setError(stripeError.message);
        setShowError(true);
        setIsProcessing(false);
      } else if (paymentIntent.status === 'succeeded') {
        console.log('Payment succeeded! PaymentIntent:', paymentIntent);
        console.log('Cart items before clearing:', cartItems);
        
        // Payment succeeded - prepare order details before clearing cart
        const orderDetails = {
          orderNumber: paymentIntent.id,
          orderDate: new Date(),
          email: formData.email,
          items: cartItems.map(item => ({
            id: item.id,
            name: item.name,
            description: item.description || '',
            price: item.price,
            quantity: item.quantity,
            image: item.image || '/placeholder-image.jpg'
          })),
          subtotal: orderTotal.subtotal / 100, // Convert from cents to dollars
          shipping: orderTotal.shipping / 100,
          tax: orderTotal.tax / 100,
          total: orderTotal.total / 100,
          paymentMethod: {
            last4: paymentMethod.card?.last4 || '****',
            brand: paymentMethod.card?.brand || 'card'
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
        
        console.log('Order details prepared:', orderDetails);
        
        // Navigate to success page with order details BEFORE clearing cart
        console.log('Attempting to navigate to OrderConfirmation...');
        try {
          navigate('/OrderConfirmation', {
            state: {
              orderDetails: orderDetails,
            },
            replace: true // Prevent going back to checkout
          });
          console.log('Navigation call completed');
          
          // Clear cart after navigation to prevent race conditions
          setTimeout(() => {
            clearCart();
            console.log('Cart cleared after navigation');
          }, 100);
        } catch (navError) {
          console.error('Navigation error:', navError);
          // Still clear cart even if navigation fails
          clearCart();
        }
      } else {
        console.log('Payment status:', paymentIntent.status);
        setError('Payment was not completed successfully. Please try again.');
        setShowError(true);
        setIsProcessing(false);
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
                <label>Card Information *</label>
                <div className="card-element-container">
                  <CardElement 
                    options={cardElementOptions}
                    onReady={() => {
                      console.log('CardElement ready');
                    }}
                    onChange={(event) => {
                      if (event.error) {
                        setError(event.error.message);
                        setShowError(true);
                      } else if (error && error.includes('card')) {
                        setError(null);
                        setShowError(false);
                      }
                    }}
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
  const [stripeError, setStripeError] = useState(null);
  const stripePromise = getStripe();

  // Validate Stripe configuration
  useEffect(() => {
    const validateStripe = async () => {
      try {
        const stripe = await stripePromise;
        if (!stripe) {
          setStripeError('Stripe failed to initialize. Please check your internet connection and try again.');
        }
      } catch (error) {
        console.error('Stripe initialization error:', error);
        setStripeError('Payment system unavailable. Please try again later.');
      }
    };
    
    validateStripe();
  }, [stripePromise]);

  if (stripeError) {
    return (
      <div className="checkout-page">
        <div className="container">
          <div className="error-state">
            <h1>Payment System Error</h1>
            <p>{stripeError}</p>
            <Link to="/cart" className="btn">Return to Cart</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Elements 
      stripe={stripePromise}
      options={{
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#0570de',
            colorBackground: '#ffffff',
            colorText: '#30313d',
            colorDanger: '#df1b41',
            fontFamily: 'system-ui, sans-serif',
            spacingUnit: '4px',
            borderRadius: '6px'
          }
        }
      }}
    >
      <CheckoutForm />
    </Elements>
  );
};

export default Checkout;