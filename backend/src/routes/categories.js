const express = require('express');
const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const { protect, authorize } = require('../middlewares/auth');
const { validateCategory } = require('../validators/validation');

const router = express.Router();

// Public routes
router.get('/', getCategories);

// Admin routes
router.post('/', protect, authorize('ADMIN'), validateCategory, createCategory);
router.put('/:id', protect, authorize('ADMIN'), updateCategory);
router.delete('/:id', protect, authorize('ADMIN'), deleteCategory);

module.exports = router;