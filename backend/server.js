const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const connectDB = require('./config/db');
const logger = require('./utils/logger');
const {
  globalLimiter,
  authLimiter,
  orderLimiter,
  uploadLimiter,
} = require('./middleware/rateLimiter');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Route files
const authRoutes = require('./routes/auth');
const categoryRoutes = require('./routes/categories');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const adminRoutes = require('./routes/admin');
const uploadRoutes = require('./routes/upload');

const app = express();

// ─── Security middleware ────────────────────────────────────

// Set security HTTP headers (XSS, content-type sniffing, clickjacking, etc.)
app.use(helmet());

// Body parser with size limits to prevent large payload attacks
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Sanitize data — prevent NoSQL injection ($gt, $ne, etc.)
app.use(mongoSanitize());

// Prevent HTTP parameter pollution (duplicate query params)
app.use(hpp({
  whitelist: ['scale', 'sort', 'category'], // allow duplicates for filter params
}));

// Enable CORS
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL
    : '*',
  credentials: true,
};
app.use(cors(corsOptions));

// Trust proxy (needed for rate limiting behind reverse proxies like Render/Railway)
app.set('trust proxy', 1);

// Global rate limiter — 100 req / 15 min per IP
app.use('/api', globalLimiter);

// HTTP request logging
app.use(morgan('combined', { stream: logger.stream }));

// ─── Mount routers with route-specific rate limits ─────────

// Auth routes: stricter 10 req / 15 min
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
// Order routes: 10 orders / 15 min
app.use('/api/orders', orderLimiter, orderRoutes);
app.use('/api/admin', adminRoutes);
// Upload routes: 20 uploads / 15 min
app.use('/api/upload', uploadLimiter, uploadRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'E-commerce API is running'
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  logger.info(`Backend API available at http://localhost:${PORT}`);
});

// Cleanup expired stock reservations every 60 seconds
const { cleanupExpiredReservations } = require('./controllers/orderController');
setInterval(cleanupExpiredReservations, 60 * 1000);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  logger.error(`Unhandled Rejection: ${err.message}`, { stack: err.stack });
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err.message}`, { stack: err.stack });
  process.exit(1);
});
