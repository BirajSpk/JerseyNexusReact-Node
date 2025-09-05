import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5003/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  // Don't set default Content-Type - let it be determined by request data
});

// Request interceptor to add auth token and handle content types
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // If body is FormData, let the browser set the correct headers
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    } else {
      // For plain objects we can set JSON explicitly
      config.headers['Content-Type'] = 'application/json';
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const apiError = error.response?.data?.error;
    const message = apiError || 'Something went wrong';
    const isLoginRequest = error.config?.url?.includes('/auth/login');
    const isRegisterRequest = error.config?.url?.includes('/auth/register');

    if (status === 401) {
      // Distinguish between missing token, invalid token, and expired token
      if (apiError === 'Missing token') {
        // Authentication required
        toast.error('Authentication required. Please login.');
      } else if (apiError === 'Invalid token') {
        toast.error('Invalid session. Please login again.');
        localStorage.removeItem('token');
        window.location.href = '/login';
      } else if (apiError === 'Token expired') {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('token');
        window.location.href = '/login';
      } else {
        // Generic unauthorized
        if (!isLoginRequest && !isRegisterRequest) {
          toast.error(message);
        }
      }
    } else if (status >= 500) {
      toast.error('Server error. Please try again later.');
    } else {
      // Don't show toast for login/register errors - let the forms handle them
      if (!isLoginRequest && !isRegisterRequest) {
        toast.error(message);
      }
    }

    return Promise.reject(error);
  }
);

// API Methods
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
  verifyToken: () => api.get('/auth/verify'),
};

export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  changePassword: (data) => api.put('/users/change-password', data),
  // Admin endpoints
  getUsers: (params) => api.get('/users', { params }),
  getUserById: (id) => api.get(`/users/${id}`),
  createUser: (data) => api.post('/users', data),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  updateUserRole: (id, role) => api.put(`/users/${id}/role`, { role }),
  deleteUser: (id) => api.delete(`/users/${id}`),
  getUserStats: () => api.get('/users/stats'),
};

export const productAPI = {
  getProducts: (params) => api.get('/products', { params }),
  getProductById: (id) => api.get(`/products/${id}`),
  getProductBySlug: (slug) => api.get(`/products/slug/${slug}`),
  searchProducts: (query, params) => api.get(`/products/search?q=${encodeURIComponent(query)}`, { params }),
  createProduct: (data) => api.post('/products', data),
  updateProduct: (id, data) => api.put(`/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/products/${id}`),
  getFeaturedProducts: () => api.get('/products?featured=true'),
  getProductsByCategory: (categoryId) => api.get(`/products?categoryId=${categoryId}`),

  // Product image management
  uploadProductImages: (productId, formData) => api.post(`/products/${productId}/images`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteProductImage: (productId, imageId) => api.delete(`/products/${productId}/images/${imageId}`),
  updateProductImage: (productId, imageId, data) => api.put(`/products/${productId}/images/${imageId}`, data),
  reorderProductImages: (productId, imageOrders) => api.put(`/products/${productId}/images/reorder`, { imageOrders }),
};

export const categoryAPI = {
  getCategories: (params) => api.get('/categories', { params }),
  getCategoryById: (id) => api.get(`/categories/${id}`),
  createCategory: (data) => api.post('/categories', data),
  updateCategory: (id, data) => api.put(`/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/categories/${id}`),
  getProductCategories: () => api.get('/categories?type=PRODUCT'),
  getBlogCategories: () => api.get('/categories?type=BLOG'),
};

export const orderAPI = {
  getOrders: (params) => api.get('/orders', { params }),
  getOrderById: (id) => api.get(`/orders/${id}`),
  createOrder: (data) => api.post('/orders', data),
  updateOrderStatus: (id, data) => api.put(`/orders/${id}`, data),
  deleteOrder: (id) => api.delete(`/orders/${id}`),
};

export const paymentAPI = {
  initiateKhalti: (data) => api.post('/payments/khalti/initiate', data),
  verifyKhalti: (data) => api.post('/payments/khalti/verify', data),
  initiateEsewa: (data) => api.post('/payments/esewa/initiate', data),
  verifyEsewa: (data) => api.post('/payments/esewa/verify', data),
  checkEsewaStatus: (transactionUuid) => api.get(`/payments/esewa/status/${transactionUuid}`),
  processCOD: (data) => api.post('/payments/cod/process', data),
  // New methods for payment with order data (no pre-created order)
  initiateKhaltiWithOrderData: (data) => api.post('/payments/khalti/initiate-with-order', data),
  initiateEsewaWithOrderData: (data) => api.post('/payments/esewa/initiate-with-order', data),
  // Khalti KPG-2 methods
  initiateKhaltiV2: (data) => api.post('/payments/khalti/initiate-v2', data),
  verifyKhaltiV2: (data) => api.post('/payments/khalti/verify-v2', data),
};

export const uploadAPI = {
  uploadProfile: (formData) => {
    return api.post('/uploads/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  uploadEditor: (formData) => {
    return api.post('/uploads/editor', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  uploadProducts: (formData) => {
    return api.post('/uploads/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  deleteFile: (filepath) => api.delete('/uploads/delete', { data: { filepath } }),
};

export const reviewAPI = {
  getReviews: (params) => api.get('/reviews', { params }),
  createReview: (data) => api.post('/reviews', data),
  updateReview: (id, data) => api.put(`/reviews/${id}`, data),
  deleteReview: (id) => api.delete(`/reviews/${id}`),
  getProductReviews: (productId) => api.get(`/reviews?productId=${productId}`),
};

export const blogAPI = {
  getBlogs: (params) => api.get('/blogs', { params }),
  getBlogById: (id) => api.get(`/blogs/${id}`),
  getBlogBySlug: (slug) => api.get(`/blogs/slug/${slug}`),
  createBlog: (data) => api.post('/blogs', data),
  updateBlog: (id, data) => api.put(`/blogs/${id}`, data),
  deleteBlog: (id) => api.delete(`/blogs/${id}`),
  getPublishedBlogs: () => api.get('/blogs?published=true'),
};

export default api;