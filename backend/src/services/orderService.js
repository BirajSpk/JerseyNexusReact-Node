const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class OrderService {
  // Get order by ID with all relations
  async getOrderById(orderId) {
    try {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true
            }
          },
          items: {
            include: {
              product: {
                include: {
                  category: { select: { id: true, name: true } },
                  productImages: {
                    orderBy: { sortOrder: 'asc' },
                    take: 1
                  }
                }
              }
            }
          },
          payments: {
            orderBy: { createdAt: 'desc' }
          }
        }
      });

      return order;
    } catch (error) {
      console.error('Error fetching order:', error);
      throw new Error('Failed to fetch order');
    }
  }

  // Get orders for a user
  async getUserOrders(userId, page = 1, limit = 10) {
    try {
      const skip = (page - 1) * limit;

      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          where: { userId },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            items: {
              include: {
                product: {
                  include: {
                    category: { select: { id: true, name: true } },
                    productImages: {
                      orderBy: { sortOrder: 'asc' },
                      take: 1
                    }
                  }
                }
              }
            },
            payments: {
              orderBy: { createdAt: 'desc' },
              take: 1
            }
          }
        }),
        prisma.order.count({ where: { userId } })
      ]);

      // Handle missing products and format product images
      const ordersWithProductInfo = orders.map(order => ({
        ...order,
        items: order.items.map(item => ({
          ...item,
          product: item.product ? {
            ...item.product,
            // Add primary image URL for easy access
            image: item.product.productImages?.[0]?.url || null,
            images: item.product.productImages?.[0]?.url || null // For backward compatibility
          } : {
            id: item.productId,
            name: 'Product no longer available',
            price: item.price,
            stock: 0,
            image: null,
            images: null
          }
        }))
      }));

      return {
        orders: ordersWithProductInfo,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error fetching user orders:', error);
      throw new Error('Failed to fetch orders');
    }
  }

  // Get all orders (admin)
  async getAllOrders(page = 1, limit = 10, filters = {}) {
    try {
      const skip = (page - 1) * limit;
      const where = {};

      // Apply filters
      if (filters.status) {
        where.status = filters.status;
      }
      if (filters.paymentStatus) {
        where.paymentStatus = filters.paymentStatus;
      }
      if (filters.paymentMethod) {
        where.paymentMethod = filters.paymentMethod;
      }
      if (filters.userId) {
        where.userId = filters.userId;
      }

      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true
              }
            },
            items: {
              include: {
                product: {
                  include: {
                    category: { select: { id: true, name: true } },
                    productImages: {
                      orderBy: { sortOrder: 'asc' },
                      take: 1
                    }
                  }
                }
              }
            },
            payments: {
              orderBy: { createdAt: 'desc' },
              take: 1
            }
          }
        }),
        prisma.order.count({ where })
      ]);

      // Format product images for consistency
      const ordersWithFormattedProducts = orders.map(order => ({
        ...order,
        items: order.items.map(item => ({
          ...item,
          product: item.product ? {
            ...item.product,
            // Add primary image URL for easy access
            image: item.product.productImages?.[0]?.url || null,
            images: item.product.productImages?.[0]?.url || null // For backward compatibility
          } : {
            id: item.productId,
            name: 'Product no longer available',
            price: item.price,
            image: null,
            images: null
          }
        }))
      }));

      return {
        orders: ordersWithFormattedProducts,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw new Error('Failed to fetch orders');
    }
  }

  // Create new order
  async createOrder(orderData) {
    try {
      const order = await prisma.order.create({
        data: {
          userId: orderData.userId,
          totalAmount: orderData.totalAmount,
          shippingCost: orderData.shippingCost || 0,
          discountAmount: orderData.discountAmount || 0,
          shippingAddress: JSON.stringify(orderData.shippingAddress),
          paymentMethod: orderData.paymentMethod || 'COD',
          paymentStatus: 'PENDING',
          status: 'PROCESSING',
          notes: orderData.notes,
          items: {
            create: orderData.items.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
              size: item.size,
              color: item.color
            }))
          }
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true
            }
          },
          items: {
            include: {
              product: {
                include: {
                  category: { select: { id: true, name: true } },
                  productImages: {
                    orderBy: { sortOrder: 'asc' },
                    take: 1
                  }
                }
              }
            }
          }
        }
      });

      // Format product images for consistency
      const orderWithFormattedProducts = {
        ...order,
        items: order.items.map(item => ({
          ...item,
          product: item.product ? {
            ...item.product,
            // Add primary image URL for easy access
            image: item.product.productImages?.[0]?.url || null,
            images: item.product.productImages?.[0]?.url || null // For backward compatibility
          } : {
            id: item.productId,
            name: 'Product no longer available',
            price: item.price,
            image: null,
            images: null
          }
        }))
      };

      return orderWithFormattedProducts;
    } catch (error) {
      console.error('Error creating order:', error);
      throw new Error('Failed to create order');
    }
  }

  // Update order status
  async updateOrderStatus(orderId, status, adminNotes = null) {
    try {
      const updateData = {
        status,
        updatedAt: new Date()
      };

      if (adminNotes) {
        updateData.adminNotes = adminNotes;
      }

      const order = await prisma.order.update({
        where: { id: orderId },
        data: updateData,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true
            }
          },
          items: {
            include: {
              product: {
                include: {
                  category: { select: { id: true, name: true } },
                  productImages: {
                    orderBy: { sortOrder: 'asc' },
                    take: 1
                  }
                }
              }
            }
          },
          payments: {
            orderBy: { createdAt: 'desc' }
          }
        }
      });

      // Format product images for consistency
      const orderWithFormattedProducts = {
        ...order,
        items: order.items.map(item => ({
          ...item,
          product: item.product ? {
            ...item.product,
            // Add primary image URL for easy access
            image: item.product.productImages?.[0]?.url || null,
            images: item.product.productImages?.[0]?.url || null // For backward compatibility
          } : {
            id: item.productId,
            name: 'Product no longer available',
            price: item.price,
            image: null,
            images: null
          }
        }))
      };

      return orderWithFormattedProducts;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw new Error('Failed to update order status');
    }
  }

  // Update payment status
  async updatePaymentStatus(orderId, paymentStatus, paymentId = null) {
    try {
      const updateData = {
        paymentStatus,
        updatedAt: new Date()
      };

      if (paymentId) {
        updateData.paymentId = paymentId;
      }

      // Auto-update order status based on payment status
      if (paymentStatus === 'PAID') {
        updateData.status = 'CONFIRMED';
      } else if (paymentStatus === 'FAILED') {
        updateData.status = 'CANCELLED';
      }

      const order = await prisma.order.update({
        where: { id: orderId },
        data: updateData,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true
            }
          },
          items: {
            include: {
              product: {
                include: {
                  category: { select: { id: true, name: true } },
                  productImages: {
                    orderBy: { sortOrder: 'asc' },
                    take: 1
                  }
                }
              }
            }
          },
          payments: {
            orderBy: { createdAt: 'desc' }
          }
        }
      });

      // Format product images for consistency
      const orderWithFormattedProducts = {
        ...order,
        items: order.items.map(item => ({
          ...item,
          product: item.product ? {
            ...item.product,
            // Add primary image URL for easy access
            image: item.product.productImages?.[0]?.url || null,
            images: item.product.productImages?.[0]?.url || null // For backward compatibility
          } : {
            id: item.productId,
            name: 'Product no longer available',
            price: item.price,
            image: null,
            images: null
          }
        }))
      };

      return orderWithFormattedProducts;
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw new Error('Failed to update payment status');
    }
  }

  // Delete order (only if payment is pending)
  async deleteOrder(orderId, userId) {
    try {
      // Check if order exists and belongs to user
      const order = await prisma.order.findFirst({
        where: {
          id: orderId,
          userId: userId,
          paymentStatus: 'PENDING' // Only allow deletion of pending orders
        }
      });

      if (!order) {
        throw new Error('Order not found or cannot be deleted');
      }

      // Delete order (cascade will handle order items and payments)
      await prisma.order.delete({
        where: { id: orderId }
      });

      return { success: true, message: 'Order deleted successfully' };
    } catch (error) {
      console.error('Error deleting order:', error);
      throw new Error('Failed to delete order');
    }
  }

  // Get order statistics (admin)
  async getOrderStatistics() {
    try {
      const [
        totalOrders,
        pendingOrders,
        confirmedOrders,
        shippedOrders,
        deliveredOrders,
        cancelledOrders,
        totalRevenue,
        pendingPayments
      ] = await Promise.all([
        prisma.order.count(),
        prisma.order.count({ where: { status: 'PROCESSING' } }),
        prisma.order.count({ where: { status: 'CONFIRMED' } }),
        prisma.order.count({ where: { status: 'SHIPPED' } }),
        prisma.order.count({ where: { status: 'DELIVERED' } }),
        prisma.order.count({ where: { status: 'CANCELLED' } }),
        prisma.order.aggregate({
          where: { paymentStatus: 'PAID' },
          _sum: { totalAmount: true }
        }),
        prisma.order.count({ where: { paymentStatus: 'PENDING' } })
      ]);

      return {
        totalOrders,
        ordersByStatus: {
          pending: pendingOrders,
          confirmed: confirmedOrders,
          shipped: shippedOrders,
          delivered: deliveredOrders,
          cancelled: cancelledOrders
        },
        totalRevenue: totalRevenue._sum.totalAmount || 0,
        pendingPayments
      };
    } catch (error) {
      console.error('Error fetching order statistics:', error);
      throw new Error('Failed to fetch order statistics');
    }
  }
}

module.exports = new OrderService();
