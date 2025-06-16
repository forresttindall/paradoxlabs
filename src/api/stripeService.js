import { loadStripe } from '@stripe/stripe-js';

// Debug utility for Stripe operations
const debugStripe = {
  log: (action, data) => {
    console.group(`💳 STRIPE DEBUG: ${action}`);
    console.log('Timestamp:', new Date().toISOString());
    console.log('Data:', data);
    console.groupEnd();
  },
  error: (action, error) => {
    console.group(`❌ STRIPE ERROR: ${action}`);
    console.error('Timestamp:', new Date().toISOString());
    console.error('Error:', error);
    console.groupEnd();
  },
  api: (method, url, data) => {
    console.group(`🌐 STRIPE API: ${method} ${url}`);
    console.log('Timestamp:', new Date().toISOString());
    console.log('Request data:', data);
    console.groupEnd();
  }
};

// Initialize Stripe with publishable key from environment variables
let stripePromise;
export const getStripe = () => {
  debugStripe.log('INITIALIZING_STRIPE', {
    hasPublishableKey: !!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
    keyPrefix: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY?.substring(0, 7) + '...'
  });
  
  if (!stripePromise) {
    if (!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) {
      debugStripe.error('MISSING_STRIPE_KEY', 'VITE_STRIPE_PUBLISHABLE_KEY is not set');
    }
    stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
};

// API base URL - adjust based on your backend setup
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5174/api';
debugStripe.log('API_BASE_URL_SET', { apiBaseUrl: API_BASE_URL });

/**
 * Create a payment intent on the server
 * @param {Array} items - Cart items
 * @param {Object} shippingInfo - Shipping information
 * @param {Object} customerInfo - Customer information
 * @returns {Promise} Payment intent client secret
 */
export const createPaymentIntent = async (items, shippingInfo, customerInfo) => {
  debugStripe.log('CREATE_PAYMENT_INTENT_INITIATED', {
    itemCount: items?.length,
    items: items,
    shippingInfo: shippingInfo,
    customerInfo: customerInfo
  });
  
  // Validate input parameters
  if (!items || !Array.isArray(items) || items.length === 0) {
    debugStripe.error('INVALID_ITEMS', 'Items array is empty or invalid');
    throw new Error('Items array is required and cannot be empty');
  }
  
  if (!customerInfo || !customerInfo.email) {
    debugStripe.error('INVALID_CUSTOMER_INFO', 'Customer info or email is missing');
    throw new Error('Customer information with email is required');
  }
  
  try {
    const requestData = {
      items,
      shippingInfo,
      customerInfo,
    };
    
    debugStripe.api('POST', `${API_BASE_URL}/create-payment-intent`, requestData);
    
    const response = await fetch(`${API_BASE_URL}/create-payment-intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    debugStripe.log('PAYMENT_INTENT_RESPONSE_RECEIVED', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    if (!response.ok) {
      const errorText = await response.text();
      debugStripe.error('PAYMENT_INTENT_HTTP_ERROR', {
        status: response.status,
        statusText: response.statusText,
        errorText: errorText
      });
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const data = await response.json();
    debugStripe.log('PAYMENT_INTENT_SUCCESS', {
      hasClientSecret: !!data.client_secret,
      orderTotal: data.order_total,
      clientSecretPrefix: data.client_secret?.substring(0, 10) + '...'
    });
    
    return data;
  } catch (error) {
    debugStripe.error('CREATE_PAYMENT_INTENT_ERROR', error);
    console.error('Error creating payment intent:', error);
    throw error;
  }
};

/**
 * Confirm payment with Stripe
 * @param {string} clientSecret - Payment intent client secret
 * @param {Object} paymentMethod - Payment method details
 * @param {Object} billingDetails - Billing information
 * @returns {Promise} Payment confirmation result
 */
export const confirmPayment = async (clientSecret, paymentMethod, billingDetails) => {
  try {
    const stripe = await getStripe();
    
    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: paymentMethod,
        billing_details: billingDetails,
      },
    });

    return result;
  } catch (error) {
    console.error('Error confirming payment:', error);
    throw error;
  }
};

/**
 * Create a setup intent for saving payment methods
 * @param {string} customerId - Stripe customer ID
 * @returns {Promise} Setup intent client secret
 */
export const createSetupIntent = async (customerId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/create-setup-intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ customer_id: customerId }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating setup intent:', error);
    throw error;
  }
};

/**
 * Retrieve saved payment methods for a customer
 * @param {string} customerId - Stripe customer ID
 * @returns {Promise} Array of payment methods
 */
export const getPaymentMethods = async (customerId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/payment-methods/${customerId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.payment_methods;
  } catch (error) {
    console.error('Error retrieving payment methods:', error);
    throw error;
  }
};

/**
 * Calculate total amount including tax and shipping
 * @param {Array} items - Cart items
 * @param {Object} shippingInfo - Shipping information
 * @returns {Object} Breakdown of costs
 */
export const calculateOrderTotal = (items, shippingInfo = {}) => {
  debugStripe.log('CALCULATE_ORDER_TOTAL_INITIATED', {
    itemCount: items?.length,
    items: items,
    shippingInfo: shippingInfo
  });
  
  if (!items || !Array.isArray(items)) {
    debugStripe.error('INVALID_ITEMS_FOR_CALCULATION', 'Items must be an array');
    return {
      subtotal: 0,
      shipping: 0,
      tax: 0,
      total: 0,
      totalCents: 0
    };
  }
  
  const subtotal = items.reduce((total, item) => {
    const itemTotal = item.price * item.quantity;
    debugStripe.log('CALCULATING_ITEM_SUBTOTAL', {
      itemId: item.id,
      itemName: item.name,
      price: item.price,
      quantity: item.quantity,
      itemTotal: itemTotal
    });
    return total + itemTotal;
  }, 0);

  const shipping = items.reduce((total, item) => {
    const itemShipping = item.shipping || 0;
    debugStripe.log('CALCULATING_ITEM_SHIPPING', {
      itemId: item.id,
      itemName: item.name,
      shipping: itemShipping
    });
    return total + itemShipping;
  }, 0);

  // Tax calculation (you can customize this based on location)
  const taxRate = shippingInfo.taxRate || 0; // Default 0% tax
  const tax = subtotal * taxRate;
  
  debugStripe.log('TAX_CALCULATION', {
    subtotal: subtotal,
    taxRate: taxRate,
    taxAmount: tax
  });

  const total = subtotal + shipping + tax;
  
  const result = {
    subtotal: Math.round(subtotal * 100) / 100,
    shipping: Math.round(shipping * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    total: Math.round(total * 100) / 100,
    totalCents: Math.round(total * 100), // For Stripe (amount in cents)
  };
  
  debugStripe.log('ORDER_TOTAL_CALCULATED', result);
  
  return result;
};

/**
 * Format currency for display
 * @param {number} amount - Amount in dollars
 * @param {string} currency - Currency code (default: USD)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

/**
 * Validate card information
 * @param {Object} cardElement - Stripe card element
 * @returns {Promise} Validation result
 */
export const validateCard = async (cardElement) => {
  try {
    const stripe = await getStripe();
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
    });

    if (error) {
      return { isValid: false, error: error.message };
    }

    return { isValid: true, paymentMethod };
  } catch (error) {
    return { isValid: false, error: error.message };
  }
};

/**
 * Handle webhook events (for server-side implementation reference)
 * This would typically be implemented on your backend
 */
export const webhookEventTypes = {
  PAYMENT_SUCCEEDED: 'payment_intent.succeeded',
  PAYMENT_FAILED: 'payment_intent.payment_failed',
  PAYMENT_REQUIRES_ACTION: 'payment_intent.requires_action',
  SETUP_SUCCEEDED: 'setup_intent.succeeded',
  SETUP_FAILED: 'setup_intent.setup_failed',
};

export default {
  getStripe,
  createPaymentIntent,
  confirmPayment,
  createSetupIntent,
  getPaymentMethods,
  calculateOrderTotal,
  formatCurrency,
  validateCard,
  webhookEventTypes,
};