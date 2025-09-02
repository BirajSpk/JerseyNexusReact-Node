import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Lock, ArrowLeft, CheckCircle } from 'lucide-react';
import { clearCart } from '../store/slices/cartSlice';
import { orderAPI, paymentAPI } from '../utils/api';

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { items, total } = useSelector((state) => state.cart);

  const checkoutItems = location.state?.items || items;
  const checkoutTotal = location.state?.total ?? total;

  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [isProcessing, setIsProcessing] = useState(false);
  const [subtotal, setSubtotal] = useState(0);
  const [shippingCost, setShippingCost] = useState(0);
  const [finalTotal, setFinalTotal] = useState(0);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm();

  useEffect(() => {
    if (user) {
      setValue('name', user.name || '');
      setValue('email', user.email || '');
      setValue('phone', user.phone || '');
    }
  }, [user, setValue]);

  useEffect(() => {
    if (!isAuthenticated) navigate('/login', { state: { from: location } });
  }, [isAuthenticated, navigate, location]);

  useEffect(() => {
    if (!checkoutItems || checkoutItems.length === 0) navigate('/cart');
  }, [checkoutItems, navigate]);

  // Calculate totals when checkout items change
  useEffect(() => {
    if (checkoutItems && checkoutItems.length > 0) {
      const calculatedSubtotal = checkoutItems.reduce((sum, item) => {
        const price = item.price ?? item.product?.price ?? 0;
        const quantity = item.quantity ?? 1;
        return sum + (price * quantity);
      }, 0);

      const calculatedShipping = calculatedSubtotal > 5000 ? 0 : 200;
      const calculatedTotal = calculatedSubtotal + calculatedShipping;

      setSubtotal(calculatedSubtotal);
      setShippingCost(calculatedShipping);
      setFinalTotal(calculatedTotal);
    }
  }, [checkoutItems]);

  const onSubmit = async (data) => {
    setIsProcessing(true);
    try {
      const orderData = {
        items: checkoutItems.map(item => ({
          productId: item.id || item.product?.id,
          quantity: item.quantity ?? 1,
          size: item.size || item.product?.selectedSize,
          color: item.color || item.product?.selectedColor
        })),
        shippingAddress: {
          fullName: data.name,
          email: data.email,
          phone: data.phone,
          address: data.address,
          city: data.city,
          postalCode: data.postalCode || '44600'
        },
        paymentMethod,
        shippingCost,
        totalAmount: finalTotal
      };

      // For COD, create order immediately since no payment gateway is involved
      if (paymentMethod === 'cod') {
        const response = await orderAPI.createOrder(orderData);
        if (response.data.success) {
          const order = response.data.data.order;
          if (!location.state?.items) dispatch(clearCart());

          const codResponse = await paymentAPI.processCOD({ orderId: order.id });
          if (codResponse.data.success) {
            toast.success('COD order confirmed! You will pay on delivery.');
            navigate('/order-success', { state: { order, paymentMethod: 'cod' } });
          }
        }
      } else {
        // For online payments, initiate payment first without creating order
        if (paymentMethod === 'khalti') {
          const khaltiResponse = await paymentAPI.initiateKhaltiWithOrderData({
            orderData,
            amount: finalTotal * 100,
            productName: `JerseyNexus Order`,
            logo: 'https://avatars.githubusercontent.com/u/31564639?s=280&v=4'
          });
          if (khaltiResponse.data.success) {
            // Store order data in session storage for after payment
            sessionStorage.setItem('pendingOrderData', JSON.stringify(orderData));
            if (!location.state?.items) dispatch(clearCart());

            toast.success('🚀 Redirecting to Khalti Payment...');
            setTimeout(() => {
              window.location.href = khaltiResponse.data.data.payment_url;
            }, 1500);
          }
        } else if (paymentMethod === 'esewa') {
          const esewaResponse = await paymentAPI.initiateEsewaWithOrderData({
            orderData,
            amount: finalTotal,
            productName: `JerseyNexus Order`,
            logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQVCKHYQMq3XBec5WFf_0wPwC_kaNhqxmaVhg&s'
          });
          if (esewaResponse.data.success) {
            // Store order data in session storage for after payment
            sessionStorage.setItem('pendingOrderData', JSON.stringify(orderData));
            if (!location.state?.items) dispatch(clearCart());

            toast.success('🚀 Redirecting to eSewa Payment...');
            const { payment_url, esewaParams } = esewaResponse.data.data;
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = payment_url;
            Object.entries(esewaParams).forEach(([key, value]) => {
              const input = document.createElement('input');
              input.type = 'hidden';
              input.name = key;
              input.value = value;
              form.appendChild(input);
            });
            document.body.appendChild(form);
            form.submit();
          }
        }
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Shipping Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow-soft p-6 space-y-4">
            <h2 className="text-xl font-semibold text-dark mb-6">Shipping Information</h2>
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input {...register('name', { required: 'Full Name is required' })} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.name ? 'border-red-500' : 'border-gray-300'}`} placeholder="Enter your full name" />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
            </div>
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input {...register('email', { required: 'Email is required' })} type="email" className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.email ? 'border-red-500' : 'border-gray-300'}`} placeholder="Enter your email" />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
            </div>
            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
              <input {...register('phone', { required: 'Phone is required' })} type="tel" className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.phone ? 'border-red-500' : 'border-gray-300'}`} placeholder="Enter your phone number" />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
            </div>
            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
              <textarea {...register('address', { required: 'Address is required' })} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.address ? 'border-red-500' : 'border-gray-300'}`} rows="3" placeholder="Enter your full address" />
              {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>}
            </div>
            {/* City & Postal Code */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                <input {...register('city', { required: 'City is required' })} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.city ? 'border-red-500' : 'border-gray-300'}`} placeholder="Enter your city" />
                {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                <input {...register('postalCode')} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter postal code" />
              </div>
            </div>
            {/* Payment buttons */}
            <div className="mt-4 flex space-x-4">
              <button type="button" className={`p-2 border rounded-md ${paymentMethod==='cod'?'border-orange-500':'border-gray-300'}`} onClick={()=>setPaymentMethod('cod')}>COD</button>
              <button type="button" className={`p-2 border rounded-md ${paymentMethod==='khalti'?'border-purple-600':'border-gray-300'}`} onClick={()=>setPaymentMethod('khalti')}>
                <img src="https://avatars.githubusercontent.com/u/31564639?s=280&v=4" className="w-10 h-10" alt="Khalti"/>
              </button>
              <button type="button" className={`p-2 border rounded-md ${paymentMethod==='esewa'?'border-green-600':'border-gray-300'}`} onClick={()=>setPaymentMethod('esewa')}>
                <img src="https://cdn.esewa.com.np/ui/images/logos/esewa-icon-large.png" className="w-10 h-10" alt="eSewa"/>
              </button>
            </div>
            {/* Submit */}
            <button type="submit" disabled={isProcessing} className="w-full btn btn-primary py-4 mt-4 flex items-center justify-center space-x-2 disabled:opacity-50">
              {isProcessing ? 'Processing...' : (<><Lock className="h-5 w-5"/> <span>Pay Now</span></>)}
            </button>
          </form>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-soft p-6">
            <h2 className="text-xl font-semibold text-dark mb-6">Order Summary</h2>
            <div className="space-y-4 mb-6">
              {checkoutItems.map(item=>{
                const price = item.price ?? item.product?.price ?? 0;
                const quantity = item.quantity ?? 1;
                return (
                  <div key={item.id || item.product?.id} className="flex items-center space-x-4">
                    <img src={item.image ?? item.product?.image?.url ?? '/placeholder.png'} className="w-16 h-16 object-cover rounded" alt={item.name??item.product?.name}/>
                    <div className="flex-1">
                      <h3 className="font-medium text-dark">{item.name??item.product?.name}</h3>
                      {item.size && <p className="text-sm text-muted">Size: {item.size}</p>}
                      <p className="text-sm text-muted">Qty: {quantity}</p>
                    </div>
                    <span className="font-semibold text-dark">NPR {(price*quantity).toLocaleString()}</span>
                  </div>
                )
              })}
            </div>
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between"><span className="text-muted">Subtotal</span><span className="font-medium">NPR {subtotal.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-muted">Shipping</span><span className="font-medium">{shippingCost===0?'Free':`NPR ${shippingCost.toLocaleString()}`}</span></div>
              <div className="flex justify-between text-lg font-bold text-dark border-t pt-2"><span>Total</span><span>NPR {finalTotal.toLocaleString()}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout;
