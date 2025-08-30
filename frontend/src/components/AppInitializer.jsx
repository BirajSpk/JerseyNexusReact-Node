import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginSuccess, setLoading } from '../store/slices/authSlice';
import api from '../utils/api';

const AppInitializer = ({ children }) => {
  const dispatch = useDispatch();
  const { token, user } = useSelector((state) => state.auth);

  useEffect(() => {
    const initializeAuth = async () => {
      // If we have a token but no user data, try to fetch user profile
      if (token && !user) {
        try {
          dispatch(setLoading(true));
          
          // Try to get user profile with the stored token
          const response = await api.get('/auth/me');
          
          if (response.data.success) {
            // Restore the auth state with fresh user data
            dispatch(loginSuccess({
              user: response.data.data,
              token: token
            }));
          }
        } catch (error) {
          console.error('Failed to restore auth state:', error);
          // If token is invalid, clear it
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        } finally {
          dispatch(setLoading(false));
        }
      }
    };

    initializeAuth();
  }, [dispatch, token, user]);

  return children;
};

export default AppInitializer;
