import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { clearCart } from '../store/slices/cartSlice';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Lock, ArrowLeft, CheckCircle } from 'lucide-react';
import { orderAPI } from '../utils/api';

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { items, total } = useSelector((state) => state.cart);

  const [paymentMethod, setPaymentMethod] = useState('khalti');
  const [isProcessing, setIsProcessing] = useState(false);

  const checkoutItems = location.state?.items || items;
  const checkoutTotal = location.state?.total || total;

  const { register, handleSubmit, setValue, formState: { errors } } = useForm();

  useEffect(() => {
    if (!isAuthenticated) navigate('/login', { state: { from: location } });
  }, [isAuthenticated, navigate, location]);

  useEffect(() => {
    if (user) {
      setValue('email', user.email);
      setValue('name', user.name);
    }
  }, [user, setValue]);

  useEffect(() => {
    if (!checkoutItems || checkoutItems.length === 0) navigate('/cart');
  }, [checkoutItems, navigate]);

  const shippingCost = checkoutTotal > 5000 ? 0 : 200;
  const finalTotal = checkoutTotal + shippingCost;

  const onSubmit = async (data) => {
    setIsProcessing(true);
    try {
      const orderData = {
        items: checkoutItems.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          price: item.product.price,
          size: item.product.selectedSize || null
        })),
        shippingAddress: {
          fullName: data.name,
          email: data.email,
          phone: data.phone,
          address: data.address,
          city: data.city,
          postalCode: data.postalCode || '44600'
        },
        paymentMethod: paymentMethod.toUpperCase(),
        shippingCost,
      };

      const response = await orderAPI.createOrder(orderData);

      if (response.data.success) {
        if (!location.state?.items) dispatch(clearCart());
        toast.success('Order placed successfully!');
        navigate('/payment-selection', { state: { order: response.data.data.order, paymentMethod, totalAmount: finalTotal } });
      } else {
        throw new Error(response.data.message || 'Failed to create order');
      }
    } catch (error) {
      console.error('Order creation error:', error);
      toast.error(error.response?.data?.error || 'Failed to place order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isAuthenticated || !checkoutItems || checkoutItems.length === 0) return null;

  return (
    <div className="min-h-screen bg-neutral py-8">
      <div className="container">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center space-x-4 mb-8">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white rounded-lg transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-3xl font-bold text-dark">Checkout</h1>
        </motion.div>

        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow-soft p-6">
          <h2 className="text-xl font-semibold text-dark mb-6">Order Summary</h2>
          <div className="space-y-4 mb-6">
            {checkoutItems.map((item) => (
              <div key={item.product.id} className="flex items-center space-x-4">
                <img
                  src={item.product.image?.url || 'https://placehold.co/80x80'}
                  alt={item.product.name}
                  className="w-16 h-16 object-cover rounded"
                />
                <div className="flex-1">
                  <h3 className="font-medium text-dark">{item.product.name}</h3>
                  {item.product.selectedSize && <p className="text-sm text-muted">Size: {item.product.selectedSize}</p>}
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
              <span className="font-medium">{shippingCost === 0 ? 'Free' : `NPR ${shippingCost}`}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-dark border-t pt-2">
              <span>Total</span>
              <span>NPR {finalTotal.toLocaleString()}</span>
            </div>
          </div>

          <button onClick={handleSubmit(onSubmit)} disabled={isProcessing} className="w-full btn btn-primary py-4 mt-6 text-lg font-semibold flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed">
            {isProcessing ? 'Processing...' : (<><Lock className="h-5 w-5" /> <span>Place Order</span></>)}
          </button>

          <div className="mt-4 text-center flex items-center justify-center space-x-2 text-sm text-muted">
            <CheckCircle className="h-4 w-4 text-accent" />
            <span>Secure & encrypted payment</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
