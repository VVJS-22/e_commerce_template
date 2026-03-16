const Order = require('../models/Order');
const Product = require('../models/Product');
const StockReservation = require('../models/StockReservation');
const logger = require('../utils/logger');
const sendEmail = require('../utils/sendEmail');
const { customerOrderEmail, adminOrderEmail } = require('../utils/emailTemplates/orderEmails');
const razorpay = require('../config/razorpay');
const crypto = require('crypto');

const RESERVATION_TTL_MINUTES = 15;

// Helper: fire-and-forget order emails (non-blocking)
const sendOrderNotifications = async (order, user) => {
  try {
    const customer = customerOrderEmail(order, user.name);
    await sendEmail({
      email: user.email,
      subject: customer.subject,
      message: customer.html,
    });

    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail) {
      const admin = adminOrderEmail(order, user.email, user.name);
      await sendEmail({
        email: adminEmail,
        subject: admin.subject,
        message: admin.html,
      });
    }
  } catch (err) {
    logger.error(`Order email failed for order ${order._id}: ${err.message}`);
  }
};

// Helper: restore stock for a list of items
const restoreStock = async (items) => {
  for (const item of items) {
    await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
  }
};

// ----- STOCK RESERVATION -----

// @desc    Reserve stock when entering checkout (blocks for 15 min)
// @route   POST /api/orders/reserve-stock
// @access  Private
exports.reserveStock = async (req, res) => {
  try {
    const { items } = req.body; // [{ product, quantity }]

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No items to reserve' });
    }

    // Release any existing active reservation for this user first
    const existing = await StockReservation.find({ user: req.user._id, status: 'active' });
    for (const prev of existing) {
      await restoreStock(prev.items);
      prev.status = 'released';
      await prev.save();
    }

    // Validate stock & check if other users have reserved these items
    const productIds = items.map((i) => i.product);
    const products = await Product.find({ _id: { $in: productIds } });
    const productMap = {};
    products.forEach((p) => { productMap[p._id.toString()] = p; });

    // Find active reservations by OTHER users for the same products
    const otherReservations = await StockReservation.find({
      status: 'active',
      user: { $ne: req.user._id },
      'items.product': { $in: productIds },
      expiresAt: { $gt: new Date() },
    });

    // Build a map of product → total quantity reserved by others
    const reservedByOthers = {};
    for (const r of otherReservations) {
      for (const ri of r.items) {
        const pid = ri.product.toString();
        if (productIds.includes(pid)) {
          reservedByOthers[pid] = (reservedByOthers[pid] || 0) + ri.quantity;
        }
      }
    }

    const unavailableProducts = [];
    for (const item of items) {
      const prod = productMap[item.product];
      if (!prod) {
        return res.status(400).json({ success: false, message: `Product not found` });
      }
      if (prod.stock < item.quantity) {
        const heldByOthers = reservedByOthers[item.product] || 0;
        unavailableProducts.push({
          name: prod.name,
          available: prod.stock,
          requested: item.quantity,
          heldByOthers,
        });
      }
    }

    if (unavailableProducts.length > 0) {
      const heldNames = unavailableProducts.filter((p) => p.heldByOthers > 0).map((p) => p.name);
      const outOfStockNames = unavailableProducts.filter((p) => p.heldByOthers === 0).map((p) => p.name);

      let msg = '';
      if (heldNames.length > 0) {
        msg += `"${heldNames.join('", "')}" ${heldNames.length === 1 ? 'is' : 'are'} currently being checked out by another user. `;
      }
      if (outOfStockNames.length > 0) {
        msg += `"${outOfStockNames.join('", "')}" ${outOfStockNames.length === 1 ? 'is' : 'are'} out of stock. `;
      }
      msg += 'You can remove these items and proceed with the rest of your cart.';

      // Return blocked product IDs so frontend can offer to remove them
      const blockedProductIds = unavailableProducts.map((p) => {
        const entry = items.find((i) => productMap[i.product]?.name === p.name);
        return entry?.product;
      }).filter(Boolean);

      return res.status(400).json({
        success: false,
        message: msg.trim(),
        blockedProducts: unavailableProducts.map((p) => ({
          id: items.find((i) => productMap[i.product]?.name === p.name)?.product,
          name: p.name,
          reason: p.heldByOthers > 0 ? 'reserved' : 'out_of_stock',
        })),
      });
    }

    // Deduct stock atomically
    const deducted = [];
    for (const item of items) {
      const result = await Product.findOneAndUpdate(
        { _id: item.product, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { new: true }
      );
      if (!result) {
        // Rollback
        await restoreStock(deducted);
        const prod = productMap[item.product];
        return res.status(400).json({
          success: false,
          message: `"${prod?.name || 'A product'}" was just checked out by another user. You can remove it and proceed with the rest of your cart.`,
          blockedProducts: [{
            id: item.product,
            name: prod?.name || 'Unknown product',
            reason: 'reserved',
          }],
        });
      }
      deducted.push(item);
    }

    // Create reservation
    const expiresAt = new Date(Date.now() + RESERVATION_TTL_MINUTES * 60 * 1000);
    const reservation = await StockReservation.create({
      user: req.user._id,
      items: items.map((i) => ({ product: i.product, quantity: i.quantity })),
      expiresAt,
      status: 'active',
    });

    logger.info(`Stock reserved: ${reservation._id} for user ${req.user.email}, expires ${expiresAt.toISOString()}`);

    res.status(201).json({
      success: true,
      data: {
        reservationId: reservation._id,
        expiresAt,
      },
    });
  } catch (err) {
    logger.error(`Reserve stock error: ${err.message}`);
    res.status(500).json({ success: false, message: 'Failed to reserve stock' });
  }
};

// @desc    Release a stock reservation (user leaves checkout)
// @route   POST /api/orders/release-stock
// @access  Private
exports.releaseStock = async (req, res) => {
  try {
    const { reservationId } = req.body;

    if (!reservationId) {
      return res.status(400).json({ success: false, message: 'Reservation ID is required' });
    }

    const reservation = await StockReservation.findById(reservationId);

    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }

    // Only the owner can release
    if (reservation.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Only release active reservations
    if (reservation.status !== 'active') {
      return res.json({ success: true, message: 'Reservation already ' + reservation.status });
    }

    // Restore stock
    await restoreStock(reservation.items);

    reservation.status = 'released';
    await reservation.save();

    logger.info(`Stock released: ${reservation._id} by user ${req.user.email}`);

    res.json({ success: true, message: 'Stock released successfully' });
  } catch (err) {
    logger.error(`Release stock error: ${err.message}`);
    res.status(500).json({ success: false, message: 'Failed to release stock' });
  }
};

// ----- ORDERS -----

// Helper: validate reservation and return it (or send error response)
const validateReservation = async (reservationId, userId, res) => {
  if (!reservationId) {
    res.status(400).json({ success: false, message: 'No stock reservation. Please go back and try again.' });
    return null;
  }

  const reservation = await StockReservation.findById(reservationId);

  if (!reservation) {
    res.status(400).json({ success: false, message: 'Reservation not found. Please go back and try again.' });
    return null;
  }

  if (reservation.user.toString() !== userId.toString()) {
    res.status(403).json({ success: false, message: 'Not authorized' });
    return null;
  }

  if (reservation.status !== 'active') {
    const reservedProductIds = reservation.items.map((i) => i.product);
    const reservedProducts = await Product.find({ _id: { $in: reservedProductIds } }).select('name');
    const productNames = reservedProducts.map((p) => p.name).join(', ');
    res.status(400).json({
      success: false,
      message: `"${productNames}" ${reservedProducts.length === 1 ? 'is' : 'are'} currently being checked out by another user. Please update your cart and try again.`,
    });
    return null;
  }

  if (new Date() > reservation.expiresAt) {
    await restoreStock(reservation.items);
    reservation.status = 'expired';
    await reservation.save();

    const reservedProductIds = reservation.items.map((i) => i.product);
    const reservedProducts = await Product.find({ _id: { $in: reservedProductIds } }).select('name');
    const productNames = reservedProducts.map((p) => p.name).join(', ');
    res.status(400).json({
      success: false,
      message: `"${productNames}" ${reservedProducts.length === 1 ? 'is' : 'are'} currently being checked out by another user. Please update your cart and try again.`,
    });
    return null;
  }

  return reservation;
};

// @desc    Create a Razorpay order (for online payments)
// @route   POST /api/orders/create-razorpay-order
// @access  Private
exports.createRazorpayOrder = async (req, res) => {
  try {
    const { grandTotal, reservationId } = req.body;

    // Validate reservation is still active
    const reservation = await validateReservation(reservationId, req.user._id, res);
    if (!reservation) return;

    const options = {
      amount: Math.round(grandTotal * 100), // Razorpay expects amount in paise
      currency: 'INR',
      receipt: `rcpt_${reservationId}`,
      notes: {
        userId: req.user._id.toString(),
        reservationId: reservationId,
      },
    };

    const razorpayOrder = await razorpay.orders.create(options);

    logger.info(`Razorpay order created: ${razorpayOrder.id} for reservation ${reservationId}`);

    res.status(201).json({
      success: true,
      data: {
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (err) {
    logger.error(`Create Razorpay order error: ${err.message}`);
    res.status(500).json({ success: false, message: 'Failed to initiate payment' });
  }
};

// @desc    Verify Razorpay payment and create order
// @route   POST /api/orders/verify-payment
// @access  Private
exports.verifyPaymentAndCreateOrder = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      items,
      shippingAddress,
      itemsTotal,
      deliveryCharge,
      grandTotal,
      reservationId,
    } = req.body;

    // 1. Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      logger.warn(`Payment signature mismatch for order ${razorpay_order_id}`);
      return res.status(400).json({ success: false, message: 'Payment verification failed. Please contact support.' });
    }

    // 2. Validate reservation
    const reservation = await validateReservation(reservationId, req.user._id, res);
    if (!reservation) return;

    // 3. Create the order
    const order = await Order.create({
      user: req.user._id,
      items,
      shippingAddress,
      paymentMethod: 'razorpay',
      paymentStatus: 'paid',
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      itemsTotal,
      deliveryCharge,
      grandTotal,
    });

    // 4. Mark reservation as completed
    reservation.status = 'completed';
    await reservation.save();

    logger.info(`Order created (Razorpay): ${order._id} by ${req.user.email} | Payment: ${razorpay_payment_id}`);

    // Send order confirmation emails (non-blocking)
    sendOrderNotifications(order, req.user);

    res.status(201).json({ success: true, data: order });
  } catch (err) {
    logger.error(`Verify payment error: ${err.message}`);
    res.status(500).json({ success: false, message: 'Failed to verify payment' });
  }
};

// @desc    Create a new order — COD (consumes an active reservation)
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, itemsTotal, deliveryCharge, grandTotal, reservationId } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No order items' });
    }

    // Only COD orders go through this route now
    if (paymentMethod !== 'cod') {
      return res.status(400).json({ success: false, message: 'Use the Razorpay payment flow for online payments.' });
    }

    // Validate reservation
    const reservation = await validateReservation(reservationId, req.user._id, res);
    if (!reservation) return;

    // Stock was already deducted during reservation — just create the order
    const order = await Order.create({
      user: req.user._id,
      items,
      shippingAddress,
      paymentMethod: 'cod',
      paymentStatus: 'cod',
      itemsTotal,
      deliveryCharge,
      grandTotal,
    });

    // Mark reservation as completed
    reservation.status = 'completed';
    await reservation.save();

    logger.info(`Order created (COD): ${order._id} by user ${req.user.email} (reservation ${reservationId})`);

    // Send order confirmation emails (non-blocking)
    sendOrderNotifications(order, req.user);

    res.status(201).json({ success: true, data: order });
  } catch (err) {
    logger.error(`Create order error: ${err.message}`);
    res.status(500).json({ success: false, message: 'Failed to place order' });
  }
};

// @desc    Get logged-in user's orders
// @route   GET /api/orders/my
// @access  Private
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .select('-__v');

    res.json({ success: true, count: orders.length, data: orders });
  } catch (err) {
    logger.error(`Get orders error: ${err.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get single order by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).select('-__v');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, data: order });
  } catch (err) {
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    logger.error(`Get order error: ${err.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ----- CLEANUP: Expire stale reservations -----

exports.cleanupExpiredReservations = async () => {
  try {
    const expired = await StockReservation.find({
      status: 'active',
      expiresAt: { $lt: new Date() },
    });

    for (const reservation of expired) {
      await restoreStock(reservation.items);
      reservation.status = 'expired';
      await reservation.save();
      logger.info(`Reservation expired & stock restored: ${reservation._id}`);
    }

    if (expired.length > 0) {
      logger.info(`Cleaned up ${expired.length} expired reservation(s)`);
    }
  } catch (err) {
    logger.error(`Reservation cleanup error: ${err.message}`);
  }
};

// @desc    Release stock via sendBeacon (no auth, uses reservationId only)
// @route   POST /api/orders/release-stock-beacon
// @access  Public (intentionally — only releases by reservationId)
exports.releaseStockBeacon = async (req, res) => {
  try {
    const { reservationId } = req.body;
    if (!reservationId) return res.status(200).end();

    const reservation = await StockReservation.findById(reservationId);
    if (!reservation || reservation.status !== 'active') return res.status(200).end();

    await restoreStock(reservation.items);
    reservation.status = 'released';
    await reservation.save();

    logger.info(`Stock released via beacon: ${reservation._id}`);
    res.status(200).end();
  } catch (err) {
    logger.error(`Beacon release error: ${err.message}`);
    res.status(200).end(); // always 200 for beacon
  }
};
