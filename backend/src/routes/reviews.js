const express = require('express');
const {
  getProductReviews,
  createReview,
  deleteReview,
} = require('../controllers/reviewController');
const { protect } = require('../middlewares/auth');
const { validateReview } = require('../utils/validation');

const router = express.Router();

// Public routes
router.get('/product/:productId', getProductReviews);

// Private routes
router.post('/', protect, validateReview, createReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;