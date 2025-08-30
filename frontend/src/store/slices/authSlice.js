import { createSlice } from '@reduxjs/toolkit';
import WebSocketService from '../../services/websocket';

// Helper function to safely get data from localStorage
const getStoredUser = () => {
  try {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    return null;
  }
};

const getStoredToken = () => {
  try {
    return localStorage.getItem('token');
  } catch {
    return null;
  }
};

const initialState = {
  user: getStoredUser(),
  token: getStoredToken(),
  isAuthenticated: !!getStoredToken(),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    loginSuccess: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;

      // Store both token and user data in localStorage
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload.user));

      // Connect to WebSocket
      WebSocketService.connect(action.payload.token);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;

      // Remove both token and user data from localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Disconnect from WebSocket
      WebSocketService.disconnect();
    },
    updateProfile: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      // Update user data in localStorage
      localStorage.setItem('user', JSON.stringify(state.user));
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setLoading,
  setError,
  loginSuccess,
  logout,
  updateProfile,
  clearError,
} = authSlice.actions;

export default authSlice.reducer;