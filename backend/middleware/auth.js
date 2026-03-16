const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');

// Protect routes - authentication middleware
// Supports both real users and guest tokens
exports.protect = async (req, res, next) => {
  let token;
  
  // Check if token exists in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  
  // Make sure token exists
  if (!token) {
    logger.warn('Unauthorized access attempt - no token provided');
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
  
  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Handle guest tokens (id starts with "guest_")
    if (decoded.role === 'guest') {
      req.user = {
        _id: decoded.id,
        id: decoded.id,
        name: 'Guest',
        email: null,
        role: 'guest',
        emailVerified: false,
        isGuest: true
      };
      logger.debug(`Authenticated guest: ${decoded.id}`);
      return next();
    }
    
    req.user = await User.findById(decoded.id);
    
    if (!req.user) {
      logger.warn(`Unauthorized access - invalid user ID: ${decoded.id}`);
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }
    
    logger.debug(`Authenticated user: ${req.user.email}`);
    
    next();
  } catch (error) {
    logger.error(`Auth middleware error: ${error.message}`);
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};

// Require verified email (blocks guests and unverified users)
exports.requireVerifiedEmail = (req, res, next) => {
  if (req.user.isGuest) {
    return res.status(403).json({
      success: false,
      message: 'Please create an account to proceed with checkout.',
      requiresAccount: true
    });
  }

  if (!req.user.emailVerified) {
    return res.status(403).json({
      success: false,
      message: 'Please verify your email to proceed with checkout.',
      requiresVerification: true
    });
  }

  next();
};
