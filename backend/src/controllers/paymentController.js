const axios = require('axios');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const { asyncHandler, sendResponse } = require('../utils/helpers');
const WebSocketService = require('../utils/websocket');
const paymentService = require('../services/paymentService');
const { prisma, executeWithRetry } = require('../config/database');

// Khalti Configuration
const KHALTI_LIVE_PUBLIC_KEY = process.env.KHALTI_LIVE_PUBLIC_KEY;
const KHALTI_LIVE_SECRET_KEY = process.env.KHALTI_LIVE_SECRET_KEY || process.env.KHALTI_SECRET_KEY; // fallback to older env var name
const KHALTI_RETURN_URL = process.env.KHALTI_RETURN_URL || 'http://localhost:5003/api/payments/khalti/callback-new';
const KHALTI_API_URL = process.env.KHALTI_API_URL || 'https://a.khalti.com/api/v2/epayment/initiate/';

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
    // New eSewa ePay v2 form parameters (RC environment)
    const amount = order.totalAmount;
    const tax_amount = 0;
    const product_service_charge = 0;
    const product_delivery_charge = 0;
    const total_amount = amount + tax_amount + product_service_charge + product_delivery_charge;
    const transaction_uuid = payment.id; // use our payment id
    const product_code = process.env.ESEWA_MERCHANT_CODE || 'EPAYTEST';
    const success_url = `${process.env.BACKEND_URL || 'http://localhost:5003'}/api/payments/esewa/success`;
    const failure_url = `${process.env.FRONTEND_URL}/payment/failed`;

    // Signed fields
    const signed_field_names = 'total_amount,transaction_uuid,product_code';
    const raw = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;
    const hmacKey = process.env.ESEWA_SECRET_KEY || '';
    const signature = crypto.createHmac('sha256', hmacKey).update(raw).digest('base64');

    const esewaFormUrl = 'https://rc-epay.esewa.com.np/api/epay/main/v2/form';

    const esewaParams = {
      amount: amount,
      tax_amount: tax_amount,
      total_amount: total_amount,
      transaction_uuid: transaction_uuid,
      product_code: product_code,
      product_service_charge: product_service_charge,
      product_delivery_charge: product_delivery_charge,
      success_url: success_url,
      failure_url: failure_url,
      signed_field_names: signed_field_names,
      signature: signature
    };

    // Frontend should POST this to esewaFormUrl; return both
    const payment_url = esewaFormUrl;

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
      paymentId: payment.id,
      esewaParams
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
      let orderId = payment.orderId;

      // Check if this is a new payment flow (no existing order)
      if (!payment.orderId && payment.metadata && payment.metadata.orderData) {
        try {
          // Create order from stored order data
          const orderData = JSON.parse(payment.metadata.orderData);

          // Find user from payment metadata or session
          const userId = payment.metadata.userId || req.user?.id;
          if (!userId) {
            throw new Error('User ID not found for order creation');
          }

          // Calculate order items with current product prices
          const orderItems = [];
          let subtotal = 0;

          for (const item of orderData.items) {
            const product = await prisma.product.findUnique({
              where: { id: item.productId }
            });

            if (!product) {
              throw new Error(`Product ${item.productId} not found`);
            }

            if (product.stock < item.quantity) {
              throw new Error(`Insufficient stock for product ${product.name}`);
            }

            const itemTotal = product.price * item.quantity;
            subtotal += itemTotal;

            orderItems.push({
              productId: item.productId,
              quantity: item.quantity,
              price: product.price,
              size: item.size,
              color: item.color
            });
          }

          const totalAmount = subtotal + (orderData.shippingCost || 0) - (orderData.discountAmount || 0);

          // Create the order
          const order = await prisma.order.create({
            data: {
              userId,
              totalAmount,
              shippingCost: orderData.shippingCost || 0,
              discountAmount: orderData.discountAmount || 0,
              shippingAddress: JSON.stringify(orderData.shippingAddress),
              paymentMethod: 'KHALTI',
              paymentStatus: 'PAID',
              status: 'CONFIRMED',
              paymentId: pidx,
              notes: orderData.notes,
              items: {
                create: orderItems
              }
            },
            include: {
              items: { include: { product: true } },
              user: { select: { name: true, email: true } }
            }
          });

          // Update product stock
          for (const item of orderData.items) {
            await prisma.product.update({
              where: { id: item.productId },
              data: {
                stock: {
                  decrement: item.quantity
                }
              }
            });
          }

          orderId = order.id;

          // Update payment record with order ID
          await paymentService.updatePaymentStatus(payment.id, 'SUCCESS', {
            orderId: order.id,
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
              callback_received_at: new Date(),
              orderCreated: true
            }
          });

          // Emit new order notification to admins
          WebSocketService.emitNewOrder(order);

          console.log('✅ Order created and payment successful:', order.id);

        } catch (orderError) {
          console.error('❌ Failed to create order after payment:', orderError);

          // Update payment as failed due to order creation error
          await paymentService.updatePaymentStatus(payment.id, 'FAILED', {
            failureReason: `Order creation failed: ${orderError.message}`,
            gatewayResponse: {
              ...khaltiData,
              callback_data: req.query
            }
          });

          return res.redirect(`${process.env.FRONTEND_URL}/payment/failed?error=order_creation_failed`);
        }
      } else {
        // Existing flow - update existing order
        await prisma.order.update({
          where: { id: payment.orderId },
          data: {
            paymentStatus: 'PAID',
            status: 'CONFIRMED',
            paymentId: pidx
          }
        });

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

        console.log('✅ Payment successful for existing order:', payment.orderId);
      }

      // Notify via WebSocket
      WebSocketService.notifyOrderUpdate(orderId, {
        type: 'payment_success',
        orderId: orderId,
        paymentMethod: 'KHALTI',
        transactionId: transaction_id
      });

      // Redirect to success page
      return res.redirect(`${process.env.FRONTEND_URL}/order-success?orderId=${orderId}&transactionId=${transaction_id}`);
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

// @desc    Initialize Khalti payment with order data (creates order after payment)
// @route   POST /api/payments/khalti/initiate-with-order
// @access  Private
const initiateKhaltiPaymentWithOrder = asyncHandler(async (req, res) => {
  const { orderData, amount, productName } = req.body;
  const userId = req.user.id;

  console.log('🔄 Khalti payment initiation started');
  console.log('Request body:', { orderData: orderData ? 'present' : 'missing', amount, productName, userId });

  try {
    // Store order data temporarily in session/cache for after payment
    const sessionId = `order_${userId}_${Date.now()}`;

    // Create a temporary payment record to track this session
    const payment = await paymentService.createPayment({
      orderId: null, // No order yet
      amount: orderData.totalAmount,
      method: 'KHALTI',
      metadata: {
        productName: productName || 'JerseyNexus Order',
        khaltiAmount: Math.round(orderData.totalAmount * 100),
        sessionId,
        userId: userId, // Store user ID for order creation
        orderData: JSON.stringify(orderData)
      }
    });

    const payload = {
      return_url: process.env.KHALTI_RETURN_URL || 'http://localhost:5003/api/payments/khalti/callback-new',
      website_url: process.env.FRONTEND_URL || "http://localhost:3000",
      amount: Math.round(orderData.totalAmount * 100),
      purchase_order_id: payment.id,
      purchase_order_name: productName || 'JerseyNexus Order',
      customer_info: {
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone || "9800000000"
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

    sendResponse(res, 200, true, 'Payment initialized successfully', {
      payment_url: response.data.payment_url,
      pidx: response.data.pidx,
      expires_at: response.data.expires_at
    });

  } catch (error) {
    console.error('❌ Khalti payment initiation error:', error.response?.data || error.message);
    console.error('Error stack:', error.stack);
    sendResponse(res, 500, false, 'Failed to initialize payment', {
      error: error.response?.data?.detail || error.message
    });
  }
});

// @desc    Initialize eSewa payment with order data (creates order after payment)
// @route   POST /api/payments/esewa/initiate-with-order
// @access  Private
const initiateEsewaPaymentWithOrder = asyncHandler(async (req, res) => {
  const { orderData, amount, productName } = req.body;
  const userId = req.user.id;

  console.log('🔄 eSewa payment initiation started');
  console.log('Request body:', { orderData: orderData ? 'present' : 'missing', amount, productName, userId });

  try {
    // Store order data temporarily
    const sessionId = `order_${userId}_${Date.now()}`;

    // Create a temporary payment record
    const payment = await paymentService.createPayment({
      orderId: null, // No order yet
      amount: orderData.totalAmount,
      method: 'ESEWA',
      metadata: {
        productName: productName || 'JerseyNexus Order',
        sessionId,
        userId: userId, // Store user ID for order creation
        orderData: JSON.stringify(orderData)
      }
    });

    // Build eSewa v2 form parameters
    const amount = orderData.totalAmount;
    const tax_amount = 0;
    const product_service_charge = 0;
    const product_delivery_charge = 0;
    const total_amount = amount + tax_amount + product_service_charge + product_delivery_charge;
    const transaction_uuid = payment.id;
    const product_code = process.env.ESEWA_MERCHANT_CODE || 'EPAYTEST';
    const success_url = `${process.env.BACKEND_URL || 'http://localhost:5003'}/api/payments/esewa/success`;
    const failure_url = `${process.env.FRONTEND_URL}/payment/failed`;
    const signed_field_names = 'total_amount,transaction_uuid,product_code';
    const raw = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;
    const hmacKey = process.env.ESEWA_SECRET_KEY || '';
    const signature = crypto.createHmac('sha256', hmacKey).update(raw).digest('base64');

    const esewaFormUrl = 'https://rc-epay.esewa.com.np/api/epay/main/v2/form';

    const esewaParams = {
      amount,
      tax_amount,
      total_amount,
      transaction_uuid,
      product_code,
      product_service_charge,
      product_delivery_charge,
      success_url,
      failure_url,
      signed_field_names,
      signature
    };

    // Frontend should post a form to this URL
    const payment_url = esewaFormUrl;

    // Update payment with eSewa details
    await paymentService.updatePaymentStatus(payment.id, 'PENDING', {
      externalId: payment.id,
      metadata: {
        ...payment.metadata,
        esewaParams
      }
    });

    sendResponse(res, 200, true, 'eSewa payment initialized successfully', {
      payment_url,
      paymentId: payment.id,
      esewaParams
    });

  } catch (error) {
    console.error('❌ eSewa payment initiation error:', error);
    console.error('Error stack:', error.stack);
    sendResponse(res, 500, false, 'Failed to initiate eSewa payment', {
      error: error.message
    });
  }
});

// @desc    Handle Khalti return on frontend (bridge)
// @route   POST /api/payments/khalti/frontend-return
// @access  Public
const handleKhaltiFrontendReturn = asyncHandler(async (req, res) => {
  try {
    const { pidx, status } = req.body;

    if (!pidx) {
      return sendResponse(res, 400, false, 'Missing pidx');
    }

    // Find the payment record by external ID (pidx)
    let payment = await paymentService.getPaymentByExternalId(pidx);
    if (!payment) {
      return sendResponse(res, 404, false, 'Payment not found');
    }

    // Verify with Khalti API
    const verificationResponse = await axios.post('https://a.khalti.com/api/v2/epayment/lookup/', { pidx }, {
      headers: {
        'Authorization': `Key ${process.env.KHALTI_LIVE_SECRET_KEY || process.env.KHALTI_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const khaltiData = verificationResponse.data;
    if ((status === 'Completed' || !status) && khaltiData.status === 'Completed') {
      let orderId = payment.orderId;

      // New flow: create order after payment if needed
      if (!payment.orderId && payment.metadata && payment.metadata.orderData) {
        const orderData = JSON.parse(payment.metadata.orderData);
        const userId = payment.metadata.userId;
        if (!userId) {
          throw new Error('User ID not found for order creation');
        }

        // Calculate items & subtotal
        const orderItems = [];
        let subtotal = 0;
        for (const item of orderData.items) {
          const product = await prisma.product.findUnique({ where: { id: item.productId } });
          if (!product) throw new Error(`Product ${item.productId} not found`);
          if (product.stock < item.quantity) throw new Error(`Insufficient stock for product ${product.name}`);
          subtotal += product.price * item.quantity;
          orderItems.push({ productId: item.productId, quantity: item.quantity, price: product.price, size: item.size, color: item.color });
        }
        const totalAmount = subtotal + (orderData.shippingCost || 0) - (orderData.discountAmount || 0);

        const order = await prisma.order.create({
          data: {
            userId,
            totalAmount,
            shippingCost: orderData.shippingCost || 0,
            discountAmount: orderData.discountAmount || 0,
            shippingAddress: JSON.stringify(orderData.shippingAddress),
            paymentMethod: 'KHALTI',
            paymentStatus: 'PAID',
            status: 'CONFIRMED',
            paymentId: pidx,
            notes: orderData.notes,
            items: { create: orderItems }
          },
          include: { items: { include: { product: true } }, user: { select: { name: true, email: true } } }
        });

        // Decrement stock
        for (const item of orderData.items) {
          await prisma.product.update({ where: { id: item.productId }, data: { stock: { decrement: item.quantity } } });
        }

        orderId = order.id;

        await paymentService.updatePaymentStatus(payment.id, 'SUCCESS', {
          orderId: order.id,
          transactionId: khaltiData.transaction_id,
          gatewayResponse: { ...khaltiData },
          metadata: { ...payment.metadata, verifiedAt: new Date(), orderCreated: true }
        });

        WebSocketService.emitNewOrder(order);
      } else {
        // Existing order flow: mark paid
        await prisma.order.update({ where: { id: payment.orderId }, data: { paymentStatus: 'PAID', status: 'CONFIRMED', paymentId: pidx } });
        await paymentService.updatePaymentStatus(payment.id, 'SUCCESS', {
          transactionId: khaltiData.transaction_id,
          gatewayResponse: { ...khaltiData },
          metadata: { ...payment.metadata, verifiedAt: new Date() }
        });
        orderId = payment.orderId;
      }

      WebSocketService.notifyOrderUpdate(orderId, { type: 'payment_success', orderId, paymentMethod: 'KHALTI', transactionId: khaltiData.transaction_id });
      return sendResponse(res, 200, true, 'Payment settled', { orderId, pidx });
    }

    return sendResponse(res, 400, false, 'Payment not completed', { status: khaltiData.status });
  } catch (error) {
    console.error('Khalti frontend return error:', error);
    return sendResponse(res, 500, false, 'Failed to process payment return');
  }
});

// @desc    Handle eSewa success callback
// @route   GET /api/payments/esewa/success
// @access  Public
const handleEsewaSuccess = asyncHandler(async (req, res) => {
  try {
    const { data } = req.query;

    if (!data) {
      return res.redirect(`${process.env.FRONTEND_URL}/payment/failed?error=missing_data`);
    }

    // Decode base64 response
    const decodedData = JSON.parse(Buffer.from(data, 'base64').toString('utf-8'));
    console.log('📦 eSewa success callback data:', decodedData);

    const { transaction_code, status, total_amount, transaction_uuid, product_code, signature } = decodedData;

    if (status === 'COMPLETE') {
      // Find payment by transaction_uuid (our payment ID)
      const payment = await paymentService.getPaymentById(transaction_uuid);

      if (!payment) {
        console.error('❌ Payment not found for transaction_uuid:', transaction_uuid);
        return res.redirect(`${process.env.FRONTEND_URL}/payment/failed?error=payment_not_found`);
      }

      // Verify signature (same way as request signature)
      const signed_field_names = 'transaction_code,status,total_amount,transaction_uuid,product_code,signed_field_names';
      const raw = `transaction_code=${transaction_code},status=${status},total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code},signed_field_names=${signed_field_names}`;
      const hmacKey = process.env.ESEWA_SECRET_KEY || '';
      const expectedSignature = crypto.createHmac('sha256', hmacKey).update(raw).digest('base64');

      if (signature !== expectedSignature) {
        console.error('❌ eSewa signature verification failed');
        return res.redirect(`${process.env.FRONTEND_URL}/payment/failed?error=signature_mismatch`);
      }

      let orderId = payment.orderId;

      // Create order if this is "order after payment" flow
      if (!payment.orderId && payment.metadata && payment.metadata.orderData) {
        try {
          const orderData = JSON.parse(payment.metadata.orderData);
          const userId = payment.metadata.userId;

          // Calculate order items
          const orderItems = [];
          let subtotal = 0;
          for (const item of orderData.items) {
            const product = await prisma.product.findUnique({ where: { id: item.productId } });
            if (!product) throw new Error(`Product ${item.productId} not found`);
            if (product.stock < item.quantity) throw new Error(`Insufficient stock for product ${product.name}`);
            subtotal += product.price * item.quantity;
            orderItems.push({ productId: item.productId, quantity: item.quantity, price: product.price, size: item.size, color: item.color });
          }

          const order = await prisma.order.create({
            data: {
              userId,
              totalAmount: subtotal + (orderData.shippingCost || 0) - (orderData.discountAmount || 0),
              shippingCost: orderData.shippingCost || 0,
              discountAmount: orderData.discountAmount || 0,
              shippingAddress: JSON.stringify(orderData.shippingAddress),
              paymentMethod: 'ESEWA',
              paymentStatus: 'PAID',
              status: 'CONFIRMED',
              paymentId: transaction_code,
              notes: orderData.notes,
              items: { create: orderItems }
            },
            include: { items: { include: { product: true } }, user: { select: { name: true, email: true } } }
          });

          // Update stock
          for (const item of orderData.items) {
            await prisma.product.update({ where: { id: item.productId }, data: { stock: { decrement: item.quantity } } });
          }

          orderId = order.id;
          WebSocketService.emitNewOrder(order);
        } catch (orderError) {
          console.error('❌ Failed to create order after eSewa payment:', orderError);
          return res.redirect(`${process.env.FRONTEND_URL}/payment/failed?error=order_creation_failed`);
        }
      } else {
        // Update existing order
        await prisma.order.update({
          where: { id: payment.orderId },
          data: { paymentStatus: 'PAID', status: 'CONFIRMED', paymentId: transaction_code }
        });
        orderId = payment.orderId;
      }

      // Update payment status
      await paymentService.updatePaymentStatus(payment.id, 'SUCCESS', {
        orderId,
        transactionId: transaction_code,
        gatewayResponse: decodedData,
        metadata: { ...payment.metadata, verifiedAt: new Date() }
      });

      WebSocketService.notifyOrderUpdate(orderId, { type: 'payment_success', orderId, paymentMethod: 'ESEWA', transactionId: transaction_code });

      return res.redirect(`${process.env.FRONTEND_URL}/order-success?orderId=${orderId}&transactionId=${transaction_code}`);
    }

    return res.redirect(`${process.env.FRONTEND_URL}/payment/failed?status=${status}`);
  } catch (error) {
    console.error('❌ eSewa success callback error:', error);
    return res.redirect(`${process.env.FRONTEND_URL}/payment/failed?error=callback_error`);
  }
});

module.exports = {
  initiateKhaltiPayment,
  verifyKhaltiPayment,
  handleKhaltiCallback,
  handleKhaltiCallbackNew,
  handleKhaltiFrontendReturn,
  processCODOrder,
  initiateEsewaPayment,
  verifyEsewaPayment,
  handleEsewaSuccess,
  initiateKhaltiPaymentWithOrder,
  initiateEsewaPaymentWithOrder
};