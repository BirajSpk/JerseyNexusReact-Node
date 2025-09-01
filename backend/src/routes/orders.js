const express = require('express');
const {
  getOrders,
  getOrder,
  createOrder,
  updateOrderStatus,
  deleteOrder,
} = require('../controllers/orderController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

// Apply protect middleware to all routes
router.use(protect);

// User routes
router.get('/', getOrders);
router.get('/:id', getOrder);
router.post('/', createOrder);

// Admin routes
router.put('/:id', authorize('ADMIN'), updateOrderStatus);
router.delete('/:id', authorize('ADMIN'), deleteOrder);

module.exports = router;