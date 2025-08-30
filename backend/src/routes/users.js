const express = require('express');
const {
  getUsers,
  getUserById,
  updateUserRole,
  deleteUser,
  getUserStats,
} = require('../controllers/userController');
const { protect, authorize } = require('../middlewares/auth');
const { body } = require('express-validator');
const { validateRequest } = require('../utils/validation');

const router = express.Router();

// Apply protect middleware to all routes
router.use(protect);

// @desc    Welcome message
// @route   GET /api/users
// @access  Private/Admin
router.get('/', authorize('ADMIN'), getUsers);

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private/Admin
router.get('/stats', authorize('ADMIN'), getUserStats);

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
router.get('/:id', authorize('ADMIN'), getUserById);

// @desc    Update user role
// @route   PUT /api/users/:id/role
// @access  Private/Admin
router.put('/:id/role', [
  authorize('ADMIN'),
  body('role').isIn(['USER', 'ADMIN']).withMessage('Role must be USER or ADMIN'),
  validateRequest
], updateUserRole);

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
router.delete('/:id', authorize('ADMIN'), deleteUser);

module.exports = router;