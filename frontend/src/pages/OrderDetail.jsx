import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from '../utils/motion.jsx'; // Temporary motion wrapper
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  Mail,
  Calendar,
  CreditCard
} from '../components/ui/ProfessionalIcon';
import toast from 'react-hot-toast';
import { orderAPI, paymentAPI } from '../utils/api';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await orderAPI.getOrderById(id);
        if (response.data.success) {
          setOrder(response.data.data.order);
        } else {
          throw new Error('Order not found');
        }
      } catch (error) {
        console.error('Error fetching order:', error);
        toast.error('Failed to load order details');
        navigate('/profile');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrder();
    }
  }, [id, navigate]);

  const handleRetryPayment = async () => {
    if (!order || order.paymentMethod !== 'KHALTI' || order.paymentStatus !== 'PENDING') {
      return;
    }

    setPaymentProcessing(true);
    try {
      // Initiate Khalti payment for the existing order
      const response = await paymentAPI.initiateKhalti({
        orderId: order.id,
        amount: order.totalAmount * 100, // Convert to paisa
        productName: `Order #${order.id.slice(-8)}`
      });

      if (response.data.success) {
        const { payment_url } = response.data.data;

        // Show notification before redirect
        toast.success('🚀 Redirecting to Khalti Payment...', {
          duration: 2000,
          style: {
            background: '#8B5CF6',
            color: '#fff',
          },
        });

        // Redirect to Khalti payment page after a short delay
        setTimeout(() => {
          window.location.href = payment_url;
        }, 1500);
      } else {
        throw new Error('Failed to initiate Khalti payment');
      }
    } catch (error) {
      console.error('Payment retry error:', error);
      toast.error('Failed to initiate payment. Please try again.');
    } finally {
      setPaymentProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral py-8">
        <div className="container">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <span className="ml-3 text-muted">Loading order details...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-neutral py-8">
        <div className="container">
          <div className="text-center py-12">
            <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-dark mb-2">Order Not Found</h2>
            <p className="text-muted mb-6">The order you're looking for doesn't exist or you don't have permission to view it.</p>
            <button
              onClick={() => navigate('/profile')}
              className="btn btn-primary"
            >
              Back to Profile
            </button>
          </div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'DELIVERED': return 'bg-green-100 text-green-800';
      case 'SHIPPED': return 'bg-blue-100 text-blue-800';
      case 'PROCESSING': return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'DELIVERED': return <CheckCircle className="w-5 h-5" />;
      case 'SHIPPED': return <Truck className="w-5 h-5" />;
      case 'PROCESSING': return <Package className="w-5 h-5" />;
      default: return <Clock className="w-5 h-5" />;
    }
  };

  const shippingAddress = typeof order.shippingAddress === 'string' 
    ? JSON.parse(order.shippingAddress) 
    : order.shippingAddress;

  return (
    <div className="min-h-screen bg-neutral py-8">
      <div className="container max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center space-x-4 mb-8"
        >
          <button 
            onClick={() => navigate('/profile')}
            className="p-2 hover:bg-white rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-dark">Order Details</h1>
            <p className="text-muted">Order #{order.id.slice(-8)}</p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Items */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Status */}
            <div className="bg-white rounded-lg shadow-soft p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-dark">Order Status</h2>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    <span>{order.status}</span>
                  </span>
                  {order.paymentMethod === 'KHALTI' && order.paymentStatus === 'PENDING' && (
                    <span className="inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      <Clock className="w-3 h-3" />
                      <span>Payment Pending</span>
                    </span>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted">Order Date</p>
                  <p className="font-medium text-dark">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-muted">Payment Method</p>
                  <p className="font-medium text-dark">
                    {order.paymentMethod === 'KHALTI' ? 'Khalti' : 
                     order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Card'}
                  </p>
                </div>
                <div>
                  <p className="text-muted">Payment Status</p>
                  <p className="font-medium text-dark">{order.paymentStatus}</p>
                </div>
                <div>
                  <p className="text-muted">Total Amount</p>
                  <p className="font-medium text-dark">NPR {order.totalAmount.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="bg-white rounded-lg shadow-soft p-6">
              <h2 className="text-xl font-semibold text-dark mb-6">Order Items</h2>
              <div className="space-y-4">
                {order.items?.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                    <img
                      src={item.product?.images || 'https://placehold.co/80x80/e5e7eb/6b7280?text=Product'}
                      alt={item.product?.name}
                      className="w-16 h-16 object-cover rounded"
                      onError={(e) => {
                        e.target.src = 'https://placehold.co/80x80/e5e7eb/6b7280?text=Product';
                      }}
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-dark">{item.product?.name}</h3>
                      <div className="text-sm text-muted space-y-1">
                        {item.size && <p>Size: {item.size}</p>}
                        {item.color && <p>Color: {item.color}</p>}
                        <p>Quantity: {item.quantity}</p>
                        <p>Price: NPR {item.price.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-dark">
                        NPR {(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Order Summary & Shipping */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="space-y-6"
          >
            {/* Shipping Address */}
            <div className="bg-white rounded-lg shadow-soft p-6">
              <h3 className="text-lg font-semibold text-dark mb-4 flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-primary" />
                <span>Shipping Address</span>
              </h3>
              
              <div className="space-y-2 text-sm">
                <div className="font-medium text-dark">{shippingAddress?.fullName}</div>
                <div className="text-muted">{shippingAddress?.address}</div>
                <div className="text-muted">{shippingAddress?.city}</div>
                <div className="flex items-center space-x-2 text-muted">
                  <Phone className="w-4 h-4" />
                  <span>{shippingAddress?.phone}</span>
                </div>
                <div className="flex items-center space-x-2 text-muted">
                  <Mail className="w-4 h-4" />
                  <span>{shippingAddress?.email}</span>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-soft p-6">
              <h3 className="text-lg font-semibold text-dark mb-4">Order Summary</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted">Subtotal</span>
                  <span className="text-dark">NPR {(order.totalAmount - (order.shippingCost || 0)).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Shipping</span>
                  <span className="text-dark">NPR {(order.shippingCost || 0).toLocaleString()}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-NPR {order.discountAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="border-t pt-3">
                  <div className="flex justify-between items-center text-lg font-bold text-dark">
                    <span>Total</span>
                    <span>NPR {order.totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              {/* Payment Retry Button for Pending Khalti Orders */}
              {order.paymentMethod === 'KHALTI' && order.paymentStatus === 'PENDING' && (
                <button
                  onClick={handleRetryPayment}
                  disabled={paymentProcessing}
                  className="w-full btn btn-primary bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {paymentProcessing ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Processing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <CreditCard className="w-4 h-4" />
                      <span>Complete Khalti Payment</span>
                    </div>
                  )}
                </button>
              )}

              <button
                onClick={() => navigate('/products')}
                className="w-full btn btn-primary"
              >
                Continue Shopping
              </button>

              {order.status === 'DELIVERED' && (
                <button
                  onClick={() => navigate(`/products/${order.items[0]?.product?.slug}?review=true`)}
                  className="w-full btn btn-outline"
                >
                  Write Review
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
