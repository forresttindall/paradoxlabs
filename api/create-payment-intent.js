import Stripe from 'stripe';

// Debug utility for API operations
const debugAPI = {
  log: (action, data) => {
    console.group(`🔧 API DEBUG: ${action}`);
    console.log('Timestamp:', new Date().toISOString());
    console.log('Data:', data);
    console.groupEnd();
  },
  error: (action, error) => {
    console.group(`❌ API ERROR: ${action}`);
    console.error('Timestamp:', new Date().toISOString());
    console.error('Error:', error);
    console.groupEnd();
  },
  request: (method, data) => {
    console.group(`📡 API REQUEST: ${method}`);
    console.log('Timestamp:', new Date().toISOString());
    console.log('Request data:', data);
    console.groupEnd();
  }
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
debugAPI.log('STRIPE_INITIALIZED', {
  hasSecretKey: !!process.env.STRIPE_SECRET_KEY,
  keyPrefix: process.env.STRIPE_SECRET_KEY?.substring(0, 7) + '...'
});

export default async function handler(req, res) {
  debugAPI.request('POST', {
    method: req.method,
    hasBody: !!req.body,
    userAgent: req.headers['user-agent'],
    contentType: req.headers['content-type']
  });
  
  if (req.method !== 'POST') {
    debugAPI.error('INVALID_METHOD', `Method ${req.method} not allowed`);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { items, shippingInfo, customerInfo } = req.body;
    
    debugAPI.log('REQUEST_DATA_RECEIVED', {
      hasItems: !!items,
      itemCount: items?.length,
      hasShippingInfo: !!shippingInfo,
      hasCustomerInfo: !!customerInfo,
      customerEmail: customerInfo?.email ? '***@***.***' : 'missing'
    });
    
    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      debugAPI.error('VALIDATION_ERROR', 'Items array is required and cannot be empty');
      return res.status(400).json({ error: 'Items array is required and cannot be empty' });
    }
    
    if (!customerInfo || !customerInfo.email) {
      debugAPI.error('VALIDATION_ERROR', 'Customer info with email is required');
      return res.status(400).json({ error: 'Customer info with email is required' });
    }
    
    debugAPI.log('VALIDATION_PASSED', 'All required fields are present');

    // Calculate order total
    const calculateTotal = (items) => {
      debugAPI.log('CALCULATING_ORDER_TOTAL', {
        itemCount: items.length,
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        }))
      });
      
      const subtotal = items.reduce((sum, item) => {
        const itemTotal = item.price * item.quantity;
        debugAPI.log('CALCULATING_ITEM_TOTAL', {
          itemId: item.id,
          itemName: item.name,
          price: item.price,
          quantity: item.quantity,
          itemTotal: itemTotal
        });
        return sum + itemTotal;
      }, 0);
      
      const shipping = subtotal > 100 ? 0 : 10; // Free shipping over $100
      const tax = subtotal * 0.08; // 8% tax
      
      debugAPI.log('ORDER_CALCULATION_BREAKDOWN', {
        subtotal: subtotal,
        shipping: shipping,
        tax: tax,
        freeShippingApplied: subtotal > 100
      });
      
      const result = {
        subtotal: Math.round(subtotal * 100), // Convert to cents
        shipping: Math.round(shipping * 100),
        tax: Math.round(tax * 100),
        total: Math.round((subtotal + shipping + tax) * 100)
      };
      
      debugAPI.log('ORDER_TOTAL_CALCULATED', result);
      return result;
    };

    const orderTotal = calculateTotal(items);

    // Create payment intent
    const paymentIntentData = {
      amount: orderTotal.total,
      currency: 'usd',
      metadata: {
        customer_email: customerInfo.email,
        customer_name: customerInfo.name,
        items: JSON.stringify(items.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price
        })))
      },
      shipping: {
        name: shippingInfo.name,
        address: {
          line1: shippingInfo.address.line1,
          line2: shippingInfo.address.line2,
          city: shippingInfo.address.city,
          state: shippingInfo.address.state,
          postal_code: shippingInfo.address.postal_code,
          country: shippingInfo.address.country || 'US'
        }
      }
    };
    
    debugAPI.log('CREATING_PAYMENT_INTENT', {
      amount: paymentIntentData.amount,
      currency: paymentIntentData.currency,
      customerEmail: '***@***.***',
      customerName: customerInfo.name,
      itemCount: items.length,
      hasShippingInfo: !!shippingInfo.name
    });
    
    const paymentIntent = await stripe.paymentIntents.create(paymentIntentData);
    
    debugAPI.log('PAYMENT_INTENT_CREATED', {
      paymentIntentId: paymentIntent.id,
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      hasClientSecret: !!paymentIntent.client_secret
    });
    
    const responseData = {
      client_secret: paymentIntent.client_secret,
      order_total: orderTotal
    };
    
    debugAPI.log('SENDING_SUCCESS_RESPONSE', {
      hasClientSecret: !!responseData.client_secret,
      orderTotal: responseData.order_total
    });

    res.status(200).json(responseData);
  } catch (error) {
    debugAPI.error('PAYMENT_INTENT_CREATION_FAILED', {
      errorMessage: error.message,
      errorType: error.type,
      errorCode: error.code,
      errorStack: error.stack,
      stripeError: error.type ? 'Stripe API Error' : 'General Error'
    });
    
    console.error('Error creating payment intent:', error);
    
    // Send appropriate error response based on error type
    if (error.type === 'StripeCardError') {
      debugAPI.log('STRIPE_CARD_ERROR', 'Card was declined');
      res.status(400).json({ 
        error: 'Your card was declined. Please try a different payment method.',
        type: 'card_error'
      });
    } else if (error.type === 'StripeInvalidRequestError') {
      debugAPI.log('STRIPE_INVALID_REQUEST', 'Invalid parameters sent to Stripe');
      res.status(400).json({ 
        error: 'Invalid payment information. Please check your details and try again.',
        type: 'validation_error'
      });
    } else if (error.type === 'StripeAPIError') {
      debugAPI.log('STRIPE_API_ERROR', 'Stripe API error');
      res.status(500).json({ 
        error: 'Payment service temporarily unavailable. Please try again later.',
        type: 'api_error'
      });
    } else {
      debugAPI.log('GENERAL_ERROR', 'Unknown error occurred');
      res.status(500).json({ 
        error: 'Failed to create payment intent. Please try again.',
        type: 'server_error'
      });
    }
  }
}