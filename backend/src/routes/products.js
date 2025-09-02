const express = require('express');
const {
  getProducts,
  getProduct,
  searchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { protect, authorize } = require('../middlewares/auth');
const { validateProduct } = require('../utils/validation');

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/search', searchProducts);
router.get('/slug/:slug', getProduct);
router.get('/:id', getProduct);

// Admin routes
router.post('/', protect, authorize('ADMIN'), validateProduct, createProduct);
router.put('/:id', protect, authorize('ADMIN'), updateProduct);
router.delete('/:id', protect, authorize('ADMIN'), deleteProduct);

module.exports = router;