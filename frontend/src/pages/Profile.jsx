import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from '../utils/forms'; // Temporary form wrapper
import { motion, AnimatePresence } from '../utils/motion.jsx'; // Temporary motion wrapper
import {
  User,
  Mail,
  Phone,
  MapPin,
  Camera,
  Save,
  Loader,
  Edit,
  X,
  Shield,
  Package,
  Heart,
  LogOut,
  ShoppingCart,
  Trash2,
  Star
} from '../components/ui/ProfessionalIcon';
import toast from 'react-hot-toast';
import { userAPI, uploadAPI, orderAPI, paymentAPI } from '../utils/api';
import { updateProfile, logout } from '../store/slices/authSlice';
import { removeFromWishlist, clearWishlist } from '../store/slices/wishlistSlice';
import { addToCart } from '../store/slices/cartSlice';
import ImageCropper from '../components/ImageCropper';
import WebSocketService from '../services/websocket';

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const wishlistItems = useSelector(state => state.wishlist.items);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [activeTab, setActiveTab] = useState(() => {
    const tab = searchParams.get('tab');
    return tab && ['profile', 'orders', 'wishlist'].includes(tab) ? tab : 'profile';
  });
  const [profileData, setProfileData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty }
  } = useForm();

  // Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await userAPI.getProfile();
        const userData = response.data.data.user;
        setProfileData(userData);
        
        // Set form values
        setValue('name', userData.name || '');
        setValue('email', userData.email || '');
        setValue('phone', userData.phone || '');
        
        if (userData.address && typeof userData.address === 'object') {
          setValue('address.street', userData.address.street || '');
          setValue('address.city', userData.address.city || '');
          setValue('address.state', userData.address.state || '');
          setValue('address.postalCode', userData.address.postalCode || '');
          setValue('address.country', userData.address.country || 'Nepal');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to load profile data');
      }
    };

    if (isAuthenticated) {
      fetchProfile();
    }
  }, [isAuthenticated, setValue]);

  // Fetch user orders
  const fetchOrders = async () => {
    if (!isAuthenticated) return;

    setOrdersLoading(true);
    try {
      const response = await orderAPI.getOrders();
      if (response.data.success) {
        setOrders(response.data.data.orders || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load order history');
    } finally {
      setOrdersLoading(false);
    }
  };

  // Fetch orders when orders tab is active
  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [activeTab, isAuthenticated]);

  // Handle payment retry for pending Khalti orders
  const handleRetryPayment = async (order) => {
    try {
      const response = await paymentAPI.initiateKhalti({
        orderId: order.id,
        amount: order.totalAmount * 100,
        productName: `Order #${order.id.slice(-8)}`
      });

      if (response.data.success) {
        const { payment_url } = response.data.data;
        toast.success('🚀 Redirecting to Khalti Payment...', {
          duration: 2000,
          style: { background: '#8B5CF6', color: '#fff' },
        });
        setTimeout(() => {
          window.location.href = payment_url;
        }, 1500);
      }
    } catch (error) {
      console.error('Payment retry error:', error);
      toast.error('Failed to initiate payment. Please try again.');
    }
  };

  // Listen for profile updates via WebSocket
  useEffect(() => {
    const handleProfileUpdate = (updatedData) => {
      setProfileData(updatedData);
      dispatch(updateProfile(updatedData));
    };

    WebSocketService.onProfileUpdate(handleProfileUpdate);

    return () => {
      WebSocketService.removeCallbacks();
    };
  }, [dispatch]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const updateData = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: {
          street: data.address?.street || '',
          city: data.address?.city || '',
          state: data.address?.state || '',
          postalCode: data.address?.postalCode || '',
          country: data.address?.country || 'Nepal'
        }
      };

      const response = await userAPI.updateProfile(updateData);
      const updatedUser = response.data.data.user;
      
      setProfileData(updatedUser);
      dispatch(updateProfile(updatedUser));
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordUpdate = async ({ currentPassword, newPassword }) => {
    try {
      // Call password update API
      const response = await userAPI.changePassword({
        currentPassword,
        newPassword
      });

      if (response.data.success) {
        toast.success('Password updated successfully!');
        // Reset form
        const form = document.querySelector('form[data-password-form]');
        if (form) form.reset();
      } else {
        toast.error(response.data.message || 'Failed to update password');
      }
    } catch (error) {
      console.error('Password update error:', error);
      toast.error(error.response?.data?.message || 'Failed to update password. Please try again.');
    }
  };

  const handleImageCropped = async (croppedFile) => {
    try {
      const formData = new FormData();
      formData.append('profile', croppedFile);

      const uploadResponse = await uploadAPI.uploadProfile(formData);
      const responseData = uploadResponse.data.data;

      // The backend now automatically updates the user's avatar and returns the updated user
      const updatedUser = responseData.user;

      // Update local state and Redux
      setProfileData(updatedUser);
      dispatch(updateProfile(updatedUser));

      setShowCropper(false);
      toast.success('Profile photo updated successfully!');
    } catch (error) {
      console.error('Error uploading profile photo:', error);
      toast.error(error.response?.data?.message || 'Failed to upload profile photo');
    }
  };

  const getAvatarUrl = () => {
    if (profileData?.avatar) {
      if (profileData.avatar.startsWith('http')) return profileData.avatar;
      const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5003/api').replace('/api', '');
      return `${baseUrl}${profileData.avatar.startsWith('/') ? '' : '/'}${profileData.avatar}`;
    }
    return 'https://static.vecteezy.com/system/resources/previews/005/544/718/non_2x/profile-icon-design-free-vector.jpg';
  };

  const handleLogout = () => {
    dispatch(logout());
    toast.success('Logged out successfully');
  };

  // Wishlist handlers
  const handleRemoveFromWishlist = (productId) => {
    dispatch(removeFromWishlist(productId));
  };

  const handleMoveToCart = (product) => {
    dispatch(addToCart({ product, quantity: 1 }));
    dispatch(removeFromWishlist(product.id));
    toast.success(`${product.name} moved to cart!`);
  };

  const handleClearWishlist = () => {
    if (wishlistItems.length > 0) {
      dispatch(clearWishlist());
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'orders', label: 'Orders', icon: Package },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please Login</h2>
          <p className="text-gray-600 mb-6">You need to be logged in to access your profile.</p>
          <a href="/login" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200">
                  <img
                    src={getAvatarUrl()}
                    alt={profileData?.name || 'Profile'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://static.vecteezy.com/system/resources/previews/005/544/718/non_2x/profile-icon-design-free-vector.jpg';
                    }}
                  />
                </div>
                <button
                  onClick={() => setShowCropper(true)}
                  className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors shadow-lg"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              
              {/* User Info */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {profileData?.name || 'User'}
                </h1>
                <p className="text-gray-600">{profileData?.email}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Package className="w-4 h-4" />
                    {profileData?._count?.orders || 0} Orders
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="w-4 h-4" />
                    {profileData?._count?.reviews || 0} Reviews
                  </span>
                </div>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-3">
              {user?.role === 'ADMIN' && (
                <a
                  href="/admin"
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                >
                  <Shield className="w-4 h-4" />
                  Admin Dashboard
                </a>
              )}
              <button
                onClick={handleLogout}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              {activeTab === 'profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                    >
                      {isEditing ? (
                        <>
                          <X className="w-4 h-4" />
                          Cancel
                        </>
                      ) : (
                        <>
                          <Edit className="w-4 h-4" />
                          Edit Profile
                        </>
                      )}
                    </button>
                  </div>

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            {...register('name', { required: 'Name is required' })}
                            disabled={!isEditing}
                            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                              !isEditing ? 'bg-gray-50 text-gray-700' : 'bg-white'
                            }`}
                            placeholder="Enter your full name"
                          />
                        </div>
                        {errors.name && (
                          <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                        )}
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            {...register('email', {
                              required: 'Email is required',
                              pattern: {
                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                message: 'Invalid email address'
                              }
                            })}
                            disabled={!isEditing}
                            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                              !isEditing ? 'bg-gray-50 text-gray-700' : 'bg-white'
                            }`}
                            placeholder="Enter your email address"
                          />
                        </div>
                        {errors.email && (
                          <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                        )}
                      </div>

                      {/* Phone */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            {...register('phone', {
                              pattern: {
                                value: /^[0-9+\-\s()]+$/,
                                message: 'Invalid phone number'
                              }
                            })}
                            disabled={!isEditing}
                            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                              !isEditing ? 'bg-gray-50 text-gray-700' : 'bg-white'
                            }`}
                            placeholder="Enter your phone number"
                          />
                        </div>
                        {errors.phone && (
                          <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                        )}
                      </div>

                      {/* Country */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Country
                        </label>
                        <select
                          {...register('address.country')}
                          disabled={!isEditing}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                            !isEditing ? 'bg-gray-50 text-gray-700' : 'bg-white'
                          }`}
                        >
                          <option value="Nepal">Nepal</option>
                          <option value="India">India</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>

                    {/* Address Section */}
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                        <MapPin className="w-5 h-5" />
                        Address Information
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Street Address
                          </label>
                          <input
                            {...register('address.street')}
                            disabled={!isEditing}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                              !isEditing ? 'bg-gray-50 text-gray-700' : 'bg-white'
                            }`}
                            placeholder="Enter your street address"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            City
                          </label>
                          <input
                            {...register('address.city')}
                            disabled={!isEditing}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                              !isEditing ? 'bg-gray-50 text-gray-700' : 'bg-white'
                            }`}
                            placeholder="Enter your city"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            State/Province
                          </label>
                          <input
                            {...register('address.state')}
                            disabled={!isEditing}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                              !isEditing ? 'bg-gray-50 text-gray-700' : 'bg-white'
                            }`}
                            placeholder="Enter your state/province"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Postal Code
                          </label>
                          <input
                            {...register('address.postalCode')}
                            disabled={!isEditing}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                              !isEditing ? 'bg-gray-50 text-gray-700' : 'bg-white'
                            }`}
                            placeholder="Enter postal code"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Save Button */}
                    {isEditing && (
                      <div className="flex justify-end pt-6 border-t">
                        <button
                          type="submit"
                          disabled={isLoading || !isDirty}
                          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                        >
                          {isLoading ? (
                            <>
                              <Loader className="w-5 h-5 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="w-5 h-5" />
                              Save Changes
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </form>
                </motion.div>
              )}

              {activeTab === 'orders' && (
                <motion.div
                  key="orders"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Order History</h2>

                  {ordersLoading ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading orders...</p>
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-12">
                      <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600 mb-4">No orders found</p>
                      <a href="/products" className="text-blue-600 hover:text-blue-700 font-medium">
                        Start Shopping
                      </a>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div key={order.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h3 className="font-semibold text-gray-900">Order #{order.id.slice(-8)}</h3>
                              <p className="text-sm text-gray-600">
                                {new Date(order.createdAt).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-900">NPR {order.totalAmount.toLocaleString()}</p>
                              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                                order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                                order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-800' :
                                order.status === 'PROCESSING' ? 'bg-yellow-100 text-yellow-800' :
                                order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {order.status}
                              </span>
                            </div>
                          </div>

                          <div className="border-t pt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-medium text-gray-900 mb-2">Items ({order.items?.length || 0})</h4>
                                <div className="space-y-2">
                                  {order.items?.slice(0, 2).map((item) => (
                                    <div key={item.id} className="flex items-center space-x-3">
                                      <img
                                        src={item.product?.images || 'https://placehold.co/40x40/e5e7eb/6b7280?text=Product'}
                                        alt={item.product?.name}
                                        className="w-10 h-10 object-cover rounded"
                                        onError={(e) => {
                                          e.target.src = 'https://placehold.co/40x40/e5e7eb/6b7280?text=Product';
                                        }}
                                      />
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                          {item.product?.name}
                                        </p>
                                        <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                                      </div>
                                    </div>
                                  ))}
                                  {order.items?.length > 2 && (
                                    <p className="text-xs text-gray-600">
                                      +{order.items.length - 2} more items
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div>
                                <h4 className="font-medium text-gray-900 mb-2">Shipping Address</h4>
                                <div className="text-sm text-gray-600">
                                  {typeof order.shippingAddress === 'string' ? (
                                    (() => {
                                      try {
                                        const address = JSON.parse(order.shippingAddress);
                                        return (
                                          <>
                                            <p>{address.fullName}</p>
                                            <p>{address.address}</p>
                                            <p>{address.city}</p>
                                            <p>{address.phone}</p>
                                          </>
                                        );
                                      } catch {
                                        return <p>{order.shippingAddress}</p>;
                                      }
                                    })()
                                  ) : (
                                    <>
                                      <p>{order.shippingAddress?.fullName}</p>
                                      <p>{order.shippingAddress?.address}</p>
                                      <p>{order.shippingAddress?.city}</p>
                                      <p>{order.shippingAddress?.phone}</p>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="border-t pt-4 mt-4 flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                              Payment: {order.paymentMethod === 'KHALTI' ? 'Khalti' : order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Card'}
                              {order.paymentMethod === 'KHALTI' && order.paymentStatus === 'PENDING' && (
                                <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                  Payment Pending
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              {order.paymentMethod === 'KHALTI' && order.paymentStatus === 'PENDING' && (
                                <button
                                  onClick={() => handleRetryPayment(order)}
                                  className="text-purple-600 hover:text-purple-700 font-medium text-sm bg-purple-50 px-3 py-1 rounded-md"
                                >
                                  Pay Now
                                </button>
                              )}
                              <button
                                onClick={() => navigate(`/orders/${order.id}`)}
                                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                              >
                                View Details
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'wishlist' && (
                <motion.div
                  key="wishlist"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">
                      Wishlist ({wishlistItems.length})
                    </h2>
                    {wishlistItems.length > 0 && (
                      <button
                        onClick={handleClearWishlist}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        Clear All
                      </button>
                    )}
                  </div>

                  {wishlistItems.length === 0 ? (
                    <div className="text-center py-12">
                      <Heart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600 mb-2">Your wishlist is empty</p>
                      <p className="text-gray-500 text-sm">Add products you love to see them here</p>
                      <button
                        onClick={() => navigate('/products')}
                        className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Browse Products
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {wishlistItems.map((item) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                        >
                          <div className="relative">
                            <img
                              src={item.images || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNzUgMTUwSDIyNVYyNTBIMTc1VjE1MFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHN2Zz4K'}
                              alt={item.name}
                              className="w-full h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={() => navigate(`/products/${item.slug}`)}
                            />
                            <button
                              onClick={() => handleRemoveFromWishlist(item.id)}
                              className="absolute top-2 right-2 bg-white p-2 rounded-full shadow-md hover:bg-gray-50 transition-colors"
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </button>
                          </div>

                          <div className="p-4">
                            <h3
                              className="font-semibold text-gray-900 mb-2 cursor-pointer hover:text-blue-600 transition-colors"
                              onClick={() => navigate(`/products/${item.slug}`)}
                            >
                              {item.name}
                            </h3>

                            <div className="flex items-center mb-2">
                              <div className="flex items-center">
                                {renderStars(item.rating || 0)}
                              </div>
                              <span className="text-sm text-gray-500 ml-2">
                                ({item.reviewCount || 0})
                              </span>
                            </div>

                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-2">
                                <span className="text-lg font-bold text-gray-900">
                                  NPR {item.price?.toLocaleString()}
                                </span>
                                {item.originalPrice && item.originalPrice > item.price && (
                                  <span className="text-sm text-gray-500 line-through">
                                    NPR {item.originalPrice.toLocaleString()}
                                  </span>
                                )}
                              </div>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                item.stock > 0
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {item.stock > 0 ? 'In Stock' : 'Out of Stock'}
                              </span>
                            </div>

                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleMoveToCart(item)}
                                disabled={item.stock === 0}
                                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                              >
                                <ShoppingCart className="h-4 w-4" />
                                <span>Add to Cart</span>
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'security' && (
                <motion.div
                  key="security"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Security Settings</h2>

                  {/* Change Password Form */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <Shield className="w-5 h-5 mr-2 text-blue-600" />
                      Change Password
                    </h3>

                    <form className="space-y-4" data-password-form onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.target);
                      const currentPassword = formData.get('currentPassword');
                      const newPassword = formData.get('newPassword');
                      const confirmPassword = formData.get('confirmPassword');

                      if (newPassword !== confirmPassword) {
                        toast.error('New passwords do not match');
                        return;
                      }

                      if (newPassword.length < 6) {
                        toast.error('Password must be at least 6 characters long');
                        return;
                      }

                      // Handle password update
                      handlePasswordUpdate({ currentPassword, newPassword });
                    }}>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Current Password
                        </label>
                        <input
                          type="password"
                          name="currentPassword"
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter your current password"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          New Password
                        </label>
                        <input
                          type="password"
                          name="newPassword"
                          required
                          minLength="6"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter your new password"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          name="confirmPassword"
                          required
                          minLength="6"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Confirm your new password"
                        />
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                        >
                          Update Password
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Account Security Info */}
                  <div className="mt-6 bg-blue-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">Security Tips</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Use a strong password with at least 8 characters</li>
                      <li>• Include uppercase, lowercase, numbers, and special characters</li>
                      <li>• Don't reuse passwords from other accounts</li>
                      <li>• Change your password regularly</li>
                    </ul>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Image Cropper Modal */}
      <AnimatePresence>
        {showCropper && (
          <ImageCropper
            onImageCropped={handleImageCropped}
            onClose={() => setShowCropper(false)}
            aspectRatio={1}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;