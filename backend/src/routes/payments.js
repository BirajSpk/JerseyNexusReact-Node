const express = require('express');
const { protect } = require('../middlewares/auth');
const {
  initiateKhaltiPayment,
  verifyKhaltiPayment,
  handleKhaltiCallback,
  handleKhaltiCallbackNew,
  processCODOrder,
  initiateEsewaPayment,
  verifyEsewaPayment
} = require('../controllers/paymentController');

const router = express.Router();

// Khalti payment routes
router.post('/khalti/initiate', protect, initiateKhaltiPayment);
router.post('/khalti/verify', protect, verifyKhaltiPayment);
router.get('/khalti/callback', handleKhaltiCallback); // Public route for callback (old)
router.get('/khalti/callback-new', handleKhaltiCallbackNew); // Public route for new callback

// eSewa payment routes
router.post('/esewa/initiate', protect, initiateEsewaPayment);
router.post('/esewa/verify', protect, verifyEsewaPayment);

// COD payment route
router.post('/cod/process', protect, processCODOrder);

module.exports = router;