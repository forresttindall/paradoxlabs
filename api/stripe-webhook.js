import Stripe from 'stripe';
import { createTransport } from 'nodemailer';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Email configuration for shipping notifications
const transporter = createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  debug: true, // Enable debug logging
  logger: true // Enable logger
});

// Debug utility for webhook operations
const debugWebhook = {
  log: (action, data) => {
    console.group(`🔔 WEBHOOK DEBUG: ${action}`);
    console.log('Timestamp:', new Date().toISOString());
    console.log('Data:', data);
    console.groupEnd();
  },
  error: (action, error) => {
    console.group(`❌ WEBHOOK ERROR: ${action}`);
    console.error('Timestamp:', new Date().toISOString());
    console.error('Error:', error);
    console.groupEnd();
  }
};

// Send shipping notification email
const sendShippingNotification = async (customerEmail, orderDetails, trackingInfo) => {
  try {
    // Test SMTP connection first
    debugWebhook.log('TESTING_SMTP_CONNECTION', {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      user: process.env.SMTP_USER ? 'configured' : 'missing',
      pass: process.env.SMTP_PASS ? 'configured' : 'missing'
    });

    await transporter.verify();
    debugWebhook.log('SMTP_CONNECTION_VERIFIED', { success: true });

    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@paradoxlabs.tech',
      to: customerEmail,
      subject: `Your order #${orderDetails.orderNumber} has shipped!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Your Order Has Shipped!</h2>
          
          <p>Hi ${orderDetails.customerName},</p>
          
          <p>Great news! Your order #${orderDetails.orderNumber} has been shipped and is on its way to you.</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #333;">Tracking Information</h3>
            <p><strong>Tracking Number:</strong> ${trackingInfo.trackingNumber}</p>
            <p><strong>Carrier:</strong> ${trackingInfo.carrier}</p>
            <p><strong>Estimated Delivery:</strong> ${trackingInfo.estimatedDelivery || 'TBD'}</p>
            ${trackingInfo.trackingUrl ? `<p><a href="${trackingInfo.trackingUrl}" style="color: #007bff;">Track Your Package</a></p>` : ''}
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #333;">Shipping Address</h3>
            <p>
              ${orderDetails.shippingAddress.name}<br>
              ${orderDetails.shippingAddress.line1}<br>
              ${orderDetails.shippingAddress.city}, ${orderDetails.shippingAddress.state} ${orderDetails.shippingAddress.postal_code}<br>
              ${orderDetails.shippingAddress.country}
            </p>
          </div>
          
          <p>If you have any questions about your order, please don't hesitate to contact our customer support team.</p>
          
          <p>Thank you for your business!</p>
          
          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      `
    };

    debugWebhook.log('SENDING_EMAIL', {
      to: customerEmail.replace(/(.{3}).*(@.*)/, '$1***$2'),
      from: mailOptions.from,
      subject: mailOptions.subject
    });

    const result = await transporter.sendMail(mailOptions);
    
    debugWebhook.log('SHIPPING_EMAIL_SENT', {
      customerEmail: customerEmail.replace(/(.{3}).*(@.*)/, '$1***$2'),
      orderNumber: orderDetails.orderNumber,
      messageId: result.messageId,
      response: result.response
    });
  } catch (error) {
    debugWebhook.error('SHIPPING_EMAIL_FAILED', {
      error: error.message,
      code: error.code,
      command: error.command,
      customerEmail: customerEmail.replace(/(.{3}).*(@.*)/, '$1***$2'),
      smtpConfig: {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        user: process.env.SMTP_USER ? 'configured' : 'missing',
        pass: process.env.SMTP_PASS ? 'configured' : 'missing'
      }
    });
    
    // Provide more specific error messages
    if (error.code === 'EAUTH') {
      throw new Error('SMTP Authentication failed. Please check your email credentials and ensure you\'re using an app-specific password for Gmail.');
    } else if (error.code === 'ECONNECTION') {
      throw new Error('Failed to connect to SMTP server. Please check your SMTP settings.');
    } else if (error.code === 'EMESSAGE') {
      throw new Error('Invalid email message format.');
    } else {
      throw new Error(`Email sending failed: ${error.message}`);
    }
  }
};

// Update payment intent metadata with fulfillment status
const updateFulfillmentStatus = async (paymentIntentId, status, trackingInfo = null) => {
  try {
    debugWebhook.log('FULFILLMENT_UPDATE_START', {
      paymentIntentId,
      status,
      hasTracking: !!trackingInfo
    });

    const updateData = {
      metadata: {
        fulfillment_status: status,
        fulfillment_updated: new Date().toISOString()
      }
    };

    if (trackingInfo) {
      updateData.metadata.tracking_number = trackingInfo.trackingNumber || '';
      updateData.metadata.tracking_carrier = trackingInfo.carrier || '';
      updateData.metadata.tracking_url = trackingInfo.trackingUrl || '';
      updateData.metadata.shipped_date = new Date().toISOString();
      
      if (trackingInfo.estimatedDelivery) {
        updateData.metadata.estimated_delivery = trackingInfo.estimatedDelivery;
      }
    }

    const updatedPaymentIntent = await stripe.paymentIntents.update(paymentIntentId, updateData);
    
    debugWebhook.log('FULFILLMENT_STATUS_UPDATED', {
      paymentIntentId,
      status,
      hasTracking: !!trackingInfo,
      updatedMetadata: updatedPaymentIntent.metadata
    });
    
    return updatedPaymentIntent;
  } catch (error) {
    debugWebhook.error('FULFILLMENT_UPDATE_FAILED', {
      paymentIntentId,
      status,
      error: error.message,
      stack: error.stack
    });
    
    // Provide more specific error messages
    if (error.message.includes('No such payment_intent')) {
      throw new Error(`Payment intent ${paymentIntentId} not found`);
    } else if (error.message.includes('Invalid request')) {
      throw new Error(`Invalid update request for payment intent ${paymentIntentId}`);
    } else {
      throw new Error(`Failed to update fulfillment status: ${error.message}`);
    }
  }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    debugWebhook.log('WEBHOOK_RECEIVED', {
      type: event.type,
      id: event.id
    });
  } catch (err) {
    debugWebhook.error('WEBHOOK_SIGNATURE_VERIFICATION_FAILED', {
      error: err.message
    });
    return res.status(400).json({ error: `Webhook signature verification failed: ${err.message}` });
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        debugWebhook.log('PAYMENT_SUCCEEDED', {
          paymentIntentId: paymentIntent.id,
          amount: paymentIntent.amount,
          customerEmail: paymentIntent.metadata.customer_email
        });
        
        // Mark order as paid and ready for fulfillment
        await updateFulfillmentStatus(paymentIntent.id, 'paid');
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        debugWebhook.log('PAYMENT_FAILED', {
          paymentIntentId: failedPayment.id,
          lastPaymentError: failedPayment.last_payment_error?.message
        });
        break;

      default:
        debugWebhook.log('UNHANDLED_WEBHOOK_TYPE', {
          type: event.type
        });
    }

    res.status(200).json({ received: true });
  } catch (error) {
    debugWebhook.error('WEBHOOK_PROCESSING_FAILED', {
      eventType: event.type,
      error: error.message
    });
    res.status(500).json({ error: 'Webhook processing failed' });
  }
}

// Export utility functions for manual fulfillment
export { updateFulfillmentStatus, sendShippingNotification };

// Manual fulfillment function for admin use
export const markOrderAsShipped = async (paymentIntentId, trackingInfo) => {
  try {
    debugWebhook.log('MARK_SHIPPED_START', {
      paymentIntentId,
      trackingInfo: {
        hasNumber: !!trackingInfo?.trackingNumber,
        hasCarrier: !!trackingInfo?.carrier,
        hasUrl: !!trackingInfo?.trackingUrl
      }
    });

    // Validate tracking info
    if (!trackingInfo || !trackingInfo.trackingNumber || !trackingInfo.carrier) {
      throw new Error('Tracking number and carrier are required');
    }

    // Get payment intent to extract customer info
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (!paymentIntent) {
      throw new Error(`Payment intent ${paymentIntentId} not found`);
    }
    
    if (!paymentIntent.metadata.customer_email) {
      throw new Error('Customer email not found in payment intent metadata');
    }

    debugWebhook.log('PAYMENT_INTENT_RETRIEVED', {
      paymentIntentId,
      hasCustomerEmail: !!paymentIntent.metadata.customer_email,
      currentStatus: paymentIntent.metadata.fulfillment_status
    });

    // Update fulfillment status
    await updateFulfillmentStatus(paymentIntentId, 'shipped', trackingInfo);

    // Prepare order details for email
    const orderDetails = {
      orderNumber: paymentIntentId,
      customerName: paymentIntent.metadata.customer_name || 'Customer',
      shippingAddress: {
        name: paymentIntent.metadata.shipping_name || paymentIntent.metadata.customer_name || 'Customer',
        line1: paymentIntent.metadata.shipping_line1 || '',
        city: paymentIntent.metadata.shipping_city || '',
        state: paymentIntent.metadata.shipping_state || '',
        postal_code: paymentIntent.metadata.shipping_postal_code || '',
        country: paymentIntent.metadata.shipping_country || 'US'
      }
    };

    // Send shipping notification (but don't fail the whole operation if email fails)
    try {
      await sendShippingNotification(
        paymentIntent.metadata.customer_email,
        orderDetails,
        trackingInfo
      );
    } catch (emailError) {
      debugWebhook.error('SHIPPING_EMAIL_FAILED_BUT_CONTINUING', {
        paymentIntentId,
        emailError: emailError.message
      });
      // Continue with success even if email fails
    }

    debugWebhook.log('ORDER_MARKED_AS_SHIPPED', {
      paymentIntentId,
      trackingNumber: trackingInfo.trackingNumber
    });

    return {
      success: true,
      message: 'Order marked as shipped and customer notified'
    };
  } catch (error) {
    debugWebhook.error('MARK_SHIPPED_FAILED', {
      paymentIntentId,
      error: error.message,
      stack: error.stack
    });
    
    // Provide more specific error messages
    if (error.message.includes('No such payment_intent')) {
      throw new Error(`Order ${paymentIntentId} not found in Stripe`);
    } else if (error.message.includes('Tracking number')) {
      throw new Error('Tracking information is incomplete');
    } else if (error.message.includes('Customer email')) {
      throw new Error('Customer email is missing from order data');
    } else {
      throw new Error(`Failed to mark order as shipped: ${error.message}`);
    }
  }
};