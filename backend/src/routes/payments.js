const express = require('express');
const { protect } = require('../middlewares/auth');
const {
  initiateKhaltiPayment,
  verifyKhaltiPayment,
  handleKhaltiCallback,
  handleKhaltiCallbackNew,

  processCODOrder,
  initiateEsewaPayment,
  verifyEsewaPayment,
  handleEsewaSuccess,
  initiateKhaltiPaymentWithOrder,
  initiateEsewaPaymentWithOrder
} = require('../controllers/paymentController');

const router = express.Router();

// Khalti payment routes
router.post('/khalti/initiate', protect, initiateKhaltiPayment);
router.post('/khalti/verify', protect, verifyKhaltiPayment);
router.get('/khalti/callback', handleKhaltiCallback); // Public route for callback (old)
router.get('/khalti/callback-new', handleKhaltiCallbackNew); // Public route for new callback

router.post('/khalti/initiate-with-order', protect, initiateKhaltiPaymentWithOrder); // New route for order creation after payment

// eSewa payment routes
router.post('/esewa/initiate', protect, initiateEsewaPayment);
router.post('/esewa/verify', protect, verifyEsewaPayment);
router.get('/esewa/success', handleEsewaSuccess); // Public callback for eSewa success
router.post('/esewa/initiate-with-order', protect, initiateEsewaPaymentWithOrder); // New route for order creation after payment

// COD payment route
router.post('/cod/process', protect, processCODOrder);

module.exports = router;