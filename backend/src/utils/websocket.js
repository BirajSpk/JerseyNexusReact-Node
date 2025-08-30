const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class WebSocketService {
  constructor() {
    this.io = null;
    this.connectedUsers = new Map(); // userId -> socketId
  }

  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000', 'http://localhost:3001'],
        methods: ['GET', 'POST']
      }
    });

    // Authentication middleware for socket connections
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error('Authentication error'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await prisma.user.findUnique({
          where: { id: decoded.id },
          select: { id: true, name: true, email: true, role: true }
        });

        if (!user) {
          return next(new Error('User not found'));
        }

        socket.userId = user.id;
        socket.user = user;
        next();
      } catch (error) {
        next(new Error('Authentication error'));
      }
    });

    this.io.on('connection', (socket) => {
      console.log(`User ${socket.user.email} connected`);
      
      // Store user connection
      this.connectedUsers.set(socket.userId, socket.id);

      // Join user-specific room
      socket.join(`user:${socket.userId}`);
      
      // Join admin room if user is admin
      if (socket.user.role === 'ADMIN') {
        socket.join('admin');
      }

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log(`User ${socket.user.email} disconnected`);
        this.connectedUsers.delete(socket.userId);
      });

      // Handle joining order-specific rooms
      socket.on('join_order', (orderId) => {
        socket.join(`order:${orderId}`);
      });

      socket.on('leave_order', (orderId) => {
        socket.leave(`order:${orderId}`);
      });
    });

    console.log('🔌 WebSocket service initialized');
  }

  // Emit order status update
  emitOrderUpdate(order) {
    if (!this.io) return;

    // Emit to the user who owns the order
    this.io.to(`user:${order.userId}`).emit('order_updated', {
      orderId: order.id,
      status: order.status,
      paymentStatus: order.paymentStatus,
      trackingNumber: order.trackingNumber,
      updatedAt: order.updatedAt
    });

    // Emit to admins
    this.io.to('admin').emit('order_updated', {
      orderId: order.id,
      userId: order.userId,
      status: order.status,
      paymentStatus: order.paymentStatus,
      trackingNumber: order.trackingNumber,
      totalAmount: order.totalAmount,
      updatedAt: order.updatedAt
    });

    // Emit to order-specific room
    this.io.to(`order:${order.id}`).emit('order_status_changed', {
      status: order.status,
      paymentStatus: order.paymentStatus,
      trackingNumber: order.trackingNumber,
      updatedAt: order.updatedAt
    });
  }

  // Emit new order notification
  emitNewOrder(order) {
    if (!this.io) return;

    // Notify admins of new order
    this.io.to('admin').emit('new_order', {
      orderId: order.id,
      userId: order.userId,
      userName: order.user?.name,
      userEmail: order.user?.email,
      totalAmount: order.totalAmount,
      itemCount: order.items?.length || 0,
      createdAt: order.createdAt
    });
  }

  // Emit payment status update
  emitPaymentUpdate(order, paymentData = {}) {
    if (!this.io) return;

    const updateData = {
      orderId: order.id,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      ...paymentData,
      updatedAt: order.updatedAt
    };

    // Emit to user
    this.io.to(`user:${order.userId}`).emit('payment_updated', updateData);

    // Emit to admins
    this.io.to('admin').emit('payment_updated', {
      ...updateData,
      userId: order.userId,
      totalAmount: order.totalAmount
    });
  }

  // Emit user profile update
  emitProfileUpdate(userId, userData) {
    if (!this.io) return;

    this.io.to(`user:${userId}`).emit('profile_updated', userData);
  }

  // Get connected users count
  getConnectedUsersCount() {
    return this.connectedUsers.size;
  }

  // Check if user is connected
  isUserConnected(userId) {
    return this.connectedUsers.has(userId);
  }
}

// Export singleton instance
module.exports = new WebSocketService();