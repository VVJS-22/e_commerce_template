const Order = require('../models/Order');
const Product = require('../models/Product');
const StockReservation = require('../models/StockReservation');
const logger = require('../utils/logger');
const sendEmail = require('../utils/sendEmail');
const { customerOrderEmail, adminOrderEmail } = require('../utils/emailTemplates/orderEmails');

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

// @desc    Create a new order (consumes an active reservation)
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, itemsTotal, deliveryCharge, grandTotal, reservationId } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No order items' });
    }

    if (!reservationId) {
      return res.status(400).json({ success: false, message: 'No stock reservation. Please go back and try again.' });
    }

    // Validate reservation
    const reservation = await StockReservation.findById(reservationId);

    if (!reservation) {
      return res.status(400).json({ success: false, message: 'Reservation not found. Please go back and try again.' });
    }

    if (reservation.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (reservation.status !== 'active') {
      // Look up product names for clearer messaging
      const reservedProductIds = reservation.items.map((i) => i.product);
      const reservedProducts = await Product.find({ _id: { $in: reservedProductIds } }).select('name');
      const productNames = reservedProducts.map((p) => p.name).join(', ');

      if (reservation.status === 'expired') {
        return res.status(400).json({
          success: false,
          message: `"${productNames}" ${reservedProducts.length === 1 ? 'is' : 'are'} currently being checked out by another user. Please update your cart and try again.`,
        });
      }
      return res.status(400).json({
        success: false,
        message: `"${productNames}" ${reservedProducts.length === 1 ? 'is' : 'are'} currently being checked out by another user. Please update your cart and try again.`,
      });
    }

    if (new Date() > reservation.expiresAt) {
      // Expired but not yet cleaned up — restore stock and mark expired
      await restoreStock(reservation.items);
      reservation.status = 'expired';
      await reservation.save();

      const reservedProductIds = reservation.items.map((i) => i.product);
      const reservedProducts = await Product.find({ _id: { $in: reservedProductIds } }).select('name');
      const productNames = reservedProducts.map((p) => p.name).join(', ');

      return res.status(400).json({
        success: false,
        message: `"${productNames}" ${reservedProducts.length === 1 ? 'is' : 'are'} currently being checked out by another user. Please update your cart and try again.`,
      });
    }

    // Stock was already deducted during reservation — just create the order
    const order = await Order.create({
      user: req.user._id,
      items,
      shippingAddress,
      paymentMethod,
      itemsTotal,
      deliveryCharge,
      grandTotal,
    });

    // Mark reservation as completed
    reservation.status = 'completed';
    await reservation.save();

    logger.info(`Order created: ${order._id} by user ${req.user.email} (reservation ${reservationId})`);

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
