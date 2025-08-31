import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from '../utils/motion.jsx'; // Temporary motion wrapper
import { clearCart } from '../store/slices/cartSlice';
// import { useForm } from 'react-hook-form'; // Temporarily disabled
import toast from 'react-hot-toast';
import { Lock, ArrowLeft, CheckCircle } from '../components/ui/SimpleIcon';
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

  // Temporary form state replacement for useForm
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    email: ''
  });
  const [errors, setErrors] = useState({});

  // Temporary setValue function
  const setValue = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    if (!isAuthenticated) navigate('/login', { state: { from: location } });
  }, [isAuthenticated, navigate, location]);

  useEffect(() => {
    if (user) {
      setValue('email', user.email || '');
      setValue('name', user.name || '');
    }
  }, [user]);

  useEffect(() => {
    if (!checkoutItems || checkoutItems.length === 0) navigate('/cart');
  }, [checkoutItems, navigate]);

  const shippingCost = checkoutTotal > 5000 ? 0 : 200;
  const finalTotal = checkoutTotal + shippingCost;

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsProcessing(true);
    try {
      const orderData = {
        items: checkoutItems.map(item => ({
          productId: item.id || item.product?.id,
          quantity: item.quantity,
          price: item.price || item.product?.price,
          size: item.size || item.product?.selectedSize || null
        })),
        shippingAddress: {
          fullName: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          postalCode: formData.postalCode || '44600'
        },
        paymentMethod: 'PENDING', // Will be set after payment selection
        shippingCost,
      };

      const response = await orderAPI.createOrder(orderData);

      if (response.data.success) {
        if (!location.state?.items) dispatch(clearCart());
        toast.success('Order placed successfully!');
        navigate('/payment-selection', { state: { order: response.data.data.order, totalAmount: finalTotal } });
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Shipping Form */}
          <div className="bg-white rounded-lg shadow-soft p-6">
            <h2 className="text-xl font-semibold text-dark mb-6">Shipping Information</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setValue('name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Enter your full name"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setValue('email', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Enter your email"
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setValue('phone', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Enter your phone number"
                />
                {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setValue('address', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Enter your full address"
                  rows="3"
                />
                {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setValue('city', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.city ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Enter your city"
                  />
                  {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                  <input
                    type="text"
                    value={formData.postalCode}
                    onChange={(e) => setValue('postalCode', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter postal code"
                  />
                </div>
              </div>


            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-soft p-6">
            <h2 className="text-xl font-semibold text-dark mb-6">Order Summary</h2>
          <div className="space-y-4 mb-6">
            {checkoutItems.map((item) => (
              <div key={item.id || item.product?.id} className="flex items-center space-x-4">
                <img
                  src={item.image || item.product?.image?.url || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAiIGhlaWdodD0iODAiIGZpbGw9IiNmM2Y0ZjYiLz48dGV4dCB4PSI0MCIgeT0iNDUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzljYTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+UHJvZHVjdDwvdGV4dD48L3N2Zz4K'}
                  alt={item.name || item.product?.name}
                  className="w-16 h-16 object-cover rounded"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iODAiIGhlaWdodD0iODAiIGZpbGw9IiNmM2Y0ZjYiLz48dGV4dCB4PSI0MCIgeT0iNDUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzljYTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+UHJvZHVjdDwvdGV4dD48L3N2Zz4K';
                  }}
                />
                <div className="flex-1">
                  <h3 className="font-medium text-dark">{item.name || item.product?.name}</h3>
                  {(item.size || item.product?.selectedSize) && <p className="text-sm text-muted">Size: {item.size || item.product?.selectedSize}</p>}
                  <p className="text-sm text-muted">Qty: {item.quantity}</p>
                </div>
                <span className="font-semibold text-dark">
                  NPR {((item.price || item.product?.price) * item.quantity).toLocaleString()}
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

          <button onClick={handleSubmit} disabled={isProcessing} className="w-full btn btn-primary py-4 mt-6 text-lg font-semibold flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed">
            {isProcessing ? 'Processing...' : (<><Lock className="h-5 w-5" /> <span>Pay Now</span></>)}
          </button>

          <div className="mt-4 text-center flex items-center justify-center space-x-2 text-sm text-muted">
            <CheckCircle className="h-4 w-4 text-accent" />
            <span>Secure & encrypted payment</span>
          </div>


          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
