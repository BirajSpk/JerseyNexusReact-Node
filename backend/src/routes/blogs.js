const express = require('express');
const {
  getBlogs,
  getBlog,
  createBlog,
  updateBlog,
  deleteBlog,
} = require('../controllers/blogController');
const { protect, authorize } = require('../middlewares/auth');
const { validateBlog } = require('../utils/validation');

const router = express.Router();

// Public routes
router.get('/', getBlogs);
router.get('/:slug', getBlog);

// Admin routes
router.post('/', protect, authorize('ADMIN'), validateBlog, createBlog);
router.put('/:id', protect, authorize('ADMIN'), updateBlog);
router.delete('/:id', protect, authorize('ADMIN'), deleteBlog);

module.exports = router;