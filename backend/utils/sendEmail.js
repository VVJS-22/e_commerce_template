const nodemailer = require('nodemailer');
const logger = require('./logger');

const sendEmail = async (options) => {
  try {
    // SMTP Email Service (Gmail, Outlook, etc.)
    logger.debug('Using SMTP for email delivery');
    
    // Configure transporter based on environment
    const transporterConfig = {
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT),
      secure: process.env.EMAIL_PORT === '465', // true for 465 (SSL), false for 587 (TLS)
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      },
      connectionTimeout: 10000, // 10s connection timeout
      socketTimeout: 10000,     // 10s socket timeout
    };
    
    // TLS configuration — let Node.js auto-negotiate ciphers
    if (process.env.EMAIL_PORT === '587') {
      transporterConfig.tls = {
        rejectUnauthorized: false
      };
    }
    
    // Create transporter
    const transporter = nodemailer.createTransport(transporterConfig);
    
    // Verify transporter connection
    try {
      await transporter.verify();
      logger.debug('SMTP transporter verified successfully');
    } catch (error) {
      logger.error('SMTP transporter verification failed:', error.message);
      throw new Error('Email service configuration error. Please check your email settings.');
    }
    
    // Define email options
    const mailOptions = {
      from: process.env.EMAIL_FROM || `${process.env.EMAIL_USER}`,
      to: options.email,
      subject: options.subject,
      html: options.message
    };
    
    // Send email
    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent via SMTP to ${options.email} - Message ID: ${info.messageId}`);
    
    return info;
    
  } catch (error) {
    logger.error(`Failed to send email to ${options.email}: ${error.message}`);
    throw error;
  }
};

module.exports = sendEmail;
