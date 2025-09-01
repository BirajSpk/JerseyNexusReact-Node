import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from '../utils/motion.jsx'; // Temporary motion wrapper
import {
  CreditCard,
  Truck,
  CheckCircle,
  ArrowLeft,
  Clock,
  Shield,
  Banknote
} from '../components/ui/ProfessionalIcon';
import toast from 'react-hot-toast';
import { paymentAPI } from '../utils/api';

const PaymentSelection = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState('');
  
  // Get order data from location state
  const { order, totalAmount } = location.state || {};

  useEffect(() => {
    if (!order) {
      navigate('/cart');
      return;
    }

    // Set default payment method
    setSelectedPayment('cod');
  }, [order, navigate]);

  const handlePaymentSelection = async () => {
    if (!selectedPayment) {
      toast.error('Please select a payment method');
      return;
    }

    setIsProcessing(true);

    try {
      if (selectedPayment === 'khalti') {
        // Initiate Khalti payment
        const response = await paymentAPI.initiateKhalti({
          orderId: order.id,
          amount: totalAmount * 100, // Khalti expects amount in paisa
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
      } else if (selectedPayment === 'esewa') {
        // Initiate eSewa payment
        const response = await paymentAPI.initiateEsewa({
          orderId: order.id,
          amount: totalAmount,
          productName: `Order #${order.id.slice(-8)}`
        });

        if (response.data.success) {
          const { payment_url } = response.data.data;

          // Show notification before redirect
          toast.success('🚀 Redirecting to eSewa Payment...', {
            duration: 2000,
            style: {
              background: '#10B981',
              color: '#fff',
            },
          });

          // Redirect to eSewa payment page after a short delay
          setTimeout(() => {
            window.location.href = payment_url;
          }, 1500);
        } else {
          throw new Error('Failed to initiate eSewa payment');
        }
      } else if (selectedPayment === 'cod') {
        // Process Cash on Delivery
        const response = await paymentAPI.processCOD({
          orderId: order.id
        });

        if (response.data.success) {
          // Show success notification
          toast.success('🎉 Order Placed Successfully!', {
            duration: 4000,
            style: {
              background: '#10B981',
              color: '#fff',
            },
          });

          // Additional notification for COD
          setTimeout(() => {
            toast.success('💰 You will pay on delivery', {
              duration: 3000,
            });
          }, 1000);

          navigate('/order-success', {
            state: {
              order,
              paymentMethod: 'cod',
              message: 'Your order has been confirmed. You will pay when the order is delivered.'
            }
          });
        } else {
          throw new Error('Failed to process COD order');
        }
      } else {
        // For other payment methods (future implementation)
        toast.info('This payment method will be available soon');
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      toast.error(error.response?.data?.error || 'Payment processing failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!order) {
    return null;
  }

  return (
    <div className="min-h-screen bg-neutral py-8">
      <div className="container max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center space-x-4 mb-8"
        >
          <button
            onClick={() => navigate('/checkout')}
            className="p-2 hover:bg-white rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-dark">Complete Your Payment</h1>
            <p className="text-muted">Order #{order.id.slice(-8)} • NPR {totalAmount.toLocaleString()}</p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Options */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-lg shadow-soft p-6"
            >
              <h2 className="text-xl font-semibold text-dark mb-6">Choose Payment Method</h2>
              
              <div className="space-y-4">
                {/* Cash on Delivery */}
                <div
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedPayment === 'cod'
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedPayment('cod')}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        checked={selectedPayment === 'cod'}
                        onChange={() => setSelectedPayment('cod')}
                        className="text-primary"
                      />
                      <Truck className="h-6 w-6 text-primary" />
                      <div>
                        <span className="font-medium text-lg">Cash on Delivery</span>
                        <p className="text-sm text-muted">Pay when your order arrives</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs bg-accent text-white px-2 py-1 rounded-full">
                        Most Popular
                      </span>
                      <Banknote className="h-5 w-5 text-accent" />
                    </div>
                  </div>
                  <div className="mt-3 ml-9 text-sm text-muted">
                    <div className="flex items-center space-x-2">
                      <Shield className="h-4 w-4 text-green-500" />
                      <span>No advance payment required</span>
                    </div>
                  </div>
                </div>

                {/* Khalti Payment */}
                <div
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedPayment === 'khalti'
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedPayment('khalti')}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      checked={selectedPayment === 'khalti'}
                      onChange={() => setSelectedPayment('khalti')}
                      className="text-primary"
                    />
                    <div className="flex items-center space-x-3">
                      <img 
                        src="https://khalti.s3.ap-south-1.amazonaws.com/website/khalti-logo-white.png" 
                        alt="Khalti" 
                        className="h-8 w-auto bg-purple-600 px-3 py-2 rounded"
                      />
                      <div>
                        <span className="font-medium text-lg">Khalti Digital Wallet</span>
                        <p className="text-sm text-muted">Pay instantly with Khalti</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 ml-9 text-sm text-muted">
                    <div className="flex items-center space-x-2">
                      <Shield className="h-4 w-4 text-green-500" />
                      <span>Secure & instant payment</span>
                    </div>
                  </div>
                </div>

                {/* eSewa Payment */}
                <div
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedPayment === 'esewa'
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedPayment('esewa')}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      checked={selectedPayment === 'esewa'}
                      onChange={() => setSelectedPayment('esewa')}
                      className="text-primary"
                    />
                    <div className="flex items-center space-x-3">
                      <img
                        src="https://esewa.com.np/common/images/esewa-logo.png"
                        alt="eSewa"
                        className="h-8 w-auto bg-green-600 px-3 py-2 rounded"
                      />
                      <div>
                        <span className="font-medium text-lg">eSewa Digital Wallet</span>
                        <p className="text-sm text-muted">Pay instantly with eSewa</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 ml-9 text-sm text-muted">
                    <div className="flex items-center space-x-2">
                      <Shield className="h-4 w-4 text-green-500" />
                      <span>Secure & instant payment</span>
                    </div>
                  </div>
                </div>

                {/* Credit/Debit Card */}
                <div
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-colors opacity-50 ${
                    selectedPayment === 'card'
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200'
                  }`}
                  onClick={() => setSelectedPayment('card')}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      checked={selectedPayment === 'card'}
                      onChange={() => setSelectedPayment('card')}
                      className="text-primary"
                      disabled
                    />
                    <CreditCard className="h-6 w-6 text-gray-400" />
                    <div>
                      <span className="font-medium text-lg text-gray-400">Credit/Debit Card</span>
                      <p className="text-sm text-muted">Coming soon</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Button */}
              <button
                onClick={handlePaymentSelection}
                disabled={isProcessing || !selectedPayment}
                className="w-full btn btn-primary py-4 mt-8 text-lg font-semibold flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    <span>
                      {selectedPayment === 'cod' ? 'Confirm Order' : 
                       selectedPayment === 'khalti' ? 'Pay with Khalti' : 
                       'Continue'}
                    </span>
                  </>
                )}
              </button>
            </motion.div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-lg shadow-soft p-6 sticky top-8"
            >
              <h3 className="text-lg font-semibold text-dark mb-4">Order Summary</h3>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Order ID</span>
                  <span className="font-medium">#{order.id.slice(-8)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Items</span>
                  <span className="font-medium">{order.items?.length || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Subtotal</span>
                  <span className="font-medium">NPR {(totalAmount - (order.shippingCost || 0)).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Shipping</span>
                  <span className="font-medium">NPR {(order.shippingCost || 0).toLocaleString()}</span>
                </div>
              </div>
              
              <div className="border-t pt-3">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span className="text-primary">NPR {totalAmount.toLocaleString()}</span>
                </div>
              </div>

              {/* Security Notice */}
              <div className="mt-6 p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-2 text-green-700">
                  <Shield className="h-4 w-4" />
                  <span className="text-sm font-medium">Secure Payment</span>
                </div>
                <p className="text-xs text-green-600 mt-1">
                  Your payment information is encrypted and secure
                </p>
              </div>

              {/* Delivery Info */}
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2 text-blue-700">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm font-medium">Delivery Time</span>
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  Expected delivery in 3-5 business days
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSelection;
