const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

// Log when a user is rate-limited
const logLimited = (req, res, options) => {
  logger.warn(`Rate limit exceeded: ${req.ip} → ${req.method} ${req.originalUrl}`);
};

// ─── Global API limiter ─────────────────────────────────────
// 100 requests per 15 minutes per IP across all routes
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,    // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false,     // Disable `X-RateLimit-*` headers
  handler: (req, res, next, options) => {
    logLimited(req, res, options);
    res.status(429).json({
      success: false,
      message: 'Too many requests. Please try again later.',
    });
  },
});

// ─── Auth limiter (login, register) ─────────────────────────
// 10 attempts per 15 minutes per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    logLimited(req, res, options);
    res.status(429).json({
      success: false,
      message: 'Too many authentication attempts. Please try again after 15 minutes.',
    });
  },
});

// ─── Password reset / email verification limiter ────────────
// 5 attempts per 15 minutes per IP
const sensitiveOpsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    logLimited(req, res, options);
    res.status(429).json({
      success: false,
      message: 'Too many requests for this operation. Please try again after 15 minutes.',
    });
  },
});

// ─── Order creation limiter ─────────────────────────────────
// 10 orders per 15 minutes per IP
const orderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    logLimited(req, res, options);
    res.status(429).json({
      success: false,
      message: 'Too many order requests. Please try again later.',
    });
  },
});

// ─── Upload limiter ─────────────────────────────────────────
// 20 uploads per 15 minutes per IP
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    logLimited(req, res, options);
    res.status(429).json({
      success: false,
      message: 'Too many upload requests. Please try again later.',
    });
  },
});

module.exports = {
  globalLimiter,
  authLimiter,
  sensitiveOpsLimiter,
  orderLimiter,
  uploadLimiter,
};
