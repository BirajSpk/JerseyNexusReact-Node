const express = require('express');
const {
  getProducts,
  getProduct,
  searchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImages,
  deleteProductImage,
  updateProductImage,
  reorderProductImages,
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
router.post('/', protect, authorize('ADMIN'), createProduct);
router.put('/:id', protect, authorize('ADMIN'), updateProduct);
router.delete('/:id', protect, authorize('ADMIN'), deleteProduct);

// Product image management routes
router.post('/:id/images', protect, authorize('ADMIN'), uploadProductImages);
router.delete('/:id/images/:imageId', protect, authorize('ADMIN'), deleteProductImage);
router.put('/:id/images/:imageId', protect, authorize('ADMIN'), updateProductImage);
router.put('/:id/images/reorder', protect, authorize('ADMIN'), reorderProductImages);

module.exports = router;