const express = require('express');
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  updateUserRole,
  deleteUser,
  getUserStats,
  updateProfile,
  getProfile,
} = require('../controllers/userController');
const { protect, authorize } = require('../middlewares/auth');
const { body } = require('express-validator');
const { validateRequest } = require('../utils/validation');

const router = express.Router();

// Apply protect middleware to all routes
router.use(protect);

// @desc    Get current user profile
// @route   GET /api/users/profile
// @access  Private
router.get('/profile', getProfile);

// @desc    Update current user profile
// @route   PUT /api/users/profile
// @access  Private
router.put('/profile', [
  body('name').optional().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').optional().isEmail().withMessage('Must be a valid email'),
  body('phone').optional().isLength({ min: 10 }).withMessage('Phone must be at least 10 characters'),
  validateRequest
], updateProfile);

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
router.get('/', authorize('ADMIN'), getUsers);

// @desc    Create new user
// @route   POST /api/users
// @access  Private/Admin
router.post('/', [
  authorize('ADMIN'),
  body('name').isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().withMessage('Must be a valid email'),
  body('role').optional().isIn(['USER', 'ADMIN']).withMessage('Role must be USER or ADMIN'),
  validateRequest
], createUser);

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private/Admin
router.get('/stats', authorize('ADMIN'), getUserStats);

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
router.get('/:id', authorize('ADMIN'), getUserById);

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
router.put('/:id', [
  authorize('ADMIN'),
  body('name').optional().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').optional().isEmail().withMessage('Must be a valid email'),
  body('role').optional().isIn(['USER', 'ADMIN']).withMessage('Role must be USER or ADMIN'),
  validateRequest
], updateUser);

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