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

    // Calculate order total - matches frontend logic
    const calculateTotal = (items, shippingInfo = {}) => {
      debugAPI.log('CALCULATING_ORDER_TOTAL', {
        itemCount: items.length,
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          shipping: item.shipping
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
      
      // Use item-specific shipping costs instead of flat rate
      const shipping = items.reduce((total, item) => {
        const itemShipping = item.shipping || 0;
        return total + itemShipping;
      }, 0);
      
      // Tax calculation based on shipping info or default to 0%
      const taxRate = shippingInfo.taxRate || 0;
      const tax = subtotal * taxRate;
      
      debugAPI.log('ORDER_CALCULATION_BREAKDOWN', {
        subtotal: subtotal,
        shipping: shipping,
        tax: tax,
        taxRate: taxRate,
        itemShippingUsed: true
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

    const orderTotal = calculateTotal(items, shippingInfo);

    // Normalize shipping info structure - handle both flat and nested formats
    const normalizeShippingInfo = (shippingInfo, customerInfo) => {
      debugAPI.log('NORMALIZING_SHIPPING_INFO', {
        hasName: !!shippingInfo.name,
        hasNestedAddress: !!shippingInfo.address?.line1,
        hasFlatAddress: !!shippingInfo.address && typeof shippingInfo.address === 'string',
        shippingKeys: Object.keys(shippingInfo)
      });
      
      // If shipping info has nested address structure (correct format)
      if (shippingInfo.address && typeof shippingInfo.address === 'object' && shippingInfo.address.line1) {
        return {
          name: shippingInfo.name || `${customerInfo.name}`,
          address: {
            line1: shippingInfo.address.line1,
            line2: shippingInfo.address.line2 || null,
            city: shippingInfo.address.city,
            state: shippingInfo.address.state,
            postal_code: shippingInfo.address.postal_code,
            country: shippingInfo.address.country || 'US'
          }
        };
      }
      
      // If shipping info has flat structure (legacy format from frontend)
      return {
        name: shippingInfo.name || `${customerInfo.name}`,
        address: {
          line1: shippingInfo.address || shippingInfo.line1,
          line2: shippingInfo.line2 || null,
          city: shippingInfo.city,
          state: shippingInfo.state,
          postal_code: shippingInfo.zip || shippingInfo.postal_code,
          country: shippingInfo.country || 'US'
        }
      };
    };
    
    const normalizedShipping = normalizeShippingInfo(shippingInfo, customerInfo);
    
    // Validate normalized shipping info
    const validateShippingInfo = (shipping) => {
      const errors = [];
      
      if (!shipping.name || shipping.name.trim() === '') {
        errors.push('Shipping name is required');
      }
      
      if (!shipping.address.line1 || shipping.address.line1.trim() === '') {
        errors.push('Shipping address line 1 is required');
      }
      
      if (!shipping.address.city || shipping.address.city.trim() === '') {
        errors.push('Shipping city is required');
      }
      
      if (!shipping.address.state || shipping.address.state.trim() === '') {
        errors.push('Shipping state is required');
      }
      
      if (!shipping.address.postal_code || shipping.address.postal_code.trim() === '') {
        errors.push('Shipping postal code is required');
      }
      
      // Normalize state format for US addresses
      if (shipping.address.country === 'US' && shipping.address.state) {
        const stateMap = {
          'alabama': 'AL', 'alaska': 'AK', 'arizona': 'AZ', 'arkansas': 'AR', 'california': 'CA',
          'colorado': 'CO', 'connecticut': 'CT', 'delaware': 'DE', 'florida': 'FL', 'georgia': 'GA',
          'hawaii': 'HI', 'idaho': 'ID', 'illinois': 'IL', 'indiana': 'IN', 'iowa': 'IA',
          'kansas': 'KS', 'kentucky': 'KY', 'louisiana': 'LA', 'maine': 'ME', 'maryland': 'MD',
          'massachusetts': 'MA', 'michigan': 'MI', 'minnesota': 'MN', 'mississippi': 'MS', 'missouri': 'MO',
          'montana': 'MT', 'nebraska': 'NE', 'nevada': 'NV', 'new hampshire': 'NH', 'new jersey': 'NJ',
          'new mexico': 'NM', 'new york': 'NY', 'north carolina': 'NC', 'north dakota': 'ND', 'ohio': 'OH',
          'oklahoma': 'OK', 'oregon': 'OR', 'pennsylvania': 'PA', 'rhode island': 'RI', 'south carolina': 'SC',
          'south dakota': 'SD', 'tennessee': 'TN', 'texas': 'TX', 'utah': 'UT', 'vermont': 'VT',
          'virginia': 'VA', 'washington': 'WA', 'west virginia': 'WV', 'wisconsin': 'WI', 'wyoming': 'WY'
        };
        
        const stateLower = shipping.address.state.toLowerCase();
        if (stateMap[stateLower]) {
          shipping.address.state = stateMap[stateLower];
          debugAPI.log('STATE_NORMALIZED', {
            original: shippingInfo.state,
            normalized: shipping.address.state
          });
        } else if (shipping.address.state.length !== 2) {
          // If it's not a 2-letter code and not in our map, it might be invalid
          debugAPI.log('STATE_FORMAT_WARNING', {
            state: shipping.address.state,
            message: 'State format may be invalid for Stripe'
          });
        }
      }
      
      return { isValid: errors.length === 0, errors };
    };
    
    const shippingValidation = validateShippingInfo(normalizedShipping);
    
    if (!shippingValidation.isValid) {
      debugAPI.error('SHIPPING_VALIDATION_FAILED', {
        errors: shippingValidation.errors,
        shippingData: normalizedShipping
      });
      return res.status(400).json({ 
        error: 'Invalid shipping information: ' + shippingValidation.errors.join(', '),
        type: 'validation_error'
      });
    }
    
    debugAPI.log('NORMALIZED_SHIPPING_INFO', {
      name: normalizedShipping.name,
      hasLine1: !!normalizedShipping.address.line1,
      hasCity: !!normalizedShipping.address.city,
      hasState: !!normalizedShipping.address.state,
      hasPostalCode: !!normalizedShipping.address.postal_code,
      country: normalizedShipping.address.country,
      stateFormat: normalizedShipping.address.state
    });

    // Create payment intent without shipping info to avoid conflicts
    // Shipping will be handled during payment confirmation on client side
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
        }))),
        shipping_name: normalizedShipping.name,
        shipping_address: JSON.stringify(normalizedShipping.address)
      }
    };
    
    debugAPI.log('CREATING_PAYMENT_INTENT', {
      amount: paymentIntentData.amount,
      currency: paymentIntentData.currency,
      customerEmail: '***@***.***',
      customerName: customerInfo.name,
      itemCount: items.length,
      shippingInMetadata: true
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