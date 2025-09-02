const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class PaymentService {
  // Create a new payment record
  async createPayment(paymentData) {
    try {
      let orderId = paymentData.orderId || null;

      // If no orderId is provided, create a new order from metadata.orderData
      if (!orderId && paymentData.metadata?.orderData) {
        let { orderData, userId } = paymentData.metadata;
        if (typeof orderData === 'string') {
          try {
            orderData = JSON.parse(orderData);
          } catch (e) {
            throw new Error('Invalid orderData JSON in payment metadata');
          }
        }
        if (!userId) {
          throw new Error('Missing userId in payment metadata');
        }
        if (!orderData?.items?.length) {
          throw new Error('No items found to create order');
        }

        // Fetch product prices in one query
        const productIds = orderData.items.map((it) => it.productId);
        const products = await prisma.product.findMany({
          where: { id: { in: productIds } },
          select: { id: true, price: true }
        });
        const priceMap = new Map(products.map(p => [p.id, p.price]));

        // Build order items with current prices
        const orderItems = orderData.items.map((item) => {
          const price = priceMap.get(item.productId);
          if (price == null) {
            throw new Error(`Product ${item.productId} not found`);
          }
          return {
            productId: item.productId,
            quantity: item.quantity,
            price,
            size: item.size || null,
            color: item.color || null
          };
        });

        // Compute totals
        const subtotal = orderItems.reduce((sum, it) => sum + it.price * it.quantity, 0);
        const shippingCost = orderData.shippingCost || 0;
        const discountAmount = orderData.discountAmount || 0;
        const totalAmount = subtotal + shippingCost - discountAmount;

        const createdOrder = await prisma.order.create({
          data: {
            userId,
            totalAmount,
            shippingCost,
            discountAmount,
            status: 'PENDING',
            paymentMethod: paymentData.method || 'COD',
            paymentStatus: 'PENDING',
            shippingAddress: typeof orderData.shippingAddress === 'string'
              ? orderData.shippingAddress
              : JSON.stringify(orderData.shippingAddress || {}),
            notes: orderData.notes,
            items: { create: orderItems }
          }
        });
        orderId = createdOrder.id;
      }

      const data = {
        amount: paymentData.amount,
        currency: paymentData.currency || 'NPR',
        method: paymentData.method,
        status: 'PENDING',
        externalId: paymentData.externalId || null,
        transactionId: paymentData.transactionId || null,
        referenceId: paymentData.referenceId || null,
        metadata: paymentData.metadata || {},
        initiatedAt: new Date(),
        orderId
      };

      const payment = await prisma.payment.create({ data });
      return payment;
    } catch (error) {
      console.error('Error creating payment:', error);
      throw new Error('Failed to create payment record');
    }
  }

  // Update payment status
  async updatePaymentStatus(paymentId, status, updateData = {}) {
    try {
      const updatePayload = {
        status,
        updatedAt: new Date(),
        ...updateData
      };

      // Set completion/failure timestamps
      if (status === 'SUCCESS') {
        updatePayload.completedAt = new Date();
      } else if (status === 'FAILED') {
        updatePayload.failedAt = new Date();
      }

      const payment = await prisma.payment.update({
        where: { id: paymentId },
        data: updatePayload,
        include: {
          order: true
        }
      });

      // Update order payment status based on payment status
      if (status === 'SUCCESS') {
        await prisma.order.update({
          where: { id: payment.orderId },
          data: {
            paymentStatus: 'PAID',
            paymentId: payment.externalId,
            status: 'CONFIRMED'
          }
        });
      } else if (status === 'FAILED') {
        await prisma.order.update({
          where: { id: payment.orderId },
          data: {
            paymentStatus: 'FAILED'
          }
        });
      }

      return payment;
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw new Error('Failed to update payment status');
    }
  }

  // Get payment by ID
  async getPaymentById(paymentId) {
    try {
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: {
          order: {
            include: {
              user: true,
              items: true
            }
          }
        }
      });

      return payment;
    } catch (error) {
      console.error('Error fetching payment:', error);
      throw new Error('Failed to fetch payment');
    }
  }

  // Get payment by external ID (Khalti/eSewa payment ID)
  async getPaymentByExternalId(externalId) {
    try {
      const payment = await prisma.payment.findFirst({
        where: { externalId },
        include: {
          order: {
            include: {
              user: true,
              items: true
            }
          }
        }
      });

      return payment;
    } catch (error) {
      console.error('Error fetching payment by external ID:', error);
      throw new Error('Failed to fetch payment');
    }
  }

  // Get payments for an order
  async getPaymentsByOrderId(orderId) {
    try {
      const payments = await prisma.payment.findMany({
        where: { orderId },
        orderBy: { createdAt: 'desc' },
        include: {
          order: true
        }
      });

      return payments;
    } catch (error) {
      console.error('Error fetching payments for order:', error);
      throw new Error('Failed to fetch payments');
    }
  }

  // Get all payments with pagination
  async getAllPayments(page = 1, limit = 10, filters = {}) {
    try {
      const skip = (page - 1) * limit;
      const where = {};

      // Apply filters
      if (filters.status) {
        where.status = filters.status;
      }
      if (filters.method) {
        where.method = filters.method;
      }
      if (filters.orderId) {
        where.orderId = filters.orderId;
      }

      const [payments, total] = await Promise.all([
        prisma.payment.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            order: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true
                  }
                }
              }
            }
          }
        }),
        prisma.payment.count({ where })
      ]);

      return {
        payments,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error fetching payments:', error);
      throw new Error('Failed to fetch payments');
    }
  }

  // Process COD payment
  async processCODPayment(orderId) {
    try {
      // Create payment record for COD
      const payment = await this.createPayment({
        orderId,
        amount: 0, // COD amount is collected on delivery
        method: 'COD',
        status: 'PENDING',
        metadata: {
          type: 'cash_on_delivery',
          note: 'Payment to be collected on delivery'
        }
      });

      // Update order status
      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'PENDING',
          status: 'CONFIRMED'
        }
      });

      return payment;
    } catch (error) {
      console.error('Error processing COD payment:', error);
      throw new Error('Failed to process COD payment');
    }
  }

  // Mark COD payment as completed (when delivered)
  async completeCODPayment(paymentId, collectedAmount) {
    try {
      const payment = await this.updatePaymentStatus(paymentId, 'SUCCESS', {
        amount: collectedAmount,
        completedAt: new Date(),
        metadata: {
          type: 'cash_on_delivery',
          collectedAmount,
          collectedAt: new Date()
        }
      });

      return payment;
    } catch (error) {
      console.error('Error completing COD payment:', error);
      throw new Error('Failed to complete COD payment');
    }
  }

  // Refund payment
  async refundPayment(paymentId, refundAmount, reason) {
    try {
      const payment = await this.updatePaymentStatus(paymentId, 'REFUNDED', {
        metadata: {
          refundAmount,
          refundReason: reason,
          refundedAt: new Date()
        }
      });

      // Update order status
      await prisma.order.update({
        where: { id: payment.orderId },
        data: {
          paymentStatus: 'REFUNDED',
          status: 'CANCELLED'
        }
      });

      return payment;
    } catch (error) {
      console.error('Error processing refund:', error);
      throw new Error('Failed to process refund');
    }
  }
}

module.exports = new PaymentService();
