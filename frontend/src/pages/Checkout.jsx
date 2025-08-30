import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { 
  CreditCard, 
  Truck, 
  MapPin, 
  User, 
  Mail, 
  Phone, 
  ArrowLeft,
  Lock,
  CheckCircle
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { clearCart } from '../store/slices/cartSlice';

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { items, total } = useSelector((state) => state.cart);
  
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Get items from location state (for Buy Now) or cart
  const checkoutItems = location.state?.items || items;
  const checkoutTotal = location.state?.total || total;
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue
  } = useForm();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { 
        state: { 
          from: location,
          message: 'Please login to continue with your purchase'
        }
      });
    }
  }, [isAuthenticated, navigate, location]);

  // Pre-fill form with user data
  useEffect(() => {
    if (user) {
      setValue('email', user.email);
      setValue('name', user.name);
    }
  }, [user, setValue]);

  // Redirect if no items
  useEffect(() => {
    if (!checkoutItems || checkoutItems.length === 0) {
      navigate('/cart');
    }
  }, [checkoutItems, navigate]);

  const onSubmit = async (data) => {
    setIsProcessing(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Clear cart if items came from cart
      if (!location.state?.items) {
        dispatch(clearCart());
      }
      
      toast.success('Order placed successfully!');
      navigate('/order-success', {
        state: {
          orderData: {
            items: checkoutItems,
            total: checkoutTotal,
            shipping: data,
            paymentMethod
          }
        }
      });
      
    } catch (error) {
      toast.error('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isAuthenticated || !checkoutItems || checkoutItems.length === 0) {
    return null;
  }

  const shippingCost = checkoutTotal > 5000 ? 0 : 200;
  const finalTotal = checkoutTotal + shippingCost;

  return (
    <div className="min-h-screen bg-neutral py-8">
      <div className="container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center space-x-4 mb-8"
        >
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-3xl font-bold text-dark">Checkout</h1>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Form */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="bg-white rounded-lg shadow-soft p-6 mb-6"
            >
              <h2 className="text-xl font-semibold text-dark mb-6 flex items-center space-x-2">
                <Truck className="h-5 w-5 text-primary" />
                <span>Shipping Information</span>
              </h2>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-dark mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted" />
                      <input
                        type="text"
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                          errors.name ? 'border-danger' : 'border-gray-300'
                        }`}
                        placeholder="Enter your full name"
                        {...register('name', {
                          required: 'Full name is required',
                          minLength: {
                            value: 2,
                            message: 'Name must be at least 2 characters'
                          }
                        })}
                      />
                    </div>
                    {errors.name && (
                      <p className="mt-1 text-sm text-danger">{errors.name.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-dark mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted" />
                      <input
                        type="email"
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                          errors.email ? 'border-danger' : 'border-gray-300'
                        }`}
                        placeholder="Enter your email"
                        {...register('email', {
                          required: 'Email is required',
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Invalid email address'
                          }
                        })}
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-1 text-sm text-danger">{errors.email.message}</p>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-dark mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted" />
                      <input
                        type="tel"
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                          errors.phone ? 'border-danger' : 'border-gray-300'
                        }`}
                        placeholder="Enter your phone number"
                        {...register('phone', {
                          required: 'Phone number is required',
                          pattern: {
                            value: /^[\+]?[0-9]{10,15}$/,
                            message: 'Invalid phone number'
                          }
                        })}
                      />
                    </div>
                    {errors.phone && (
                      <p className="mt-1 text-sm text-danger">{errors.phone.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-dark mb-2">
                      City
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted" />
                      <input
                        type="text"
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                          errors.city ? 'border-danger' : 'border-gray-300'
                        }`}
                        placeholder="Enter your city"
                        {...register('city', {
                          required: 'City is required'
                        })}
                      />
                    </div>
                    {errors.city && (
                      <p className="mt-1 text-sm text-danger">{errors.city.message}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-dark mb-2">
                    Full Address
                  </label>
                  <textarea
                    rows={3}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none ${
                      errors.address ? 'border-danger' : 'border-gray-300'
                    }`}
                    placeholder="Enter your complete address"
                    {...register('address', {
                      required: 'Address is required',
                      minLength: {
                        value: 10,
                        message: 'Address must be at least 10 characters'
                      }
                    })}
                  />
                  {errors.address && (
                    <p className="mt-1 text-sm text-danger">{errors.address.message}</p>
                  )}
                </div>
              </form>
            </motion.div>

            {/* Payment Method */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-white rounded-lg shadow-soft p-6"
            >
              <h2 className="text-xl font-semibold text-dark mb-6 flex items-center space-x-2">
                <CreditCard className="h-5 w-5 text-primary" />
                <span>Payment Method</span>
              </h2>
              
              <div className="space-y-4">
                <div
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                    paymentMethod === 'card'
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setPaymentMethod('card')}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      checked={paymentMethod === 'card'}
                      onChange={() => setPaymentMethod('card')}
                      className="text-primary"
                    />
                    <CreditCard className="h-5 w-5 text-primary" />
                    <span className="font-medium">Credit/Debit Card</span>
                  </div>
                  <p className="text-sm text-muted mt-2 ml-8">
                    Pay securely with your credit or debit card
                  </p>
                </div>
                
                <div
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                    paymentMethod === 'cod'
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setPaymentMethod('cod')}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="text-primary"
                    />
                    <Truck className="h-5 w-5 text-primary" />
                    <span className="font-medium">Cash on Delivery</span>
                  </div>
                  <p className="text-sm text-muted mt-2 ml-8">
                    Pay when your order is delivered
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-white rounded-lg shadow-soft p-6 h-fit"
          >
            <h2 className="text-xl font-semibold text-dark mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              {checkoutItems.map((item) => (
                <div key={`${item.product.id}-${item.product.selectedSize}`} className="flex items-center space-x-4">
                  <img
                    src={item.product.images?.[0]?.url || 'https://via.placeholder.com/80x80'}
                    alt={item.product.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-dark">{item.product.name}</h3>
                    {item.product.selectedSize && (
                      <p className="text-sm text-muted">Size: {item.product.selectedSize}</p>
                    )}
                    <p className="text-sm text-muted">Qty: {item.quantity}</p>
                  </div>
                  <span className="font-semibold text-dark">
                    NPR {(item.product.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
            
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-muted">Subtotal</span>
                <span className="font-medium">NPR {checkoutTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Shipping</span>
                <span className="font-medium">
                  {shippingCost === 0 ? 'Free' : `NPR ${shippingCost}`}
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold text-dark border-t pt-2">
                <span>Total</span>
                <span>NPR {finalTotal.toLocaleString()}</span>
              </div>
            </div>
            
            <button
              onClick={handleSubmit(onSubmit)}
              disabled={isProcessing}
              className="w-full btn btn-primary py-4 mt-6 text-lg font-semibold flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Lock className="h-5 w-5" />
                  <span>Place Order</span>
                </>
              )}
            </button>
            
            <div className="mt-4 text-center">
              <div className="flex items-center justify-center space-x-2 text-sm text-muted">
                <CheckCircle className="h-4 w-4 text-accent" />
                <span>Secure & encrypted payment</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;