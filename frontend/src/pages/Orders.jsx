import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Orders = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector(state => state.auth);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/orders' } } });
    } else {
      // Redirect to profile page with orders tab active
      navigate('/profile?tab=orders', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="container py-12">
      <div className="flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-3 text-muted">Redirecting to orders...</span>
      </div>
    </div>
  );
};

export default Orders;