import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';

// Bridge page to receive Khalti return on frontend and hand off to backend verifier if needed
export default function KhaltiCallback() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const pidx = params.get('pidx');
    const orderId = sessionStorage.getItem('lastOrderId');

    if (!pidx) {
      toast.error('Missing payment reference.');
      navigate('/payment/failed');
      return;
    }

    (async () => {
      try {
        // Optional verification pathway if using direct return_url without backend redirect
        const res = await api.post('/payments/khalti/verify', { pidx, orderId });
        if (res.data.success) {
          toast.success('Payment verified successfully');
          navigate(`/order-success?orderId=${orderId || ''}&transactionId=${pidx}`);
        } else {
          navigate('/payment/failed');
        }
      } catch (err) {
        console.error('Khalti verify error:', err);
        navigate('/payment/failed');
      }
    })();
  }, [location.search, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p>Processing payment...</p>
      </div>
    </div>
  );
}

