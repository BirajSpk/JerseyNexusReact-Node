const { PrismaClient } = require('@prisma/client');
const { asyncHandler, sendResponse, getPagination } = require('../utils/helpers');

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
  const { items, shippingAddress } = req.body;
  const userId = req.user.id;
  
  // Calculate total amount
  let totalAmount = 0;
  for (const item of items) {
    const product = await prisma.product.findUnique({ where: { id: item.productId } });
    totalAmount += product.price * item.quantity;
  }
  
  const order = await prisma.order.create({
    data: {
      userId,
      totalAmount,
      shippingAddress,
      items: {
        create: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price
        }))
      }
    },
    include: { items: { include: { product: true } } }
  });

  sendResponse(res, 201, true, 'Order created successfully', { order });
});

// @desc    Update order status
// @route   PUT /api/orders/:id
// @access  Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  const order = await prisma.order.update({
    where: { id },
    data: { status },
    include: { items: { include: { product: true } } }
  });

  sendResponse(res, 200, true, 'Order status updated successfully', { order });
});

module.exports = {
  getOrders,
  createOrder,
  updateOrderStatus,
};