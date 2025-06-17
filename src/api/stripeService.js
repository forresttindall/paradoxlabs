import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with publishable key from environment variables
let stripePromise;
let stripeInitializationFailed = false;

export const getStripe = () => {
  if (!stripePromise && !stripeInitializationFailed) {
    const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || import.meta.env.STRIPE_PUBLISHABLE_KEY;
    if (!publishableKey) {
      console.error('STRIPE_PUBLISHABLE_KEY is not set (checked both VITE_STRIPE_PUBLISHABLE_KEY and STRIPE_PUBLISHABLE_KEY)');
      stripeInitializationFailed = true;
      return Promise.reject(new Error('Stripe configuration is missing. Please contact support.'));
    }
    
    // Stripe initialization - key logging removed for security
    
    // Remove unsupported options - just pass the publishable key
    stripePromise = loadStripe(publishableKey).catch(error => {
      console.error('Failed to load Stripe:', error);
      stripeInitializationFailed = true;
      stripePromise = null; // Reset so we can try again later
      // Return a rejected promise instead of throwing
      return Promise.reject(new Error('Payment system failed to initialize. Please refresh the page and try again.'));
    });
  }
  
  if (stripeInitializationFailed) {
    return Promise.reject(new Error('Payment system is currently unavailable. Please refresh the page and try again.'));
  }
  
  return stripePromise;
};

// API base URL - adjust based on your backend setup
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Create a payment intent on the server
 * @param {Array} items - Cart items
 * @param {Object} shippingInfo - Shipping information
 * @param {Object} customerInfo - Customer information
 * @returns {Promise} Payment intent client secret
 */
export const createPaymentIntent = async (items, shippingInfo, customerInfo, retryCount = 0) => {
  // Validate input parameters
  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new Error('Items array is required and cannot be empty');
  }
  
  if (!customerInfo || !customerInfo.email) {
    throw new Error('Customer information with email is required');
  }
  
  const maxRetries = 3;
  const retryDelay = 1000 * (retryCount + 1); // Exponential backoff
  
  try {
    const requestData = {
      items,
      shippingInfo,
      customerInfo,
    };
    
    console.log('Creating payment intent attempt:', retryCount + 1);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    const response = await fetch(`${API_BASE_URL}/create-payment-intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage;
      
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error || errorText;
      } catch {
        errorMessage = errorText;
      }
      
      throw new Error(`Payment setup failed: ${errorMessage}`);
    }

    const data = await response.json();
    
    if (!data.client_secret) {
      throw new Error('Invalid response from payment service - missing client secret');
    }
    
    console.log('Payment intent created successfully');
    return data;
  } catch (error) {
    console.error(`Error creating payment intent (attempt ${retryCount + 1}):`, error);
    
    // Retry logic for network errors
    if (retryCount < maxRetries && 
        (error.name === 'AbortError' || 
         error.message.includes('fetch') || 
         error.message.includes('network') ||
         error.message.includes('timeout'))) {
      
      console.log(`Retrying payment intent creation in ${retryDelay}ms...`);
      
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      return createPaymentIntent(items, shippingInfo, customerInfo, retryCount + 1);
    }
    
    // Re-throw with user-friendly message
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please check your connection and try again.');
    }
    
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
    
    if (!stripe) {
      throw new Error('Payment system is not available. Please refresh the page and try again.');
    }
    
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
  if (!items || !Array.isArray(items)) {
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
    return total + itemTotal;
  }, 0);

  const shipping = items.reduce((total, item) => {
    const itemShipping = item.shipping || 0;
    return total + itemShipping;
  }, 0);

  // Tax calculation (you can customize this based on location)
  const taxRate = shippingInfo.taxRate || 0; // Default 0% tax
  const tax = subtotal * taxRate;

  const total = subtotal + shipping + tax;
  
  const result = {
    subtotal: Math.round(subtotal * 100) / 100,
    shipping: Math.round(shipping * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    total: Math.round(total * 100) / 100,
    totalCents: Math.round(total * 100), // For Stripe (amount in cents)
  };
  
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
    
    if (!stripe) {
      return { isValid: false, error: 'Payment system is not available. Please refresh the page and try again.' };
    }
    
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