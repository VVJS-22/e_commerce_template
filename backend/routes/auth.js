const express = require('express');
const {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  logout,
  verifyEmail,
  resendVerification,
  deleteAccount
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { sensitiveOpsLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/forgotpassword', sensitiveOpsLimiter, forgotPassword);
router.put('/resetpassword/:resettoken', sensitiveOpsLimiter, resetPassword);
router.get('/logout', protect, logout);
router.delete('/delete-account', protect, deleteAccount);
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', sensitiveOpsLimiter, resendVerification);

module.exports = router;
