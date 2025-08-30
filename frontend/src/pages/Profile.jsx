import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
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
  LogOut
} from 'lucide-react';
import toast from 'react-hot-toast';
import { userAPI, uploadAPI } from '../utils/api';
import { updateProfile, logout } from '../store/slices/authSlice';
import ImageCropper from '../components/ImageCropper';
import WebSocketService from '../services/websocket';

const Profile = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showCropper, setShowCropper] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState(null);

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

  const handleImageCropped = async (croppedFile) => {
    try {
      const formData = new FormData();
      formData.append('profile', croppedFile);
      
      const uploadResponse = await uploadAPI.uploadProfile(formData);
      const imageUrl = uploadResponse.data.data.url;
      
      // Update profile with new avatar
      await userAPI.updateProfile({ avatar: imageUrl });
      
      // Update local state and Redux
      const updatedUser = { ...profileData, avatar: imageUrl };
      setProfileData(updatedUser);
      dispatch(updateProfile(updatedUser));
      
      setShowCropper(false);
      toast.success('Profile photo updated successfully!');
    } catch (error) {
      console.error('Error uploading profile photo:', error);
      toast.error('Failed to upload profile photo');
    }
  };

  const getAvatarUrl = () => {
    if (profileData?.avatar) {
      // If avatar starts with 'http', it's already a full URL
      if (profileData.avatar.startsWith('http')) {
        return profileData.avatar;
      }
      // Otherwise, prepend the API base URL
      const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001';
      return `${baseUrl}${profileData.avatar}`;
    }
    return 'https://static.vecteezy.com/system/resources/previews/005/544/718/non_2x/profile-icon-design-free-vector.jpg';
  };

  const handleLogout = () => {
    dispatch(logout());
    toast.success('Logged out successfully');
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
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">Order history will be implemented here</p>
                  </div>
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
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Wishlist</h2>
                  <div className="text-center py-12">
                    <Heart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">Wishlist functionality will be implemented here</p>
                  </div>
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
                  <div className="text-center py-12">
                    <Shield className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">Security settings will be implemented here</p>
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