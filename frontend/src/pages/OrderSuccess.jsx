import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from '../utils/motion.jsx'; // Temporary motion wrapper
import { CheckCircle, Package, Truck, Home, ArrowRight } from '../components/ui/SimpleIcon';
import { orderAPI } from '../utils/api';
import toast from 'react-hot-toast';

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get data from location state (for normal checkout flow)
  const stateOrderData = location.state?.orderData;
  const stateOrder = location.state?.order;
  const paymentMethod = location.state?.paymentMethod;

  // Get data from query params (for payment callback redirects)
  const queryOrderId = searchParams.get('orderId');
  const transactionId = searchParams.get('transactionId');

  useEffect(() => {
    const loadOrderData = async () => {
      try {
        // If we have order data from state, use it
        if (stateOrderData || stateOrder) {
          setOrderData(stateOrderData || stateOrder);
          setLoading(false);
          return;
        }

        // If we have orderId from query params, fetch the order
        if (queryOrderId) {
          const response = await orderAPI.getOrderById(queryOrderId);
          if (response.data.success) {
            setOrderData(response.data.data);
            toast.success('Order confirmed successfully!');
          } else {
            throw new Error('Failed to load order details');
          }
        } else {
          // No order data available, redirect to home
          navigate('/');
          return;
        }
      } catch (error) {
        console.error('Error loading order:', error);
        toast.error('Failed to load order details');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    loadOrderData();
  }, [stateOrderData, stateOrder, queryOrderId, navigate]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-neutral py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted">Loading order details...</p>
        </div>
      </div>
    );
  }

  // Redirect if no order data
  if (!orderData) {
    return null;
  }

  // Extract data based on structure
  const items = orderData.items || [];
  const total = orderData.totalAmount || orderData.total || 0;
  const shipping = orderData.shippingAddress ?
    (typeof orderData.shippingAddress === 'string' ?
      JSON.parse(orderData.shippingAddress) :
      orderData.shippingAddress) :
    orderData.shipping;
  const finalPaymentMethod = paymentMethod || orderData.paymentMethod || 'khalti';
  const orderId = orderData.id ? `#${orderData.id.slice(-8)}` : `JN${Date.now().toString().slice(-6)}`;

  // Show transaction ID if available (from Khalti callback)
  const displayTransactionId = transactionId || orderData.transactionId;
  
  return (
    <div className="min-h-screen bg-neutral py-12">
      <div className="container max-w-4xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-accent/10 rounded-full mb-6"
          >
            <CheckCircle className="h-10 w-10 text-accent" />
          </motion.div>
          
          <h1 className="text-4xl font-bold text-dark mb-4">Order Confirmed!</h1>
          <p className="text-xl text-muted mb-2">Thank you for your purchase</p>
          <p className="text-muted">Order ID: <span className="font-semibold text-dark">{orderId}</span></p>
          {displayTransactionId && (
            <p className="text-muted">Transaction ID: <span className="font-semibold text-dark">{displayTransactionId}</span></p>
          )}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="lg:col-span-2 bg-white rounded-lg shadow-soft p-6"
          >
            <h2 className="text-xl font-semibold text-dark mb-6 flex items-center space-x-2">
              <Package className="h-5 w-5 text-primary" />
              <span>Order Details</span>
            </h2>
            
            <div className="space-y-4 mb-6">
              {items.map((item, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                  <img
                    src={item.image || 'https://placehold.co/80x80/e5e7eb/6b7280?text=Product'}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded"
                    onError={(e) => {
                      e.target.src = 'https://placehold.co/80x80/e5e7eb/6b7280?text=Product';
                    }}
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-dark">{item.name}</h3>
                    {item.size && (
                      <p className="text-sm text-muted">Size: {item.size}</p>
                    )}
                    {item.color && (
                      <p className="text-sm text-muted">Color: {item.color}</p>
                    )}
                    <p className="text-sm text-muted">Quantity: {item.quantity}</p>
                  </div>
                  <span className="font-semibold text-dark">
                    NPR {(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
            
            <div className="border-t pt-4">
              <div className="flex justify-between items-center text-lg font-bold text-dark">
                <span>Total Paid</span>
                <span>NPR {(total + (total > 5000 ? 0 : 200)).toLocaleString()}</span>
              </div>
              <div className="text-sm text-muted mt-1">
                Payment Method: {finalPaymentMethod === 'khalti' ? 'Khalti Digital Wallet' : finalPaymentMethod === 'card' ? 'Credit/Debit Card' : 'Cash on Delivery'}
              </div>
            </div>
          </motion.div>

          {/* Shipping Info & Next Steps */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="space-y-6"
          >
            {/* Shipping Information */}
            <div className="bg-white rounded-lg shadow-soft p-6">
              <h3 className="text-lg font-semibold text-dark mb-4 flex items-center space-x-2">
                <Truck className="h-5 w-5 text-primary" />
                <span>Shipping Info</span>
              </h3>
              
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-dark">{shipping.name}</span>
                </div>
                <div className="text-muted">{shipping.email}</div>
                <div className="text-muted">{shipping.phone}</div>
                <div className="text-muted">
                  {shipping.address}, {shipping.city}
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-primary/5 rounded-lg">
                <p className="text-sm text-primary font-medium">
                  Estimated Delivery: 3-5 business days
                </p>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-white rounded-lg shadow-soft p-6">
              <h3 className="text-lg font-semibold text-dark mb-4">What's Next?</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-accent rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-dark">Order Confirmation</p>
                    <p className="text-muted">You'll receive an email confirmation shortly</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-gray-300 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-dark">Processing</p>
                    <p className="text-muted">We'll prepare your order for shipping</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-gray-300 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-dark">Shipping</p>
                    <p className="text-muted">Your order will be on its way</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-gray-300 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-dark">Delivery</p>
                    <p className="text-muted">Enjoy your authentic sportswear!</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Link
                to="/products"
                className="w-full btn btn-primary py-3 flex items-center justify-center space-x-2"
              >
                <span>Continue Shopping</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              
              <Link
                to="/"
                className="w-full btn btn-outline py-3 flex items-center justify-center space-x-2"
              >
                <Home className="h-4 w-4" />
                <span>Back to Home</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;