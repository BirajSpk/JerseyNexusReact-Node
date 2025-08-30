const express = require('express');
const {
  getOrders,
  createOrder,
  updateOrderStatus,
} = require('../controllers/orderController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

// Apply protect middleware to all routes
router.use(protect);

// User routes
router.get('/', getOrders);
router.post('/', createOrder);

// Admin routes
router.put('/:id', authorize('ADMIN'), updateOrderStatus);

module.exports = router;