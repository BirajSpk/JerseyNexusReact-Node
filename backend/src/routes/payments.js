const express = require('express');
const { protect } = require('../middlewares/auth');
const {
  initiateKhaltiPayment,
  verifyKhaltiPayment,
  handleKhaltiCallback,
  processCODOrder
} = require('../controllers/paymentController');

const router = express.Router();

// Khalti payment routes
router.post('/khalti/initiate', protect, initiateKhaltiPayment);
router.post('/khalti/verify', protect, verifyKhaltiPayment);
router.get('/khalti/callback', handleKhaltiCallback); // Public route for callback

// COD payment route
router.post('/cod/process', protect, processCODOrder);

module.exports = router;