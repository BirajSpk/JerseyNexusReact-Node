const { PrismaClient } = require('@prisma/client');
const { asyncHandler, sendResponse, getPagination } = require('../utils/helpers');
const WebSocketService = require('../utils/websocket');

const prisma = new PrismaClient();

// @desc    Get user orders
// @route   GET /api/orders
// @access  Private
const getOrders = asyncHandler(async (req, res) => {
  const userId = req.user.role === 'ADMIN' ? req.query.userId : req.user.id;
  
  const orders = await prisma.order.findMany({
    where: userId ? { userId } : {},
    include: {
      items: { include: { product: true } },
      user: { select: { name: true, email: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  sendResponse(res, 200, true, 'Orders retrieved successfully', { orders });
});

// @desc    Create order
// @route   POST /api/orders
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
  const { 
    items, 
    shippingAddress, 
    paymentMethod = 'COD',
    discountAmount = 0,
    shippingCost = 0,
    notes 
  } = req.body;
  const userId = req.user.id;
  
  // Calculate total amount
  let subtotal = 0;
  const orderItems = [];
  
  for (const item of items) {
    const product = await prisma.product.findUnique({ 
      where: { id: item.productId } 
    });
    
    if (!product) {
      return sendResponse(res, 404, false, `Product with ID ${item.productId} not found`);
    }
    
    if (product.stock < item.quantity) {
      return sendResponse(res, 400, false, `Insufficient stock for product ${product.name}`);
    }
    
    const itemPrice = product.salePrice || product.price;
    subtotal += itemPrice * item.quantity;
    
    orderItems.push({
      productId: item.productId,
      quantity: item.quantity,
      price: itemPrice,
      size: item.size || null,
      color: item.color || null
    });
  }
  
  const totalAmount = subtotal + shippingCost - discountAmount;
  
  const order = await prisma.order.create({
    data: {
      userId,
      totalAmount,
      shippingCost,
      discountAmount,
      shippingAddress: JSON.stringify(shippingAddress),
      paymentMethod,
      paymentStatus: paymentMethod === 'COD' ? 'PENDING' : 'PENDING',
      notes,
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
  for (const item of items) {
    await prisma.product.update({
      where: { id: item.productId },
      data: {
        stock: {
          decrement: item.quantity
        }
      }
    });
  }

  // Emit new order notification to admins
  WebSocketService.emitNewOrder(order);

  sendResponse(res, 201, true, 'Order created successfully', { order });
});

// @desc    Update order status
// @route   PUT /api/orders/:id
// @access  Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, adminNotes, trackingNumber, paymentStatus } = req.body;
  
  const updateData = {};
  if (status) updateData.status = status;
  if (adminNotes) updateData.adminNotes = adminNotes;
  if (trackingNumber) updateData.trackingNumber = trackingNumber;
  if (paymentStatus) updateData.paymentStatus = paymentStatus;
  
  const order = await prisma.order.update({
    where: { id },
    data: updateData,
    include: { 
      items: { include: { product: true } },
      user: { select: { name: true, email: true } }
    }
  });

  // Emit real-time order update
  WebSocketService.emitOrderUpdate(order);

  sendResponse(res, 200, true, 'Order updated successfully', { order });
});

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
const getOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.role === 'ADMIN' ? undefined : req.user.id;
  
  const order = await prisma.order.findFirst({
    where: {
      id,
      ...(userId && { userId })
    },
    include: {
      items: { include: { product: true } },
      user: { select: { name: true, email: true, phone: true } }
    }
  });

  if (!order) {
    return sendResponse(res, 404, false, 'Order not found');
  }

  sendResponse(res, 200, true, 'Order retrieved successfully', { order });
});

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Private/Admin
const deleteOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Check if order exists
  const existingOrder = await prisma.order.findUnique({
    where: { id }
  });

  if (!existingOrder) {
    return res.status(404).json({
      success: false,
      error: 'Order not found'
    });
  }

  // Delete order items first (due to foreign key constraints)
  await prisma.orderItem.deleteMany({
    where: { orderId: id }
  });

  // Delete the order
  await prisma.order.delete({
    where: { id }
  });

  sendResponse(res, 200, true, 'Order deleted successfully');
});

module.exports = {
  getOrders,
  getOrder,
  createOrder,
  updateOrderStatus,
  deleteOrder,
};