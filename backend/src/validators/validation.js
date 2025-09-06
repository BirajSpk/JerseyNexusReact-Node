const { body, validationResult } = require('express-validator');

// Email validation 
const emailValidation = body('email')
  .isEmail()
  .normalizeEmail()
  .withMessage('Please provide a valid email address');


  // Password validation 

const passwordValidation = body('password')
  .isLength({ min: 6 })
  .withMessage('Password must be at least 6 characters long');


  // Name validation
const nameValidation = body('name')
  .trim()
  .isLength({ min: 2, max: 50 })
  .withMessage('Name must be between 2 and 50 characters');


  // Phone number validation 


const phoneValidation = body('phone')
  .optional()
  .matches(/^[\+]?[0-9]{10,15}$/)
  .withMessage('Please provide a valid phone number');


  
// Validation middleware
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array().map(error => ({
        field: error.param,
        message: error.msg,
        value: error.value
      }))
    });
  }
  
  next();
};

// User registration validation
const validateUserRegistration = [
  nameValidation,
  emailValidation,
  passwordValidation,
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match password');
      }
      return true;
    }),
  validateRequest
];

// User login validation
const validateUserLogin = [
  emailValidation,
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  validateRequest
];

// Product validation
const validateProduct = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage('Product name must be between 2 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description must not exceed 2000 characters'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('stock')
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),
  body('categoryId')
    .notEmpty()
    .withMessage('Category is required'),
  validateRequest
];

// Category validation
const validateCategory = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Category name must be between 2 and 100 characters'),
  body('type')
    .optional()
    .isIn(['PRODUCT', 'BLOG'])
    .withMessage('Type must be either PRODUCT or BLOG'),
  validateRequest
];

// Review validation
const validateReview = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Comment must not exceed 1000 characters'),
  validateRequest
];

// Blog validation
const validateBlog = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Blog title must be between 5 and 200 characters'),
  body('content')
    .optional()
    .trim()
    .isLength({ min: 10 })
    .withMessage('Blog content must be at least 10 characters'),
  body('categoryId')
    .optional()
    .notEmpty()
    .withMessage('Category is required'),
  (req, res, next) => {
    // Custom validation for FormData
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array().map(error => ({
          field: error.param,
          message: error.msg,
          value: error.value
        }))
      });
    }

    // Additional validation for required fields when they exist
    const { title, content, categoryId } = req.body;

    if (title !== undefined && (!title || title.trim().length < 5 || title.trim().length > 200)) {
      return res.status(400).json({
        success: false,
        error: 'Blog title must be between 5 and 200 characters'
      });
    }

    if (content !== undefined && (!content || content.trim().length < 10)) {
      return res.status(400).json({
        success: false,
        error: 'Blog content must be at least 10 characters'
      });
    }

    if (categoryId !== undefined && !categoryId) {
      return res.status(400).json({
        success: false,
        error: 'Category is required'
      });
    }

    next();
  }
];

module.exports = {
  validateRequest,
  validateUserRegistration,
  validateUserLogin,
  validateProduct,
  validateCategory,
  validateReview,
  validateBlog,
};