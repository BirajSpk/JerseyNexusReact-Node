// Async handler to avoid try-catch blocks
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Generate slug from string
const generateSlug = (text) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces, underscores, and hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

// Validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone number (Nepal format)
const isValidPhoneNumber = (phone) => {
  const phoneRegex = /^(\+977)?[9][6-9]\d{8}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

// Format price for display
const formatPrice = (price) => {
  return new Intl.NumberFormat('en-NP', {
    style: 'currency',
    currency: 'NPR',
  }).format(price);
};

// Generate random string
const generateRandomString = (length = 10) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Pagination helper
const getPagination = (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  return {
    skip: offset,
    take: limit,
  };
};

// API Response helper
const sendResponse = (res, statusCode, success, message, data = null) => {
  const response = {
    success,
    message,
  };

  if (data !== null) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

module.exports = {
  asyncHandler,
  generateSlug,
  isValidEmail,
  isValidPhoneNumber,
  formatPrice,
  generateRandomString,
  getPagination,
  sendResponse,
};