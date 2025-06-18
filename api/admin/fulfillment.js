import { markOrderAsShipped, updateFulfillmentStatus, sendOrderStatusNotification } from '../stripe-webhook.js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Debug utility for admin operations
const debugAdmin = {
  log: (action, data) => {
    console.group(`🔧 ADMIN DEBUG: ${action}`);
    console.log('Timestamp:', new Date().toISOString());
    console.log('Data:', data);
    console.groupEnd();
  },
  error: (action, error) => {
    console.group(`❌ ADMIN ERROR: ${action}`);
    console.error('Timestamp:', new Date().toISOString());
    console.error('Error:', error);
    console.groupEnd();
  }
};

// Simple admin authentication (replace with proper auth in production)
const authenticateAdmin = (req) => {
  // Handle case-insensitive header lookup
  const adminKey = req.headers['x-admin-key'] || req.headers['X-Admin-Key'];
  
  if (!adminKey) {
    debugAdmin.error('ADMIN_AUTH_FAILED', {
      reason: 'No admin key provided',
      headers: Object.keys(req.headers)
    });
    return false;
  }
  
  const isValid = adminKey === process.env.ADMIN_API_KEY;
  
  if (!isValid) {
    debugAdmin.error('ADMIN_AUTH_FAILED', {
      reason: 'Invalid admin key',
      providedKey: adminKey ? 'provided' : 'missing',
      expectedKey: process.env.ADMIN_API_KEY ? 'configured' : 'not configured'
    });
  }
  
  return isValid;
};

export default async function handler(req, res) {
  // Add CORS headers for admin requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Admin-Key');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Check admin authentication
  if (!authenticateAdmin(req)) {
    debugAdmin.error('AUTHENTICATION_FAILED', {
      method: req.method,
      headers: Object.keys(req.headers),
      hasAdminKey: !!(req.headers['x-admin-key'] || req.headers['X-Admin-Key'])
    });
    return res.status(401).json({ 
      error: 'Unauthorized',
      message: 'Invalid or missing admin API key'
    });
  }

  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        await handleGetOrders(req, res);
        break;
      case 'POST':
        await handleUpdateOrder(req, res);
        break;
      default:
        res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    debugAdmin.error('ADMIN_REQUEST_FAILED', {
      method,
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message
    });
  }
}

// Get orders with fulfillment status
const handleGetOrders = async (req, res) => {
  try {
    const { status, limit = 50, starting_after } = req.query;
    
    const searchParams = {
      limit: parseInt(limit),
      expand: ['data.charges']
    };
    
    if (starting_after) {
      searchParams.starting_after = starting_after;
    }

    // Get payment intents from Stripe
    const paymentIntents = await stripe.paymentIntents.list(searchParams);
    
    // Filter by fulfillment status if specified
    let filteredOrders = paymentIntents.data;
    if (status) {
      filteredOrders = paymentIntents.data.filter(pi => 
        pi.metadata.fulfillment_status === status
      );
    }

    // Format orders for admin interface
    const orders = filteredOrders.map(pi => ({
      id: pi.id,
      orderNumber: pi.id,
      amount: pi.amount / 100, // Convert from cents
      currency: pi.currency,
      status: pi.status,
      fulfillmentStatus: pi.metadata.fulfillment_status || 'pending',
      customerEmail: pi.metadata.customer_email,
      customerName: pi.metadata.customer_name,
      customerPhone: pi.metadata.customer_phone,
      orderDate: pi.metadata.order_date,
      shippingAddress: {
        name: pi.metadata.shipping_name,
        line1: pi.metadata.shipping_line1,
        city: pi.metadata.shipping_city,
        state: pi.metadata.shipping_state,
        postalCode: pi.metadata.shipping_postal_code,
        country: pi.metadata.shipping_country
      },
      items: extractItemsFromMetadata(pi.metadata),
      tracking: {
        number: pi.metadata.tracking_number,
        carrier: pi.metadata.tracking_carrier,
        url: pi.metadata.tracking_url
      },
      fulfillmentUpdated: pi.metadata.fulfillment_updated,
      shippedDate: pi.metadata.shipped_date
    }));

    debugAdmin.log('ORDERS_RETRIEVED', {
      totalCount: paymentIntents.data.length,
      filteredCount: orders.length,
      status: status || 'all'
    });

    res.status(200).json({
      orders,
      hasMore: paymentIntents.has_more,
      totalCount: orders.length
    });
  } catch (error) {
    debugAdmin.error('GET_ORDERS_FAILED', {
      error: error.message
    });
    throw error;
  }
};

// Update order fulfillment status
const handleUpdateOrder = async (req, res) => {
  try {
    const { orderId, action, trackingInfo } = req.body;

    if (!orderId || !action) {
      return res.status(400).json({ 
        error: 'Order ID and action are required',
        message: 'Missing required fields: orderId or action'
      });
    }

    debugAdmin.log('ORDER_UPDATE_REQUEST', {
      orderId,
      action,
      hasTracking: !!trackingInfo,
      trackingInfo: trackingInfo ? {
        hasNumber: !!trackingInfo.trackingNumber,
        hasCarrier: !!trackingInfo.carrier,
        hasUrl: !!trackingInfo.trackingUrl
      } : null
    });

    let result;

    switch (action) {
      case 'mark_shipped':
        if (!trackingInfo || !trackingInfo.trackingNumber || !trackingInfo.carrier) {
          return res.status(400).json({ 
            error: 'Tracking number and carrier are required for shipping',
            message: 'Please provide both tracking number and carrier information'
          });
        }
        result = await markOrderAsShipped(orderId, trackingInfo);
        break;

      case 'mark_processing':
        await updateFulfillmentStatus(orderId, 'processing');
        // Send processing notification email
        try {
          const orderDetails = await getOrderDetailsForEmail(orderId);
          await sendOrderStatusNotification(
            orderDetails.customerEmail,
            orderDetails,
            'processing'
          );
        } catch (emailError) {
          debugAdmin.error('PROCESSING_EMAIL_FAILED', {
            orderId,
            emailError: emailError.message
          });
          // Continue with success even if email fails
        }
        result = { success: true, message: 'Order marked as processing and customer notified' };
        break;

      case 'mark_delivered':
        await updateFulfillmentStatus(orderId, 'delivered');
        // Send delivered notification email
        try {
          const orderDetails = await getOrderDetailsForEmail(orderId);
          await sendOrderStatusNotification(
            orderDetails.customerEmail,
            orderDetails,
            'delivered'
          );
        } catch (emailError) {
          debugAdmin.error('DELIVERED_EMAIL_FAILED', {
            orderId,
            emailError: emailError.message
          });
          // Continue with success even if email fails
        }
        result = { success: true, message: 'Order marked as delivered and customer notified' };
        break;

      case 'mark_cancelled':
        await updateFulfillmentStatus(orderId, 'cancelled');
        // Send cancellation notification email
        try {
          const orderDetails = await getOrderDetailsForEmail(orderId);
          await sendOrderStatusNotification(
            orderDetails.customerEmail,
            orderDetails,
            'cancelled'
          );
        } catch (emailError) {
          debugAdmin.error('CANCELLED_EMAIL_FAILED', {
            orderId,
            emailError: emailError.message
          });
          // Continue with success even if email fails
        }
        result = { success: true, message: 'Order marked as cancelled and customer notified' };
        break;

      default:
        return res.status(400).json({ 
          error: 'Invalid action',
          message: `Action '${action}' is not supported. Valid actions: mark_shipped, mark_processing, mark_delivered, mark_cancelled`
        });
    }

    debugAdmin.log('ORDER_UPDATE_SUCCESS', {
      orderId,
      action,
      result
    });

    res.status(200).json(result);
  } catch (error) {
    debugAdmin.error('UPDATE_ORDER_FAILED', {
      orderId: req.body?.orderId,
      action: req.body?.action,
      error: error.message,
      stack: error.stack
    });
    
    // Don't throw the error, handle it here
    res.status(500).json({
      error: 'Failed to update order',
      message: error.message || 'An unexpected error occurred while updating the order'
    });
  }
};

// Extract items from metadata
const extractItemsFromMetadata = (metadata) => {
  const items = [];
  const itemCount = parseInt(metadata.item_count || '0');
  
  for (let i = 1; i <= Math.min(itemCount, 3); i++) {
    const item = {
      id: metadata[`item_${i}_id`],
      name: metadata[`item_${i}_name`],
      quantity: parseInt(metadata[`item_${i}_quantity`] || '0'),
      price: parseFloat(metadata[`item_${i}_price`] || '0')
    };
    
    if (item.id && item.name) {
      items.push(item);
    }
  }
  
  return items;
};

// Get order details formatted for email notifications
const getOrderDetailsForEmail = async (orderId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(orderId);
    
    if (!paymentIntent) {
      throw new Error(`Payment intent ${orderId} not found`);
    }
    
    if (!paymentIntent.metadata.customer_email) {
      throw new Error('Customer email not found in payment intent metadata');
    }

    const items = extractItemsFromMetadata(paymentIntent.metadata);
    
    return {
      orderNumber: paymentIntent.id,
      customerName: paymentIntent.metadata.customer_name || 'Customer',
      customerEmail: paymentIntent.metadata.customer_email,
      orderDate: paymentIntent.metadata.order_date,
      items: items,
      shippingAddress: {
        name: paymentIntent.metadata.shipping_name || paymentIntent.metadata.customer_name || 'Customer',
        line1: paymentIntent.metadata.shipping_line1 || '',
        city: paymentIntent.metadata.shipping_city || '',
        state: paymentIntent.metadata.shipping_state || '',
        postal_code: paymentIntent.metadata.shipping_postal_code || '',
        country: paymentIntent.metadata.shipping_country || 'US'
      }
    };
  } catch (error) {
    debugAdmin.error('GET_ORDER_DETAILS_FOR_EMAIL_FAILED', {
      orderId,
      error: error.message
    });
    throw error;
  }
};

// Utility function to get order details by ID
export const getOrderById = async (orderId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(orderId);
    
    return {
      id: paymentIntent.id,
      orderNumber: paymentIntent.id,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
      fulfillmentStatus: paymentIntent.metadata.fulfillment_status || 'pending',
      customerEmail: paymentIntent.metadata.customer_email,
      customerName: paymentIntent.metadata.customer_name,
      customerPhone: paymentIntent.metadata.customer_phone,
      orderDate: paymentIntent.metadata.order_date,
      shippingAddress: {
        name: paymentIntent.metadata.shipping_name,
        line1: paymentIntent.metadata.shipping_line1,
        city: paymentIntent.metadata.shipping_city,
        state: paymentIntent.metadata.shipping_state,
        postalCode: paymentIntent.metadata.shipping_postal_code,
        country: paymentIntent.metadata.shipping_country
      },
      items: extractItemsFromMetadata(paymentIntent.metadata),
      tracking: {
        number: paymentIntent.metadata.tracking_number,
        carrier: paymentIntent.metadata.tracking_carrier,
        url: paymentIntent.metadata.tracking_url
      },
      fulfillmentUpdated: paymentIntent.metadata.fulfillment_updated,
      shippedDate: paymentIntent.metadata.shipped_date
    };
  } catch (error) {
    debugAdmin.error('GET_ORDER_BY_ID_FAILED', {
      orderId,
      error: error.message
    });
    throw error;
  }
};