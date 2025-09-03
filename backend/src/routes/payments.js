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
  checkEsewaPaymentStatus,
  initiateKhaltiPaymentWithOrder,
  initiateEsewaPaymentWithOrder,
  initiateKhaltiPaymentV2,
  handleKhaltiCallbackV2,
  verifyKhaltiPaymentV2
} = require('../controllers/paymentController');

const router = express.Router();

// Khalti payment routes
router.post('/khalti/initiate', protect, initiateKhaltiPayment);
router.post('/khalti/verify', protect, verifyKhaltiPayment);
router.get('/khalti/callback', handleKhaltiCallback); // Public route for callback (old)
router.get('/khalti/callback-new', handleKhaltiCallbackNew); // Public route for new callback

router.post('/khalti/initiate-with-order', protect, initiateKhaltiPaymentWithOrder); // New route for order creation after payment

// Khalti KPG-2 routes
router.post('/khalti/initiate-v2', protect, initiateKhaltiPaymentV2);
router.get('/khalti/callback-v2', handleKhaltiCallbackV2); // Public callback for Khalti KPG-2
router.post('/khalti/verify-v2', protect, verifyKhaltiPaymentV2);

// eSewa payment routes
router.post('/esewa/initiate', protect, initiateEsewaPayment);
router.post('/esewa/verify', protect, verifyEsewaPayment);
router.get('/esewa/success', handleEsewaSuccess); // Public callback for eSewa success
router.get('/esewa/status/:transaction_uuid', protect, checkEsewaPaymentStatus); // Check payment status
router.post('/esewa/initiate-with-order', protect, initiateEsewaPaymentWithOrder); // New route for order creation after payment

// COD payment route
router.post('/cod/process', protect, processCODOrder);

module.exports = router;