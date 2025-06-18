import { createTransport } from 'nodemailer';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Test email configuration
const testEmailConfig = async () => {
  console.log('🔧 Testing Email Configuration...');
  console.log('================================');
  
  // Check environment variables
  console.log('\n📋 Environment Variables:');
  console.log(`SMTP_HOST: ${process.env.SMTP_HOST || 'NOT SET'}`);
  console.log(`SMTP_PORT: ${process.env.SMTP_PORT || 'NOT SET'}`);
  console.log(`SMTP_USER: ${process.env.SMTP_USER ? 'SET' : 'NOT SET'}`);
  console.log(`SMTP_PASS: ${process.env.SMTP_PASS ? 'SET' : 'NOT SET'}`);
  console.log(`FROM_EMAIL: ${process.env.FROM_EMAIL || 'NOT SET'}`);
  
  // Create transporter
  const transporter = createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    debug: true,
    logger: true
  });
  
  try {
    console.log('\n🔍 Testing SMTP Connection...');
    await transporter.verify();
    console.log('✅ SMTP Connection: SUCCESS');
    
    // Send test email
    console.log('\n📧 Sending Test Email...');
    const testEmail = {
      from: process.env.FROM_EMAIL || 'noreply@paradoxlabs.tech',
      to: process.env.SMTP_USER, // Send to yourself for testing
      subject: 'Test Email - Shipping Notification System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Email System Test</h2>
          <p>This is a test email to verify the shipping notification system is working correctly.</p>
          <p><strong>Test Time:</strong> ${new Date().toISOString()}</p>
          <p>If you receive this email, your SMTP configuration is working properly!</p>
        </div>
      `
    };
    
    const result = await transporter.sendMail(testEmail);
    console.log('✅ Test Email Sent Successfully!');
    console.log(`Message ID: ${result.messageId}`);
    console.log(`Response: ${result.response}`);
    
  } catch (error) {
    console.log('❌ Email Test Failed:');
    console.error(`Error Code: ${error.code}`);
    console.error(`Error Message: ${error.message}`);
    
    if (error.code === 'EAUTH') {
      console.log('\n🔧 AUTHENTICATION ISSUE DETECTED:');
      console.log('For Gmail accounts, you need to:');
      console.log('1. Enable 2-Factor Authentication on your Google account');
      console.log('2. Generate an App Password specifically for this application');
      console.log('3. Use the App Password instead of your regular password');
      console.log('4. Go to: https://myaccount.google.com/apppasswords');
      console.log('5. Generate a new app password and update SMTP_PASS in your .env file');
    } else if (error.code === 'ECONNECTION') {
      console.log('\n🔧 CONNECTION ISSUE DETECTED:');
      console.log('Check your SMTP settings:');
      console.log('- Ensure SMTP_HOST and SMTP_PORT are correct');
      console.log('- Check your internet connection');
      console.log('- Verify firewall settings');
    }
  }
};

// Run the test
testEmailConfig().catch(console.error);