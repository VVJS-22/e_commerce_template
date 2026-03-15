const express = require('express');
const router = express.Router();
const { createOrder, getMyOrders, getOrder, reserveStock, releaseStock, releaseStockBeacon } = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

// Beacon route — no auth (used by navigator.sendBeacon on page close)
router.post('/release-stock-beacon', releaseStockBeacon);

router.use(protect); // All other order routes require authentication

router.post('/', createOrder);
router.post('/reserve-stock', reserveStock);
router.post('/release-stock', releaseStock);
router.get('/my', getMyOrders);
router.get('/:id', getOrder);

module.exports = router;
