const express = require('express');
const {
  getBlogs,
  getBlog,
  createBlog,
  updateBlog,
  deleteBlog,
} = require('../controllers/blogController');
const { protect, authorize, optionalAuth } = require('../middlewares/auth');
const { validateBlog } = require('../utils/validation');
const { uploadBlogImage } = require('../middlewares/upload');

const router = express.Router();

// Public routes with optional authentication for admin access
router.get('/', optionalAuth, getBlogs);
router.get('/slug/:slug', optionalAuth, getBlog);
router.get('/:id', optionalAuth, getBlog);

// Admin routes
router.post('/', protect, authorize('ADMIN'), createBlog);
router.put('/:id', protect, authorize('ADMIN'), updateBlog);
router.delete('/:id', protect, authorize('ADMIN'), deleteBlog);

module.exports = router;