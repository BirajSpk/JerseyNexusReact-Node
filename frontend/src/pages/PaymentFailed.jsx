import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { XCircle, RefreshCw, Home, ArrowLeft, AlertTriangle } from 'lucide-react';
import { orderAPI } from '../utils/api';
import toast from 'react-hot-toast';

const PaymentFailed = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const orderId = searchParams.get('orderId');
  const error = searchParams.get('error');
  const reason = searchParams.get('reason');

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId) {
        setLoading(false);
        return;
      }

      try {
        const response = await orderAPI.getOrderById(orderId);
        if (response.data.success) {
          setOrder(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching order:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  const getErrorMessage = () => {
    if (reason === 'payment_failed') {
      return 'Your payment could not be processed. Please try again.';
    }
    if (error === 'payment_not_found') {
      return 'Payment record not found. Please contact support.';
    }
    if (error === 'callback_error') {
      return 'There was an error processing your payment. Please try again.';
    }
    return 'Payment failed. Please try again or contact support.';
  };

  const handleRetryPayment = () => {
    if (order) {
      navigate('/payment-selection', {
        state: {
          order: order,
          totalAmount: order.totalAmount
        }
      });
    } else {
      navigate('/cart');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-red-50 to-orange-50 py-12">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto"
        >
          {/* Error Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center justify-center w-24 h-24 bg-red-100 rounded-full mb-4">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Failed</h1>
            <p className="text-gray-600">{getErrorMessage()}</p>
          </motion.div>

          {/* Error Details Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-lg p-8 mb-6"
          >
            <div className="border-b border-gray-200 pb-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {orderId && (
                  <div>
                    <p className="text-sm text-gray-500">Order ID</p>
                    <p className="font-semibold text-gray-900">#{orderId.slice(-8)}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500">Payment Status</p>
                  <p className="font-semibold text-red-600">Failed</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payment Method</p>
                  <p className="font-semibold text-gray-900">Khalti Digital Wallet</p>
                </div>
                {order && (
                  <div>
                    <p className="text-sm text-gray-500">Amount</p>
                    <p className="font-semibold text-gray-900">NPR {order.totalAmount?.toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Troubleshooting Tips */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <AlertTriangle className="w-5 h-5 text-yellow-500 mr-2" />
                What went wrong?
              </h3>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <ul className="text-sm text-yellow-800 space-y-2">
                  <li>• Insufficient balance in your Khalti wallet</li>
                  <li>• Network connectivity issues during payment</li>
                  <li>• Payment was cancelled or timed out</li>
                  <li>• Technical issue with the payment gateway</li>
                </ul>
              </div>
            </div>

            {/* Order Items (if available) */}
            {order?.items && order.items.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Items in Your Order</h3>
                <div className="space-y-3">
                  {order.items.slice(0, 3).map((item, index) => (
                    <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                      <img
                        src={item.product?.imageUrl || '/placeholder-product.jpg'}
                        alt={item.product?.name || 'Product'}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 text-sm">{item.product?.name || 'Product'}</h4>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 text-sm">
                          NPR {(item.quantity * item.price)?.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <p className="text-sm text-gray-500 text-center">
                      +{order.items.length - 3} more items
                    </p>
                  )}
                </div>
              </div>
            )}
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <button
              onClick={handleRetryPayment}
              className="flex-1 bg-primary text-white py-3 px-6 rounded-lg font-semibold text-center hover:bg-primary/90 transition-colors flex items-center justify-center space-x-2"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Retry Payment</span>
            </button>
            
            <Link
              to="/cart"
              className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold text-center hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Cart</span>
            </Link>
          </motion.div>

          {/* Support Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-8 text-center"
          >
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 text-sm">
                💬 Need help? Contact our support team at{' '}
                <a href="mailto:support@jerseynexus.com" className="font-semibold underline">
                  support@jerseynexus.com
                </a>
                <br />
                📞 Or call us at +977-1-234-5678
              </p>
            </div>
          </motion.div>

          {/* Alternative Payment Methods */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0 }}
            className="mt-6"
          >
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Try Alternative Payment Methods</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                  <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">E</span>
                  </div>
                  <span className="font-medium text-gray-900">eSewa Digital Wallet</span>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
                  <div className="w-8 h-8 bg-orange-600 rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">COD</span>
                  </div>
                  <span className="font-medium text-gray-900">Cash on Delivery</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default PaymentFailed;
