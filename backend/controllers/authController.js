const User = require('../models/User');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');
const { verificationEmail } = require('../utils/emailTemplates/verificationEmail');
const logger = require('../utils/logger');

// Helper: check if email is whitelisted (auto-verified)
const isWhitelistedEmail = (email) => email.toLowerCase().endsWith('@test.com');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    logger.info(`Registration attempt for email: ${email}`);
    
    // Validate required fields
    if (!name || !email || !password) {
      logger.warn(`Registration failed - missing fields for email: ${email}`);
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email and password'
      });
    }
    
    // Check if user already exists
    const userExists = await User.findOne({ email });
    
    if (userExists) {
      logger.warn(`Registration failed - user already exists: ${email}`);
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }
    
    // Auto-verify whitelisted emails (@test.com)
    const whitelisted = isWhitelistedEmail(email);
    
    // Create user
    const user = await User.create({
      name,
      email,
      password,
      emailVerified: whitelisted
    });
    
    if (whitelisted) {
      logger.info(`User registered (whitelisted, auto-verified): ${email}`);
      return sendTokenResponse(user, 201, res);
    }
    
    // Generate verification token and send email
    const verificationToken = user.getEmailVerificationToken();
    await user.save({ validateBeforeSave: false });
    
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const verifyUrl = `${frontendUrl}/verify-email/${verificationToken}`;
    
    try {
      await sendEmail({
        email: user.email,
        subject: 'Verify Your Email - Crazy Wheelz Diecast',
        message: verificationEmail(user.name, verifyUrl)
      });
      
      logger.info(`Verification email sent to: ${email}`);
    } catch (emailErr) {
      logger.error(`*** VERIFICATION EMAIL FAILED for ${email}: [${emailErr.code || ''}] ${emailErr.message}`);
      // Don't fail registration if email fails — user can resend later
    }
    
    logger.info(`User registered (verification required): ${email}`);
    res.status(201).json({
      success: true,
      requiresVerification: true,
      message: 'Registration successful! Please check your email to verify your account.'
    });
  } catch (error) {
    logger.error(`Registration error for ${req.body.email}: ${error.message}`, { stack: error.stack });
    res.status(500).json({
      success: false,
      message: error.message || 'Registration failed'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    logger.info(`Login attempt for email: ${email}`);
    
    // Validate email & password
    if (!email || !password) {
      logger.warn(`Login failed - missing credentials for: ${email}`);
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }
    
    // Check for user
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      logger.warn(`Login failed - user not found: ${email}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Check if password matches
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      logger.warn(`Login failed - invalid password for: ${email}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Check if email is verified
    if (!user.emailVerified) {
      logger.warn(`Login failed - email not verified: ${email}`);
      return res.status(403).json({
        success: false,
        message: 'Please verify your email before logging in. Check your inbox for the verification link.',
        emailNotVerified: true
      });
    }
    
    logger.info(`User logged in successfully: ${email}`);
    sendTokenResponse(user, 200, res);
  } catch (error) {
    logger.error(`Login error for ${req.body.email}: ${error.message}`, { stack: error.stack });
    res.status(500).json({
      success: false,
      message: error.message || 'Login failed'
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    
    logger.info(`Password reset requested for: ${req.body.email}`);
    
    if (!user) {
      logger.warn(`Password reset failed - user not found: ${req.body.email}`);
      return res.status(404).json({
        success: false,
        message: 'No user found with that email'
      });
    }
    
    // Get reset token
    const resetToken = user.getResetPasswordToken();
    
    await user.save({ validateBeforeSave: false });
    
    // Create reset url - Use frontend URL
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;
    
    const message = `
      <h1>You have requested a password reset</h1>
      <p>Please click the link below to reset your password:</p>
      <a href="${resetUrl}" clicktracking=off>${resetUrl}</a>
      <p>This link will expire in 10 minutes.</p>
      <p>If you did not request this, please ignore this email.</p>
    `;
    
    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Reset Request',
        message
      });
      
      logger.info(`Password reset email sent to: ${user.email}`);
      res.status(200).json({
        success: true,
        message: 'Email sent successfully'
      });
    } catch (error) {
      logger.error(`Failed to send password reset email to ${user.email}: ${error.message}`);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      
      await user.save({ validateBeforeSave: false });
      
      return res.status(500).json({
        success: false,
        message: 'Email could not be sent'
      });
    }
  } catch (error) {
    logger.error(`Forgot password error: ${error.message}`, { stack: error.stack });
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Reset password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');
      
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
    
    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    // User proved email ownership by clicking the reset link — mark verified
    if (!user.emailVerified) {
      user.emailVerified = true;
    }
    await user.save();
    
    sendTokenResponse(user, 200, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Logout user / clear cookie
// @route   GET /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  logger.info(`User logged out: ${req.user?.email || 'Unknown'}`);
  res.status(200).json({
    success: true,
    message: 'User logged out successfully'
  });
};

// @desc    Verify email token
// @route   GET /api/auth/verify-email/:token
// @access  Public
exports.verifyEmail = async (req, res) => {
  try {
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    // Look up by token WITHOUT expiry check first
    // This handles email-client prefetch + user click scenarios
    const user = await User.findOne({ emailVerificationToken: hashedToken });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification link'
      });
    }

    // Already verified (email client prefetched the link before user clicked)
    if (user.emailVerified) {
      // Now safe to clear the token
      user.emailVerificationToken = undefined;
      user.emailVerificationExpire = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(200).json({
        success: true,
        message: 'Email verified successfully! You can now log in.'
      });
    }

    // Check if token has expired
    if (user.emailVerificationExpire < Date.now()) {
      return res.status(400).json({
        success: false,
        message: 'Verification link has expired. Please request a new one.'
      });
    }

    // Verify the email — keep token so a second request can still find the user
    user.emailVerified = true;
    await user.save({ validateBeforeSave: false });

    logger.info(`Email verified for: ${user.email}`);
    res.status(200).json({
      success: true,
      message: 'Email verified successfully! You can now log in.'
    });
  } catch (error) {
    logger.error(`Email verification error: ${error.message}`, { stack: error.stack });
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Resend verification email
// @route   POST /api/auth/resend-verification
// @access  Public
exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email address'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Don't reveal if user exists — generic success
      return res.status(200).json({
        success: true,
        message: 'If an account exists with this email, a verification link has been sent.'
      });
    }

    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: 'This email is already verified. Please log in.'
      });
    }

    const verificationToken = user.getEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const verifyUrl = `${frontendUrl}/verify-email/${verificationToken}`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Verify Your Email - Crazy Wheelz Diecast',
        message: verificationEmail(user.name, verifyUrl)
      });
      logger.info(`Resent verification email to: ${email}`);
    } catch (emailErr) {
      logger.error(`Failed to resend verification email to ${email}: ${emailErr.message}`);
      return res.status(500).json({
        success: false,
        message: 'Failed to send verification email. Please try again later.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'If an account exists with this email, a verification link has been sent.'
    });
  } catch (error) {
    logger.error(`Resend verification error: ${error.message}`, { stack: error.stack });
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete user account
// @route   DELETE /api/auth/delete-account
// @access  Private
exports.deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your password to confirm account deletion'
      });
    }

    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password'
      });
    }

    // Release any active stock reservations
    const StockReservation = require('../models/StockReservation');
    const Product = require('../models/Product');
    const activeReservations = await StockReservation.find({
      user: user._id,
      status: 'active'
    });

    for (const reservation of activeReservations) {
      for (const item of reservation.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity }
        });
      }
      reservation.status = 'released';
      await reservation.save();
    }

    await User.findByIdAndDelete(user._id);

    logger.info(`Account deleted: ${user.email}`);
    res.status(200).json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    logger.error(`Delete account error: ${error.message}`, { stack: error.stack });
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Helper function to get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();
  
  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_EXPIRE || 7 * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };
  
  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }
  
  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
};
