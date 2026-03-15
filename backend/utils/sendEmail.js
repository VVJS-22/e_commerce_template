const nodemailer = require('nodemailer');
const logger = require('./logger');

const sendEmail = async (options) => {
  try {
    const port = parseInt(process.env.EMAIL_PORT) || 465;
    const isSSL = port === 465;

    logger.info(`SMTP config: host=${process.env.EMAIL_HOST}, port=${port}, secure=${isSSL}, user=${process.env.EMAIL_USER}`);

    const transporterConfig = {
      host: process.env.EMAIL_HOST,
      port,
      secure: isSSL,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      },
      connectionTimeout: 30000,
      greetingTimeout: 30000,
      socketTimeout: 30000,
      logger: false,
      debug: false,
    };

    // For STARTTLS (port 587), allow self-signed certs
    if (!isSSL) {
      transporterConfig.tls = { rejectUnauthorized: false };
    }

    const transporter = nodemailer.createTransport(transporterConfig);

    // Non-fatal verify — log warning but still attempt to send
    try {
      await transporter.verify();
      logger.info('SMTP transporter verified successfully');
    } catch (verifyErr) {
      logger.warn(`SMTP verify failed (will still attempt send): ${verifyErr.code || ''} ${verifyErr.message}`);
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: options.email,
      subject: options.subject,
      html: options.message
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent via SMTP to ${options.email} - Message ID: ${info.messageId}`);
    return info;

  } catch (error) {
    logger.error(`Failed to send email to ${options.email}: [${error.code || 'UNKNOWN'}] ${error.message}`);
    throw error;
  }
};

module.exports = sendEmail;
