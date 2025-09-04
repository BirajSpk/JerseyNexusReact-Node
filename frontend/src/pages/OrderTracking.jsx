import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { orderAPI } from '../utils/api';

const OrderTracking = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const orderStatuses = [
    {
      key: 'PENDING',
      label: 'Order Placed',
      description: 'Your order has been received and is being processed',
      icon: '📝',
      color: 'text-yellow-600'
    },
    {
      key: 'PROCESSING',
      label: 'Processing',
      description: 'Your order is being prepared for shipment',
      icon: '⚙️',
      color: 'text-blue-600'
    },
    {
      key: 'SHIPPED',
      label: 'Shipped',
      description: 'Your order has been shipped and is on its way',
      icon: '📦',
      color: 'text-purple-600'
    },
    {
      key: 'OUT_FOR_DELIVERY',
      label: 'Out for Delivery',
      description: 'Your order is out for delivery and will arrive soon',
      icon: '🚚',
      color: 'text-indigo-600'
    },
    {
      key: 'DELIVERED',
      label: 'Delivered',
      description: 'Your order has been successfully delivered',
      icon: '✅',
      color: 'text-green-600'
    }
  ];

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchOrderDetails();
  }, [orderId, isAuthenticated]);

  const fetchOrderDetails = async () => {
    try {
      const response = await orderAPI.getOrderById(orderId);
      setOrder(response.data.data.order);
    } catch (error) {
      console.error('Error fetching order details:', error);
      setError('Failed to load order details');
      // Mock data for demonstration
      setOrder({
        id: orderId,
        orderNumber: 'ORD-001',
        status: 'SHIPPED',
        totalAmount: 4500,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        shippingAddress: {
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'USA'
        },
        items: [
          {
            id: '1',
            product: {
              name: 'Manchester United Home Jersey 2024',
              images: '/uploads/man-utd-home.jpg'
            },
            quantity: 1,
            price: 4500,
            size: 'L',
            color: 'Red'
          }
        ],
        statusHistory: [
          {
            status: 'PENDING',
            timestamp: new Date(Date.now() - 172800000).toISOString(),
            description: 'Order placed successfully'
          },
          {
            status: 'PROCESSING',
            timestamp: new Date(Date.now() - 86400000).toISOString(),
            description: 'Order is being prepared'
          },
          {
            status: 'SHIPPED',
            timestamp: new Date(Date.now() - 43200000).toISOString(),
            description: 'Order shipped via Express Delivery'
          }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const getCurrentStatusIndex = () => {
    return orderStatuses.findIndex(status => status.key === order?.status);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NP', {
      style: 'currency',
      currency: 'NPR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h1>
          <p className="text-gray-600 mb-4">{error || 'The order you are looking for does not exist.'}</p>
          <button
            onClick={() => navigate('/profile')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            View All Orders
          </button>
        </div>
      </div>
    );
  }

  const currentStatusIndex = getCurrentStatusIndex();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Order #{order.orderNumber || order.id.slice(-8)}
              </h1>
              <p className="text-gray-600">
                Placed on {formatDate(order.createdAt)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Total Amount</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(order.totalAmount)}
              </p>
            </div>
          </div>
        </div>

        {/* Order Status Timeline */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Order Status</h2>
          
          <div className="relative">
            {/* Progress Line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
            <div 
              className="absolute left-6 top-0 w-0.5 bg-blue-600 transition-all duration-500"
              style={{ height: `${(currentStatusIndex / (orderStatuses.length - 1)) * 100}%` }}
            ></div>

            {/* Status Steps */}
            <div className="space-y-8">
              {orderStatuses.map((status, index) => {
                const isCompleted = index <= currentStatusIndex;
                const isCurrent = index === currentStatusIndex;
                const statusHistory = order.statusHistory?.find(h => h.status === status.key);

                return (
                  <div key={status.key} className="relative flex items-start">
                    {/* Status Icon */}
                    <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2 ${
                      isCompleted 
                        ? 'bg-blue-600 border-blue-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-400'
                    }`}>
                      <span className="text-lg">{status.icon}</span>
                    </div>

                    {/* Status Content */}
                    <div className="ml-6 flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className={`text-lg font-medium ${
                          isCompleted ? status.color : 'text-gray-400'
                        }`}>
                          {status.label}
                        </h3>
                        {statusHistory && (
                          <span className="text-sm text-gray-500">
                            {formatDate(statusHistory.timestamp)}
                          </span>
                        )}
                      </div>
                      <p className={`text-sm ${
                        isCompleted ? 'text-gray-600' : 'text-gray-400'
                      }`}>
                        {statusHistory?.description || status.description}
                      </p>
                      {isCurrent && (
                        <div className="mt-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Current Status
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h2>
          <div className="space-y-4">
            {order.items.map((item, index) => (
              <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">👕</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{item.product.name}</h3>
                  <div className="text-sm text-gray-500 space-x-4">
                    <span>Quantity: {item.quantity}</span>
                    {item.size && <span>Size: {item.size}</span>}
                    {item.color && <span>Color: {item.color}</span>}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">
                    {formatCurrency(item.price * item.quantity)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatCurrency(item.price)} each
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping Information */}
        {order.shippingAddress && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Shipping Address</h2>
            <div className="text-gray-600">
              <p>{order.shippingAddress.street}</p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
              </p>
              <p>{order.shippingAddress.country}</p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => navigate('/profile')}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            View All Orders
          </button>
          <button
            onClick={() => navigate('/contact')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
