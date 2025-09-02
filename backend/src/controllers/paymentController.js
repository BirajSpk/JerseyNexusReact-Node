const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const { asyncHandler, sendResponse } = require('../utils/helpers');
const WebSocketService = require('../utils/websocket');
const paymentService = require('../services/paymentService');
const { prisma, executeWithRetry } = require('../config/database');

// Khalti Configuration
const KHALTI_LIVE_PUBLIC_KEY = process.env.KHALTI_LIVE_PUBLIC_KEY 
const KHALTI_LIVE_SECRET_KEY = process.env.KHALTI_LIVE_SECRET_KEY  
const KHALTI_RETURN_URL = process.env.KHALTI_RETURN_URL  
const KHALTI_API_URL = process.env.KHALTI_API_URL

// @desc    Initialize Khalti payment
// @route   POST /api/payments/khalti/initiate
// @access  Private
const initiateKhaltiPayment = asyncHandler(async (req, res) => {
  const { orderId, returnUrl } = req.body;
  const userId = req.user.id;

  // Get order details
  const order = await prisma.order.findFirst({
    where: { 
      id: orderId, 
      userId: userId 
    },
    include: {
      items: { include: { product: true } },
      user: true
    }
  });

  if (!order) {
    return sendResponse(res, 404, false, 'Order not found');
  }

  if (order.paymentStatus === 'PAID') {
    return sendResponse(res, 400, false, 'Order already paid');
  }

  // Create payment record first
  const payment = await paymentService.createPayment({
    orderId: order.id,
    amount: order.totalAmount,
    method: 'KHALTI',
    metadata: {
      productName: `JerseyNexus Order #${order.id}`,
      khaltiAmount: Math.round(order.totalAmount * 100)
    }
  });

  // Generate unique payment reference
  const purchaseOrderId = payment.id;
  const purchaseOrderName = `JerseyNexus Order #${order.id}`;

  try {
    const payload = {
      return_url: process.env.KHALTI_RETURN_URL || 'http://localhost:5003/api/payments/khalti/callback-new',
      website_url: process.env.FRONTEND_URL || "http://localhost:3000",
      amount: Math.round(order.totalAmount * 100), // Convert to paisa (smallest currency unit)
      purchase_order_id: purchaseOrderId,
      purchase_order_name: purchaseOrderName,
      customer_info: {
        name: order.user.name,
        email: order.user.email,
        phone: order.user.phone || "9800000000"
      }
    };

    const response = await axios.post(KHALTI_API_URL, payload, {
      headers: {
        'Authorization': `Key ${KHALTI_LIVE_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    // Update payment record with Khalti response
    await paymentService.updatePaymentStatus(payment.id, 'PENDING', {
      externalId: response.data.pidx,
      gatewayResponse: response.data
    });

    // Update order with payment reference
    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentId: response.data.pidx,
        paymentMethod: 'KHALTI'
      }
    });

    sendResponse(res, 200, true, 'Payment initialized successfully', {
      payment_url: response.data.payment_url,
      pidx: response.data.pidx,
      expires_at: response.data.expires_at
    });

  } catch (error) {
    console.error('Khalti payment initiation error:', error.response?.data || error.message);
    sendResponse(res, 500, false, 'Failed to initialize payment', {
      error: error.response?.data?.detail || error.message
    });
  }
});

// @desc    Verify Khalti payment
// @route   POST /api/payments/khalti/verify
// @access  Private
const verifyKhaltiPayment = asyncHandler(async (req, res) => {
  const { pidx, orderId } = req.body;
  
  try {
    const response = await axios.post('https://a.khalti.com/api/v2/epayment/lookup/', {
      pidx: pidx
    }, {
      headers: {
        'Authorization': `Key ${KHALTI_LIVE_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const paymentData = response.data;
    
    if (paymentData.status === 'Completed') {
      // Update order payment status
      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'PAID',
          status: 'CONFIRMED',
          paymentId: pidx
        },
        include: {
          items: { include: { product: true } },
          user: true
        }
      });

      // Emit payment update
      WebSocketService.emitPaymentUpdate(updatedOrder, { verified: true });
      WebSocketService.emitOrderUpdate(updatedOrder);

      sendResponse(res, 200, true, 'Payment verified successfully', {
        order: updatedOrder,
        payment: paymentData
      });
    } else {
      sendResponse(res, 400, false, 'Payment not completed', {
        status: paymentData.status,
        payment: paymentData
      });
    }

  } catch (error) {
    console.error('Khalti payment verification error:', error.response?.data || error.message);
    sendResponse(res, 500, false, 'Failed to verify payment', {
      error: error.response?.data?.detail || error.message
    });
  }
});

// @desc    Handle Khalti callback
// @route   GET /api/payments/khalti/callback
// @access  Public
const handleKhaltiCallback = asyncHandler(async (req, res) => {
  const { pidx, status, purchase_order_id } = req.query;
  
  try {
    // Extract order ID from purchase_order_id (format: JN-{orderId}-{timestamp})
    const orderIdMatch = purchase_order_id.match(/JN-(.+?)-\d+$/);
    if (!orderIdMatch) {
      return res.redirect(`${process.env.FRONTEND_URL}/payment/failed?error=invalid_order_reference`);
    }
    
    const orderId = orderIdMatch[1];
    
    if (status === 'Completed') {
      // Verify payment server-side
      const verifyResponse = await axios.post('https://a.khalti.com/api/v2/epayment/lookup/', {
        pidx: pidx
      }, {
        headers: {
          'Authorization': `Key ${KHALTI_LIVE_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      if (verifyResponse.data.status === 'Completed') {
        const updatedOrder = await prisma.order.update({
          where: { id: orderId },
          data: {
            paymentStatus: 'PAID',
            status: 'CONFIRMED',
            paymentId: pidx
          },
          include: {
            items: { include: { product: true } },
            user: true
          }
        });
        
        // Emit real-time updates
        WebSocketService.emitPaymentUpdate(updatedOrder, { 
          verified: true, 
          method: 'khalti',
          pidx: pidx 
        });
        WebSocketService.emitOrderUpdate(updatedOrder);
        
        return res.redirect(`${process.env.FRONTEND_URL}/order-success?orderId=${orderId}&payment=khalti`);
      }
    }
    
    return res.redirect(`${process.env.FRONTEND_URL}/payment/failed?orderId=${orderId}&status=${status}`);
    
  } catch (error) {
    console.error('Khalti callback error:', error);
    return res.redirect(`${process.env.FRONTEND_URL}/payment/failed?error=callback_error`);
  }
});

// @desc    Process COD order
// @route   POST /api/payments/cod/process
// @access  Private
const processCODOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.body;
  const userId = req.user.id;

  const order = await prisma.order.findFirst({
    where: { 
      id: orderId, 
      userId: userId 
    }
  });

  if (!order) {
    return sendResponse(res, 404, false, 'Order not found');
  }

  // Update order for COD
  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: {
      paymentMethod: 'COD',
      paymentStatus: 'PENDING',
      status: 'CONFIRMED'
    },
    include: {
      items: { include: { product: true } },
      user: true
    }
  });

  // Emit real-time updates
  WebSocketService.emitPaymentUpdate(updatedOrder, { method: 'cod' });
  WebSocketService.emitOrderUpdate(updatedOrder);

  sendResponse(res, 200, true, 'COD order processed successfully', {
    order: updatedOrder
  });
});

// @desc    Initialize eSewa payment
// @route   POST /api/payments/esewa/initiate
// @access  Private
const initiateEsewaPayment = asyncHandler(async (req, res) => {
  const { orderId, amount, productName } = req.body;
  const userId = req.user.id;

  // Get order details
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      userId: userId
    },
    include: {
      items: { include: { product: true } },
      user: true
    }
  });

  if (!order) {
    return sendResponse(res, 404, false, 'Order not found');
  }

  if (order.paymentStatus === 'PAID') {
    return sendResponse(res, 400, false, 'Order already paid');
  }

  // Create payment record
  const payment = await paymentService.createPayment({
    orderId: order.id,
    amount: order.totalAmount,
    method: 'ESEWA',
    metadata: {
      productName: productName || `JerseyNexus Order #${order.id}`
    }
  });

  try {
    // Generate eSewa payment URL
    const esewaParams = {
      amt: order.totalAmount,
      pdc: 0,
      psc: 0,
      txAmt: 0,
      tAmt: order.totalAmount,
      pid: payment.id,
      scd: process.env.ESEWA_MERCHANT_CODE || 'EPAYTEST',
      su: `${process.env.FRONTEND_URL}/payment/esewa/success`,
      fu: `${process.env.FRONTEND_URL}/payment/esewa/failure`
    };

    const esewaUrl = 'https://uat.esewa.com.np/epay/main';
    const queryString = new URLSearchParams(esewaParams).toString();
    const payment_url = `${esewaUrl}?${queryString}`;

    // Update payment with eSewa details
    await paymentService.updatePaymentStatus(payment.id, 'PENDING', {
      externalId: payment.id,
      metadata: {
        ...payment.metadata,
        esewaParams
      }
    });

    // Update order with payment reference
    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentId: payment.id,
        paymentMethod: 'ESEWA'
      }
    });

    sendResponse(res, 200, true, 'eSewa payment initialized successfully', {
      payment_url,
      paymentId: payment.id
    });

  } catch (error) {
    console.error('eSewa payment initiation error:', error);
    sendResponse(res, 500, false, 'Failed to initiate eSewa payment');
  }
});

// @desc    Verify eSewa payment
// @route   POST /api/payments/esewa/verify
// @access  Private
const verifyEsewaPayment = asyncHandler(async (req, res) => {
  const { oid, amt, refId } = req.body;

  try {
    // Find payment by ID
    const payment = await paymentService.getPaymentById(oid);
    if (!payment) {
      return sendResponse(res, 404, false, 'Payment not found');
    }

    // Verify with eSewa
    const verificationUrl = 'https://uat.esewa.com.np/epay/transrec';
    const verificationParams = {
      amt,
      rid: refId,
      pid: oid,
      scd: process.env.ESEWA_MERCHANT_CODE || 'EPAYTEST'
    };

    const verificationResponse = await axios.post(verificationUrl, verificationParams);

    if (verificationResponse.data.includes('Success')) {
      // Update payment as successful
      await paymentService.updatePaymentStatus(payment.id, 'SUCCESS', {
        transactionId: refId,
        gatewayResponse: { status: 'Success', refId },
        metadata: {
          ...payment.metadata,
          verifiedAt: new Date()
        }
      });

      // Notify via WebSocket
      WebSocketService.notifyOrderUpdate(payment.orderId, {
        type: 'payment_success',
        orderId: payment.orderId,
        paymentMethod: 'ESEWA'
      });

      sendResponse(res, 200, true, 'eSewa payment verified successfully', {
        paymentId: payment.id,
        orderId: payment.orderId,
        status: 'SUCCESS'
      });
    } else {
      // Update payment as failed
      await paymentService.updatePaymentStatus(payment.id, 'FAILED', {
        failureReason: 'eSewa verification failed',
        gatewayResponse: { status: 'Failed', response: verificationResponse.data }
      });

      sendResponse(res, 400, false, 'eSewa payment verification failed');
    }

  } catch (error) {
    console.error('eSewa payment verification error:', error);
    sendResponse(res, 500, false, 'Failed to verify eSewa payment');
  }
});

// @desc    Handle Khalti callback
// @route   GET /api/payments/khalti/callback
// @access  Public
const handleKhaltiCallbackNew = asyncHandler(async (req, res) => {
  try {
    const {
      pidx,
      transaction_id,
      tidx,
      txnId,
      amount,
      total_amount,
      mobile,
      status,
      purchase_order_id,
      purchase_order_name
    } = req.query;

    console.log('📞 Khalti Callback Received:', req.query);

    // Find the payment record by external ID (pidx)
    let payment = await paymentService.getPaymentByExternalId(pidx);

    if (!payment) {
      // If payment not found by pidx, try to find by purchase_order_id
      payment = await paymentService.getPaymentById(purchase_order_id);
    }

    if (!payment) {
      console.error('❌ Payment not found for pidx:', pidx, 'or purchase_order_id:', purchase_order_id);
      return res.redirect(`${process.env.FRONTEND_URL}/payment/failed?error=payment_not_found`);
    }

    // Verify with Khalti API
    const verificationResponse = await axios.post('https://a.khalti.com/api/v2/epayment/lookup/', {
      pidx
    }, {
      headers: {
        'Authorization': `Key ${process.env.KHALTI_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const khaltiData = verificationResponse.data;
    console.log('🔍 Khalti Verification Response:', khaltiData);

    if (status === 'Completed' && khaltiData.status === 'Completed') {
      // Update payment as successful
      await paymentService.updatePaymentStatus(payment.id, 'SUCCESS', {
        transactionId: transaction_id,
        gatewayResponse: {
          ...khaltiData,
          callback_data: req.query
        },
        metadata: {
          ...payment.metadata,
          mobile,
          khalti_transaction_id: transaction_id,
          khalti_tidx: tidx,
          khalti_txnId: txnId,
          verifiedAt: new Date(),
          callback_received_at: new Date()
        }
      });

      // Notify via WebSocket
      WebSocketService.notifyOrderUpdate(payment.orderId, {
        type: 'payment_success',
        orderId: payment.orderId,
        paymentMethod: 'KHALTI',
        transactionId: transaction_id
      });

      console.log('✅ Payment successful for order:', payment.orderId);

      // Redirect to success page
      return res.redirect(`${process.env.FRONTEND_URL}/payment/success?orderId=${payment.orderId}&transactionId=${transaction_id}`);
    } else {
      // Update payment as failed
      await paymentService.updatePaymentStatus(payment.id, 'FAILED', {
        failureReason: `Khalti payment failed. Status: ${status}`,
        gatewayResponse: {
          ...khaltiData,
          callback_data: req.query
        },
        metadata: {
          ...payment.metadata,
          failed_at: new Date(),
          failure_status: status
        }
      });

      console.log('❌ Payment failed for order:', payment.orderId);

      // Redirect to failure page
      return res.redirect(`${process.env.FRONTEND_URL}/payment/failed?orderId=${payment.orderId}&reason=payment_failed`);
    }

  } catch (error) {
    console.error('❌ Khalti callback error:', error);

    // Try to update payment as failed if we have the payment info
    if (req.query.purchase_order_id) {
      try {
        const payment = await paymentService.getPaymentById(req.query.purchase_order_id);
        if (payment) {
          await paymentService.updatePaymentStatus(payment.id, 'FAILED', {
            failureReason: 'Callback processing error',
            gatewayResponse: { error: error.message, callback_data: req.query }
          });
        }
      } catch (updateError) {
        console.error('Failed to update payment status:', updateError);
      }
    }

    return res.redirect(`${process.env.FRONTEND_URL}/payment/failed?error=callback_error`);
  }
});

module.exports = {
  initiateKhaltiPayment,
  verifyKhaltiPayment,
  handleKhaltiCallback,
  handleKhaltiCallbackNew,
  processCODOrder,
  initiateEsewaPayment,
  verifyEsewaPayment
};