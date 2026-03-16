const Category = require('../models/Category');
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const StockReservation = require('../models/StockReservation');
const logger = require('../utils/logger');
const sendEmail = require('../utils/sendEmail');
const { orderCancelledEmail } = require('../utils/emailTemplates/orderEmails');

// ═══════════════════════════════════════════════════════════
//  USERS
// ═══════════════════════════════════════════════════════════

// @desc    Get all users
// @route   GET /api/admin/users
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find()
      .sort({ createdAt: -1 })
      .select('-__v -resetPasswordToken -resetPasswordExpire -emailVerificationToken -emailVerificationExpire');

    // Get order counts per user
    const orderCounts = await Order.aggregate([
      { $group: { _id: '$user', count: { $sum: 1 } } }
    ]);
    const orderMap = Object.fromEntries(
      orderCounts.map((o) => [o._id.toString(), o.count])
    );

    const data = users.map((u) => ({
      ...u.toObject(),
      orderCount: orderMap[u._id.toString()] || 0,
    }));

    res.json({ success: true, count: data.length, data });
  } catch (err) {
    logger.error(`Admin getUsers: ${err.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete a user (admin)
// @route   DELETE /api/admin/users/:id
exports.adminDeleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // Prevent admin from deleting themselves
    if (userId === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account from the admin panel'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Release any active stock reservations
    const activeReservations = await StockReservation.find({
      user: userId,
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

    await User.findByIdAndDelete(userId);

    logger.info(`Admin deleted user: ${user.email} (by ${req.user.email})`);
    res.json({ success: true, message: `User ${user.email} deleted successfully` });
  } catch (err) {
    logger.error(`Admin deleteUser: ${err.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ═══════════════════════════════════════════════════════════
//  CATEGORIES
// ═══════════════════════════════════════════════════════════

// @desc    Get all categories (including inactive)
// @route   GET /api/admin/categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find()
      .sort({ sortOrder: 1, name: 1 })
      .select('-__v');
    res.json({ success: true, count: categories.length, data: categories });
  } catch (err) {
    logger.error(`Admin getCategories: ${err.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Create category
// @route   POST /api/admin/categories
exports.createCategory = async (req, res) => {
  try {
    const { slug, ...categoryData } = req.body; // ignore any slug from client
    const category = await Category.create(categoryData);
    logger.info(`Category created: ${category.slug} by ${req.user.email}`);
    res.status(201).json({ success: true, data: category });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'A category with this name already exists' });
    }
    logger.error(`Admin createCategory: ${err.message}`);
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Update category
// @route   PUT /api/admin/categories/:id
exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    logger.info(`Category updated: ${category.slug} by ${req.user.email}`);
    res.json({ success: true, data: category });
  } catch (err) {
    logger.error(`Admin updateCategory: ${err.message}`);
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Delete category
// @route   DELETE /api/admin/categories/:id
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    logger.info(`Category deleted: ${category.slug} by ${req.user.email}`);
    res.json({ success: true, data: {} });
  } catch (err) {
    logger.error(`Admin deleteCategory: ${err.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ═══════════════════════════════════════════════════════════
//  PRODUCTS
// ═══════════════════════════════════════════════════════════

// @desc    Get all products (including inactive)
// @route   GET /api/admin/products
exports.getProducts = async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    const products = await Product.find(filter)
      .sort({ createdAt: -1 })
      .select('-__v');
    res.json({ success: true, count: products.length, data: products });
  } catch (err) {
    logger.error(`Admin getProducts: ${err.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Create product
// @route   POST /api/admin/products
exports.createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    logger.info(`Product created: ${product.name} by ${req.user.email}`);
    res.status(201).json({ success: true, data: product });
  } catch (err) {
    logger.error(`Admin createProduct: ${err.message}`);
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Update product
// @route   PUT /api/admin/products/:id
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    logger.info(`Product updated: ${product.name} by ${req.user.email}`);
    res.json({ success: true, data: product });
  } catch (err) {
    logger.error(`Admin updateProduct: ${err.message}`);
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Delete product
// @route   DELETE /api/admin/products/:id
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    logger.info(`Product deleted: ${product.name} by ${req.user.email}`);
    res.json({ success: true, data: {} });
  } catch (err) {
    logger.error(`Admin deleteProduct: ${err.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ═══════════════════════════════════════════════════════════
//  ORDERS
// ═══════════════════════════════════════════════════════════

// @desc    Get all orders (admin)
// @route   GET /api/admin/orders
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .select('-__v');
    res.json({ success: true, count: orders.length, data: orders });
  } catch (err) {
    logger.error(`Admin getOrders: ${err.message}`);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update order status
// @route   PUT /api/admin/orders/:id
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    // Get the order BEFORE updating to check previous status
    const prevOrder = await Order.findById(req.params.id);
    if (!prevOrder) return res.status(404).json({ success: false, message: 'Order not found' });

    const prevStatus = prevOrder.status;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate('user', 'name email');

    // Restore stock when order is cancelled (and wasn't already cancelled)
    if (status === 'cancelled' && prevStatus !== 'cancelled') {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity },
        });
      }
      logger.info(`Stock restored for cancelled order ${order._id}: ${order.items.map(i => `${i.name} x${i.quantity}`).join(', ')}`);

      // Send cancellation email to customer (non-blocking)
      if (order.user?.email) {
        const emailData = orderCancelledEmail(order, order.user.name);
        sendEmail({
          email: order.user.email,
          subject: emailData.subject,
          message: emailData.html,
        }).catch((err) => logger.error(`Cancellation email failed for order ${order._id}: ${err.message}`));
      }
    }

    logger.info(`Order ${order._id} status → ${status} by ${req.user.email}`);
    res.json({ success: true, data: order });
  } catch (err) {
    logger.error(`Admin updateOrder: ${err.message}`);
    res.status(400).json({ success: false, message: err.message });
  }
};
