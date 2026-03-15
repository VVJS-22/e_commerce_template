const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getUsers,
  adminDeleteUser,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getOrders,
  updateOrderStatus,
} = require('../controllers/adminController');

// All admin routes require auth + admin role
router.use(protect);
router.use(authorize('admin'));

// Users
router.route('/users').get(getUsers);
router.route('/users/:id').delete(adminDeleteUser);

// Categories
router.route('/categories').get(getCategories).post(createCategory);
router.route('/categories/:id').put(updateCategory).delete(deleteCategory);

// Products
router.route('/products').get(getProducts).post(createProduct);
router.route('/products/:id').put(updateProduct).delete(deleteProduct);

// Orders
router.route('/orders').get(getOrders);
router.route('/orders/:id').put(updateOrderStatus);

module.exports = router;
