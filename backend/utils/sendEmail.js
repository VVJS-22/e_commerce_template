const nodemailer = require('nodemailer');
const logger = require('./logger');

const sendEmail = async (options) => {
  const port = parseInt(process.env.EMAIL_PORT) || 465;
  const isSSL = port === 465;
  const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASSWORD;

  logger.info(`SMTP config: host=${host}, port=${port}, secure=${isSSL}, user=${user}, passLen=${pass ? pass.length : 0}`);

  if (!host || !user || !pass) {
    logger.error('SMTP env vars missing! EMAIL_HOST, EMAIL_USER, or EMAIL_PASSWORD is empty.');
    throw new Error('Email configuration incomplete');
  }

  const transporterConfig = {
    host,
    port,
    secure: isSSL,
    auth: { user, pass },
    connectionTimeout: 30000,
    greetingTimeout: 30000,
    socketTimeout: 30000,
  };

  if (!isSSL) {
    // Port 587: require STARTTLS upgrade — fail if TLS handshake fails
    transporterConfig.requireTLS = true;
    transporterConfig.tls = { minVersion: 'TLSv1.2' };
  }

  const transporter = nodemailer.createTransport(transporterConfig);

  // Verify SMTP connection
  try {
    await transporter.verify();
    logger.info('SMTP verify OK');
  } catch (verifyErr) {
    logger.error(`SMTP verify FAILED: [${verifyErr.code || ''}] ${verifyErr.message}`);
    // Still attempt to send — some providers fail verify but accept mail
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM || user,
    to: options.email,
    subject: options.subject,
    html: options.message
  };

  logger.info(`Attempting sendMail to ${options.email}...`);

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email SENT to ${options.email} — msgId=${info.messageId}, response=${info.response}`);
    return info;
  } catch (sendErr) {
    logger.error(`sendMail FAILED to ${options.email}: [${sendErr.code || 'UNKNOWN'}] ${sendErr.message}`);
    throw sendErr;
  }
};

module.exports = sendEmail;
