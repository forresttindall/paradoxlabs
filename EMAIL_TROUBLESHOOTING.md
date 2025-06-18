# Email Notification Troubleshooting Guide

## Issue: Shipping notification emails not being sent when orders are marked as shipped

### Root Cause Analysis

The issue is likely related to SMTP authentication. Your current `.env` file is using a regular Gmail password (`Anniebananie1!`) instead of an app-specific password, which is required for Gmail SMTP authentication when 2FA is enabled.

### Current Configuration Issues

1. **Gmail App Password Required**: Gmail requires app-specific passwords for SMTP authentication
2. **Missing Error Handling**: Limited error logging makes it difficult to diagnose issues
3. **No Connection Testing**: No verification that SMTP connection works before sending emails

### Solution Steps

#### Step 1: Generate Gmail App Password

1. Go to your Google Account settings: https://myaccount.google.com/
2. Navigate to "Security" → "2-Step Verification" (enable if not already enabled)
3. Go to "App passwords": https://myaccount.google.com/apppasswords
4. Select "Mail" and "Other (custom name)"
5. Enter "Paradox Labs Shipping" as the app name
6. Copy the generated 16-character app password

#### Step 2: Update Environment Variables

Update your `.env` file:

```env
# Replace the current SMTP_PASS with your new app password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=paradoxlabs.tech@gmail.com
SMTP_PASS=your_16_character_app_password_here
FROM_EMAIL=paradoxlabs.tech@gmail.com
```

#### Step 3: Test Email Configuration

Run the email test script:

```bash
cd /Users/forresttindall/Documents/Code\ Local/paradoxlabs
node test-email.js
```

This will:
- Verify your SMTP configuration
- Test the connection to Gmail
- Send a test email to confirm everything works
- Provide specific error messages if issues are found

#### Step 4: Test Shipping Notification

1. Access the admin panel at `/admin/fulfillment`
2. Find a test order (or create one)
3. Mark it as shipped with tracking information
4. Check the server logs for detailed email sending information
5. Verify the customer receives the shipping notification

### Enhanced Error Logging

The updated code now includes:

- **SMTP Connection Testing**: Verifies connection before sending emails
- **Detailed Error Logging**: Specific error codes and messages
- **Configuration Validation**: Checks if all required environment variables are set
- **Better Error Messages**: User-friendly error descriptions

### Common Error Codes

- **EAUTH**: Authentication failed - usually means wrong password or app password needed
- **ECONNECTION**: Can't connect to SMTP server - check host/port settings
- **EMESSAGE**: Invalid email format - check email content
- **ETIMEDOUT**: Connection timeout - network or firewall issue

### Verification Checklist

- [ ] Gmail 2FA is enabled
- [ ] App password is generated and copied to `.env`
- [ ] Test script runs successfully
- [ ] Test email is received
- [ ] Shipping notification works in admin panel
- [ ] Customer receives shipping email
- [ ] Server logs show successful email sending

### Production Deployment

For production environments:

1. Ensure environment variables are properly set on your hosting platform
2. Use secure methods to store sensitive credentials
3. Consider using a dedicated email service (SendGrid, Mailgun) for better deliverability
4. Monitor email sending logs regularly

### Alternative Email Providers

If Gmail continues to have issues, consider:

- **SendGrid**: Professional email service with better deliverability
- **Mailgun**: Transactional email service
- **Amazon SES**: AWS Simple Email Service
- **Postmark**: Focused on transactional emails

### Support

If issues persist after following this guide:

1. Check the server logs for detailed error messages
2. Run the test script and share the output
3. Verify all environment variables are correctly set
4. Consider switching to a dedicated email service provider

---

**Last Updated**: January 2024
**Status**: Ready for implementation