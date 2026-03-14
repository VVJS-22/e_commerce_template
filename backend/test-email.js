/**
 * Email Configuration Test Script
 * Run this to test your email configuration
 * 
 * Usage: node test-email.js your.email@example.com
 */

require('dotenv').config();
const sendEmail = require('./utils/sendEmail');
const logger = require('./utils/logger');

const testEmail = async () => {
  const recipientEmail = process.argv[2];
  
  if (!recipientEmail) {
    console.error('\n❌ Error: Please provide a recipient email address');
    console.log('\nUsage: node test-email.js your.email@example.com\n');
    process.exit(1);
  }
  
  // Check if email environment variables are set
  const requiredVars = ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASSWORD'];
  const missingVars = requiredVars.filter(v => !process.env[v]);
  
  if (missingVars.length > 0) {
    console.error('\n❌ Error: Missing required environment variables:');
    missingVars.forEach(v => console.error(`   - ${v}`));
    console.log('\nFor Gmail setup:');
    console.log('1. Enable 2FA: https://myaccount.google.com/security');
    console.log('2. Generate App Password: https://myaccount.google.com/apppasswords');
    console.log('3. Add to .env file');
    console.log('\nSee EMAIL_CONFIG_GUIDE.md for detailed instructions\n');
    process.exit(1);
  }
  
  console.log('\n🔧 SMTP Email Configuration:');
  console.log(`   Host: ${process.env.EMAIL_HOST}`);
  console.log(`   Port: ${process.env.EMAIL_PORT}`);
  console.log(`   User: ${process.env.EMAIL_USER}`);
  console.log(`   From: ${process.env.EMAIL_FROM || process.env.EMAIL_USER}`);
  console.log(`   To: ${recipientEmail}`);
  console.log('\n📧 Sending test email...\n');
  
  try {
    await sendEmail({
      email: recipientEmail,
      subject: 'Test Email - E-commerce App',
      message: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #667eea;">✅ Email Configuration Test</h1>
          <p>Congratulations! Your SMTP email configuration is working correctly.</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>Configuration Details:</h3>
            <ul>
              <li><strong>Service:</strong> SMTP</li>
              <li><strong>Host:</strong> ${process.env.EMAIL_HOST}</li>
              <li><strong>Port:</strong> ${process.env.EMAIL_PORT}</li>
              <li><strong>User:</strong> ${process.env.EMAIL_USER}</li>
              <li><strong>From:</strong> ${process.env.EMAIL_FROM || process.env.EMAIL_USER}</li>
              <li><strong>Timestamp:</strong> ${new Date().toISOString()}</li>
            </ul>
          </div>
          
          <p>This test email was sent from your MERN e-commerce application using SMTP.</p>
          
          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            If you received this email, your email service is properly configured and ready for ${process.env.NODE_ENV || 'development'}.
          </p>
        </div>
      `
    });
    
    console.log('✅ SUCCESS! Test email sent successfully!');
    console.log('\n📬 Check your inbox (and spam folder) at:', recipientEmail);
    console.log('\n💡 Tips:');
    console.log('   - If not received, check spam/junk folder');
    console.log('   - Verify your email credentials are correct');
    console.log('   - Check backend/logs/combined.log for details\n');
    
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ FAILED! Error sending test email:', error.message);
    console.log('\n🔍 Troubleshooting:');
    console.log('   1. Verify your EMAIL_USER and EMAIL_PASSWORD in .env');
    console.log('   2. For Gmail: Use App Password (not regular password)');
    console.log('   3. Check if 2FA is enabled on your email account');
    console.log('   4. Try port 587 instead of 465 (or vice versa)');
    console.log('   5. Check backend/logs/error.log for details');
    console.log('\n📚 See EMAIL_CONFIG_GUIDE.md for detailed setup instructions\n');
    
    process.exit(1);
  }
};

// Run the test
testEmail();
