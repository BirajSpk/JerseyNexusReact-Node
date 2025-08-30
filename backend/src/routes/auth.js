const express = require('express');
const {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  logout,
} = require('../controllers/authController');
const { protect } = require('../middlewares/auth');
const {
  validateUserRegistration,
  validateUserLogin,
  validateRequest,
} = require('../utils/validation');
const { body } = require('express-validator');

const router = express.Router();

// @desc    Welcome message
// @route   GET /api/auth
// @access  Public
router.get('/', (req, res) => {
  res.json({
    message: 'JerseyNexus Authentication API',
    endpoints: {
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login',
      logout: 'POST /api/auth/logout',
      profile: 'GET /api/auth/me',
      updateProfile: 'PUT /api/auth/profile',
      changePassword: 'PUT /api/auth/change-password'
    }
  });
});

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', validateUserRegistration, register);

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', validateUserLogin, login);

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, getProfile);

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', [
  protect,
  body('name').optional().trim().isLength({ min: 2, max: 50 }),
  body('email').optional().isEmail().normalizeEmail(),
  body('avatar').optional().isURL(),
  validateRequest
], updateProfile);

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
router.put('/change-password', [
  protect,
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  validateRequest
], changePassword);

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
router.post('/logout', protect, logout);

module.exports = router;