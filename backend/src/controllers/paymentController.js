const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const { asyncHandler, sendResponse } = require('../utils/helpers');
const WebSocketService = require('../utils/websocket');

const prisma = new PrismaClient();

// Khalti Configuration
const KHALTI_LIVE_PUBLIC_KEY = process.env.KHALTI_LIVE_PUBLIC_KEY || 'f9232cec7d034e379217555f581777cf';
const KHALTI_LIVE_SECRET_KEY = process.env.KHALTI_LIVE_SECRET_KEY || 'c51dd8206a5a41b6b25ce3168d1348a7';
const KHALTI_RETURN_URL = process.env.KHALTI_RETURN_URL || 'http://localhost:5000/khalti/callback';
const KHALTI_API_URL = 'https://a.khalti.com/api/v2/epayment/initiate/';

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

  // Generate unique payment reference
  const purchaseOrderId = `JN-${order.id}-${Date.now()}`;
  const purchaseOrderName = `JerseyNexus Order #${order.id}`;

  try {
    const payload = {
      return_url: returnUrl || KHALTI_RETURN_URL,
      website_url: "http://localhost:3000",
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

module.exports = {
  initiateKhaltiPayment,
  verifyKhaltiPayment,
  handleKhaltiCallback,
  processCODOrder
};